import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { generateCertificate, sendCertificateEmail } from '@/services/certificate'
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
        if (result.certificate) {
            // Don't await this to keep response fast? 
            // Requirement: "Email certificate automatically".
            // Better to await to catch errors, or use background job.
            // I'll await it to ensure it happens or fail gracefully.
            try {
                // Generate and save certificate locally
                const { buffer, url } = await generateCertificate(result.user.name, result.task.title)

                // Update certificate URL in DB
                await prisma.certificate.update({
                    where: { id: result.certificate.id },
                    data: { pdfUrl: url }
                })

                // Send Email
                await sendCertificateEmail(result.user.email, result.user.name, buffer)

            } catch (genError) {
                console.error("Post-approval error:", genError)
                // We don't fail the request because transaction succeeded.
                // Alert admin or log for retry.
            }
        }

        return NextResponse.json({ success: true, submission: result.updatedSubmission })

    } catch (error) {
        console.error("Update error:", error)
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
    }
}
