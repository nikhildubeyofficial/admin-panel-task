import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { generateCertificate } from '@/services/certificate'
import { sendCertificateEmail, sendTaskStatusEmail } from '@/services/email'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/jwt'

export async function PATCH(req, { params }) {
    try {
        const { id } = params
        const { status, reason } = await req.json()

        // Validate Status
        if (!['APPROVED', 'REJECTED'].includes(status)) {
            return NextResponse.json({ error: "Invalid status" }, { status: 400 })
        }

        // Get Admin ID from token for audit log
        const cookieStore = await cookies()
        const token = cookieStore.get('token')?.value
        let adminId = null
        if (token) {
            const payload = verifyToken(token)
            if (payload) adminId = payload.id
        }

        // Transaction
        const result = await prisma.$transaction(async (tx) => {
            // 1. Get submission to verify existence and get details
            const submission = await tx.taskSubmission.findUnique({
                where: { id },
                include: { task: true, user: true }
            })

            if (!submission) {
                throw new Error("Submission not found")
            }

            if (submission.status !== 'PENDING') {
                throw new Error("Submission already processed")
            }

            // 2. Update Submission
            const updatedSubmission = await tx.taskSubmission.update({
                where: { id },
                data: {
                    status,
                    rejectionReason: status === 'REJECTED' ? reason : null,
                    adminComment: status === 'APPROVED' ? "Approved by admin" : null,
                }
            })

            // 3. If Approved, Credit Points & Create Certificate Record
            let certificate = null
            if (status === 'APPROVED') {
                await tx.user.update({
                    where: { id: submission.userId },
                    data: {
                        points: { increment: submission.task.points }
                    }
                })

                // Create Certificate Record
                certificate = await tx.certificate.create({
                    data: {
                        userId: submission.userId,
                        courseName: submission.task.title,
                        accessCode: `CERT-${Date.now()}-${submission.userId.slice(0, 5)}`,
                        pdfUrl: "PENDING_GENERATION", // Placeholder, updated later if strict
                    }
                })
            }

            // 4. Audit Log
            await tx.auditLog.create({
                data: {
                    adminId,
                    action: status === 'APPROVED' ? 'APPROVE_TASK' : 'REJECT_TASK',
                    entityId: id,
                    entityType: 'TASK_SUBMISSION',
                    details: reason || `Points credited: ${submission.task.points}`,
                }
            })

            return { updatedSubmission, certificate, user: submission.user, task: submission.task }
        })

        // Post-Transaction: Async Certificate Generation
        // Post-Transaction: Async Email Notifications
        try {
            if (status === 'APPROVED' && result.certificate) {
                // Generate PDF
                const { buffer, url } = await generateCertificate(result.user.name, result.task.title)

                // Update certificate URL in DB
                await prisma.certificate.update({
                    where: { id: result.certificate.id },
                    data: { pdfUrl: url }
                })

                // Send Certificate Email (includes approval msg)
                await sendCertificateEmail(result.user.email, result.user.name, buffer, result.task.title)

                // Optionally send generic approval email too, but certificate email covers it.
                // Or send explicit task status email:
                await sendTaskStatusEmail(result.user.email, result.user.name, result.task.title, 'APPROVED')

            } else if (status === 'REJECTED') {
                // Send Rejection Email
                await sendTaskStatusEmail(result.user.email, result.user.name, result.task.title, 'REJECTED', reason)
            }
        } catch (genError) {
            console.error("Post-processing notification error:", genError)
            // Log but don't fail request
        }

        return NextResponse.json({ success: true, submission: result.updatedSubmission })

    } catch (error) {
        console.error("Update error:", error)
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
    }
}
