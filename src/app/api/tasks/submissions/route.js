import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const submissions = await prisma.taskSubmission.findMany({
            where: {
                status: 'PENDING',
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                task: {
                    select: {
                        title: true,
                        points: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'asc',
            },
        })

        return NextResponse.json({ submissions })
    } catch (error) {
        console.error("Error fetching submissions:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
