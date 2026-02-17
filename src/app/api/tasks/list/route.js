import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url)
        const status = searchParams.get('status') || undefined
        const category = searchParams.get('category') || undefined
        const search = searchParams.get('search') || undefined
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '10')
        const skip = (page - 1) * limit

        // Build where clause
        const where = {}

        if (status && status !== 'ALL') {
            where.status = status
        }

        if (category) {
            where.category = category
        }

        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } }
            ]
        }

        // Fetch tasks with pagination
        const [tasks, total] = await Promise.all([
            prisma.task.findMany({
                where,
                include: {
                    creator: {
                        select: { name: true, email: true }
                    },
                    _count: {
                        select: { submissions: true }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit
            }),
            prisma.task.count({ where })
        ])

        return NextResponse.json({
            tasks,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        })

    } catch (error) {
        console.error('List Tasks Error:', error)
        return NextResponse.json({
            error: 'Failed to fetch tasks'
        }, { status: 500 })
    }
}
