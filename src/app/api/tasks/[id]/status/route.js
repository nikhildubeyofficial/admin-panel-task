import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { toggleStatusSchema } from '@/lib/validations/task'
import { verifyToken } from '@/lib/jwt'
import { cookies } from 'next/headers'

export async function PATCH(req, { params }) {
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
        const { status } = toggleStatusSchema.parse(body)

        // Update task status
        const task = await prisma.task.update({
            where: { id },
            data: {
                status,
                isActive: status === 'ACTIVE'
            }
        })

        // Audit log
        await prisma.auditLog.create({
            data: {
                adminId,
                action: 'TOGGLE_TASK_STATUS',
                entityId: id,
                entityType: 'TASK',
                details: `Changed task status to ${status}: ${task.title}`
            }
        })

        return NextResponse.json({ success: true, task })

    } catch (error) {
        console.error('Toggle Status Error:', error)

        if (error.name === 'ZodError') {
            return NextResponse.json({
                error: 'Validation failed',
                details: error.errors
            }, { status: 400 })
        }

        if (error.code === 'P2025') {
            return NextResponse.json({ error: 'Task not found' }, { status: 404 })
        }

        return NextResponse.json({ error: 'Failed to toggle status' }, { status: 500 })
    }
}
