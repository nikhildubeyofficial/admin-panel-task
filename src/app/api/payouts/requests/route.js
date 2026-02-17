import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const requests = await prisma.redeemRequest.findMany({
            where: {
                // Show all requests for history
                // status: { in: ['PENDING', 'APPROVED'] }
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        points: true,
                    }
                },
                payout: true, // Include existing payout info if APPROVED
            },
            orderBy: { createdAt: 'asc' }
        })

        return NextResponse.json({ requests })
    } catch (error) {
        console.error("Payouts GET Error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
