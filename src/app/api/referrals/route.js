import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const referrals = await prisma.user.findMany({
            where: {
                referredByCode: { not: null }
            },
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
                referredBy: {
                    select: {
                        name: true,
                        email: true,
                        referralCode: true,
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json({ referrals })
    } catch (error) {
        console.error("Referrals GET Error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
