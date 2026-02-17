import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(req) {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                points: true,
                referralCode: true,
                createdAt: true,
                _count: {
                    select: { referrals: true }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 100 // pagination later if needed
        })

        return NextResponse.json({ users })
    } catch (error) {
        console.error("Users GET Error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
