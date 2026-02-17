import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { updateTaskSchema } from '@/lib/validations/task'
import { verifyToken } from '@/lib/jwt'
import { cookies } from 'next/headers'

export async function PUT(req, { params }) {
    try {
        const { id } = params

        // Get admin ID
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
        const validatedData = updateTaskSchema.parse(body)

        // Update task
        const task = await prisma.task.update({
            where: { id },
            data: {
                ...(validatedData.title && { title: validatedData.title }),
                ...(validatedData.description && { description: validatedData.description }),
                ...(validatedData.points !== undefined && { points: validatedData.points }),
                ...(validatedData.deadline !== undefined && {
                    deadline: validatedData.deadline ? new Date(validatedData.deadline) : null
                }),
                ...(validatedData.category !== undefined && { category: validatedData.category }),
                ...(validatedData.proofRequired !== undefined && { proofRequired: validatedData.proofRequired }),
                ...(validatedData.requirements && { requirements: validatedData.requirements }),
                ...(validatedData.status && {
                    status: validatedData.status,
                    isActive: validatedData.status === 'ACTIVE'
                }),
            }
        })

        // Audit log
        await prisma.auditLog.create({
            data: {
                adminId,
                action: 'UPDATE_TASK',
                entityId: id,
                entityType: 'TASK',
                details: `Updated task: ${task.title}`
            }
        })

        return NextResponse.json({ success: true, task })

    } catch (error) {
        console.error('Update Task Error:', error)

        if (error.name === 'ZodError') {
            return NextResponse.json({
                error: 'Validation failed',
                details: error.errors
            }, { status: 400 })
        }

        if (error.code === 'P2025') {
            return NextResponse.json({ error: 'Task not found' }, { status: 404 })
        }

        return NextResponse.json({ error: 'Failed to update task' }, { status: 500 })
    }
}

export async function DELETE(req, { params }) {
    try {
        const { id } = params

        // Get admin ID
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

        // Soft delete - archive the task
        const task = await prisma.task.update({
            where: { id },
            data: {
                status: 'ARCHIVED',
                isActive: false
            }
        })

        // Audit log
        await prisma.auditLog.create({
            data: {
                adminId,
                action: 'DELETE_TASK',
                entityId: id,
                entityType: 'TASK',
                details: `Archived task: ${task.title}`
            }
        })

        return NextResponse.json({ success: true, message: 'Task archived successfully' })

    } catch (error) {
        console.error('Delete Task Error:', error)

        if (error.code === 'P2025') {
            return NextResponse.json({ error: 'Task not found' }, { status: 404 })
        }

        return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 })
    }
}
