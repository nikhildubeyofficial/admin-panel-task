import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { hashPassword } from '@/lib/password'
import { registerSchema } from '@/lib/validations/auth'

export async function POST(req) {
    try {
        const body = await req.json()
        const validation = registerSchema.safeParse(body)

        if (!validation.success) {
            return NextResponse.json({ error: validation.error.flatten().fieldErrors }, { status: 400 })
        }

        const { name, email, password } = validation.data

        // Check if user already exists
        const existingUser = await prisma.admin.findUnique({
            where: { email }
        })

        if (existingUser) {
            return NextResponse.json({ error: "User already exists" }, { status: 400 })
        }

        // Hash password
        const hashedPassword = await hashPassword(password)

        // Create user
        const newUser = await prisma.admin.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: 'ADMIN' // Default role
            }
        })

        return NextResponse.json({
            success: true,
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role
            }
        }, { status: 201 })

    } catch (error) {
        console.error("Register Error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
