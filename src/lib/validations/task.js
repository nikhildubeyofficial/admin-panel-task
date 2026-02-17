import { z } from 'zod'

export const createTaskSchema = z.object({
    title: z.string()
        .min(5, 'Title must be at least 5 characters')
        .max(200, 'Title must not exceed 200 characters'),
    description: z.string()
        .min(10, 'Description must be at least 10 characters'),
    points: z.number()
        .positive('Points must be a positive number')
        .int('Points must be a whole number'),
    deadline: z.string().transform(val => val === '' ? null : val).nullable().optional(),
    category: z.string().transform(val => val === '' ? null : val).nullable().optional(),
    proofRequired: z.boolean().default(true),
    requirements: z.array(z.string()).optional().default([]),
    status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE')
})

export const updateTaskSchema = createTaskSchema.partial()

export const toggleStatusSchema = z.object({
    status: z.enum(['ACTIVE', 'INACTIVE', 'ARCHIVED'])
})
