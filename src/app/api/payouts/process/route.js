import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { verifyToken } from '@/lib/jwt'
import { cookies } from 'next/headers'
import { sendPayoutStatusEmail } from '@/services/email'

export async function POST(req) {
    try {
        const { id, action, transactionId, adminNote } = await req.json()

        // Get Admin ID
        const cookieStore = await cookies()
        const token = cookieStore.get('token')?.value
        let adminId = null
        if (token) {
            const payload = verifyToken(token)
            if (payload) adminId = payload.id
        }

        const result = await prisma.$transaction(async (tx) => {
            const request = await tx.redeemRequest.findUnique({
                where: { id },
                include: { user: true }
            })

            if (!request) throw new Error("Request not found")

            // REJECT Logic
            if (action === 'REJECT') {
                if (request.status !== 'PENDING') {
                    throw new Error("Can only reject pending requests")
                }

                // Update request status
                await tx.redeemRequest.update({
                    where: { id },
                    data: { status: 'REJECTED', adminNote: adminNote || "Rejected by admin" }
                })

                // Refund points
                await tx.user.update({
                    where: { id: request.userId },
                    data: { points: { increment: request.amount } }
                })

                await tx.auditLog.create({
                    data: {
                        adminId,
                        action: 'REJECT_PAYOUT',
                        entityId: id,
                        entityType: 'REDEEM_REQUEST',
                        details: `Refunded ${request.amount} points`
                    }
                })

                // Send Email (Safe)
                try {
                    await sendPayoutStatusEmail(request.user.email, request.user.name, request.amount, 'REJECTED', adminNote)
                } catch (e) {
                    console.error("Email failed", e)
                }

                return { status: 'REJECTED' }
            }

            // APPROVE Logic
            if (action === 'APPROVE') {
                if (request.status !== 'PENDING') {
                    throw new Error("Can only approve pending requests")
                }

                // Convert points to amount (e.g., 100 points = $1.00)
                const amount = request.amount * 0.01

                const payout = await tx.payout.create({
                    data: {
                        userId: request.userId,
                        redeemRequestId: request.id,
                        amount: amount,
                        status: 'PENDING',
                        gateway: 'MANUAL',
                    }
                })

                await tx.redeemRequest.update({
                    where: { id },
                    data: { status: 'APPROVED', adminNote: adminNote || null }
                })

                await tx.auditLog.create({
                    data: {
                        adminId,
                        action: 'APPROVE_PAYOUT',
                        entityId: id,
                        entityType: 'REDEEM_REQUEST',
                        details: `Approved for $${amount}`
                    }
                })

                // Send Email (Safe)
                try {
                    await sendPayoutStatusEmail(request.user.email, request.user.name, request.amount, 'APPROVED', `Amount: $${amount}`)
                } catch (e) {
                    console.error("Email failed", e)
                }

                return { status: 'APPROVED', payout }
            }

            // COMPLETE Logic
            if (action === 'COMPLETE') {
                // Find associated Payout
                const payout = await tx.payout.findUnique({
                    where: { redeemRequestId: id }
                })

                if (!payout) throw new Error("Payout record not found")
                if (payout.status === 'COMPLETED') throw new Error("Already completed")

                await tx.payout.update({
                    where: { id: payout.id },
                    data: {
                        status: 'COMPLETED',
                        transactionId: transactionId || `TX-${Date.now()}`,
                        processedAt: new Date()
                    }
                })

                await tx.redeemRequest.update({
                    where: { id },
                    data: { status: 'PAID' }
                })

                await tx.auditLog.create({
                    data: {
                        adminId,
                        action: 'COMPLETE_PAYOUT',
                        entityId: payout.id,
                        entityType: 'PAYOUT',
                        details: transactionId ? `TX: ${transactionId}` : 'Manual completion'
                    }
                })

                // Send Email (Safe)
                try {
                    await sendPayoutStatusEmail(request.user.email, request.user.name, request.amount, 'PAID', transactionId)
                } catch (e) {
                    console.error("Email failed", e)
                }

                return { status: 'PAID' }
            }

            throw new Error("Invalid action")
        })

        return NextResponse.json({ success: true, result })

    } catch (error) {
        console.error("Process Payout Error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
