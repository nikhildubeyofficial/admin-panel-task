import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { createTaskSchema } from '@/lib/validations/task'
import { verifyToken } from '@/lib/jwt'
import { cookies } from 'next/headers'

export async function POST(req) {
    try {
        // Get admin ID from token
        const cookieStore = await cookies()
        const token = cookieStore.get('token')?.value
        let adminId = null

        if (token) {
            const payload = verifyToken(token)
            if (payload) adminId = payload.id
        }

        if (!adminId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await req.json()

        // Validate input
        const validatedData = createTaskSchema.parse(body)

        // Create task
        const task = await prisma.task.create({
            data: {
                title: validatedData.title,
                description: validatedData.description,
                points: validatedData.points,
                deadline: validatedData.deadline ? new Date(validatedData.deadline) : null,
                category: validatedData.category,
                proofRequired: validatedData.proofRequired,
                requirements: validatedData.requirements || [],
                status: validatedData.status,
                isActive: validatedData.status === 'ACTIVE',
                createdBy: adminId
            }
        })

        // Create audit log
        await prisma.auditLog.create({
            data: {
                adminId,
                action: 'CREATE_TASK',
                entityId: task.id,
                entityType: 'TASK',
                details: `Created task: ${task.title}`
            }
        })

        return NextResponse.json({ success: true, task }, { status: 201 })

    } catch (error) {
        console.error('Create Task Full Error Details:', {
            name: error.name,
            message: error.message,
            code: error.code,
            stack: error.stack
        })

        if (error.name === 'ZodError') {
            return NextResponse.json({
                error: 'Validation failed',
                details: error.errors
            }, { status: 400 })
        }

        return NextResponse.json({
            error: 'Failed to create task',
            message: error.message,
            code: error.code
        }, { status: 500 })
    }
}
