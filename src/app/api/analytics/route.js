import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date()
            d.setDate(d.getDate() - i)
            return d.toISOString().split('T')[0]
        }).reverse()

        const [
            totalUsers,
            totalReferrals,
            pendingTasks,
            pendingRedeems,
            totalPayouts,
            certificatesGenerated,
            approvedTasks,
            totalTasks,
            activeTasks,
            usersByDay
        ] = await Promise.all([
            prisma.user.count(),
            prisma.user.count({ where: { referredByCode: { not: null } } }),
            prisma.taskSubmission.count({ where: { status: 'PENDING' } }),
            prisma.redeemRequest.count({ where: { status: 'PENDING' } }),
            prisma.payout.aggregate({
                _sum: { amount: true },
                where: { status: 'COMPLETED' }
            }),
            prisma.certificate.count(),
            prisma.taskSubmission.count({ where: { status: 'APPROVED' } }),
            prisma.task.count(),
            prisma.task.count({ where: { status: 'ACTIVE' } }),
            prisma.user.groupBy({
                by: ['createdAt'],
                where: {
                    createdAt: {
                        gte: new Date(new Date().setDate(new Date().getDate() - 7))
                    }
                },
                _count: { id: true },
            })
        ])

        // Format data for chart
        const recentUsers = await prisma.user.findMany({
            where: {
                createdAt: {
                    gte: new Date(new Date().setDate(new Date().getDate() - 7))
                }
            },
            select: { createdAt: true }
        })

        const trendData = last7Days.map(date => {
            const count = recentUsers.filter(u => u.createdAt.toISOString().startsWith(date)).length
            return { date, count }
        })

        // Fetch recent activity from audit logs
        const recentActivity = await prisma.auditLog.findMany({
            take: 10,
            orderBy: { createdAt: 'desc' },
            include: {
                admin: {
                    select: { name: true, email: true }
                }
            }
        })

        return NextResponse.json({
            totalUsers,
            totalReferrals,
            pendingTasks,
            pendingRedeems,
            totalPayouts: totalPayouts._sum.amount || 0,
            certificatesGenerated,
            approvedTasks,
            totalTasks,
            activeTasks,
            trendData,
            recentActivity
        })
    } catch (error) {
        console.error("Analytics Error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
