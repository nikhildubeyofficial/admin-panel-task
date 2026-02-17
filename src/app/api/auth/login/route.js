import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { verifyPassword } from '@/lib/password'
import { signToken } from '@/lib/jwt'
import { loginSchema } from '@/lib/validations/auth'
import { cookies } from 'next/headers'

export async function POST(req) {
    try {
        const body = await req.json()
        const validation = loginSchema.safeParse(body)

        if (!validation.success) {
            return NextResponse.json({ error: validation.error.flatten().fieldErrors }, { status: 400 })
        }

        const { email, password } = validation.data

        // Check Admin table
        const admin = await prisma.admin.findUnique({ where: { email } })

        if (!admin) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
        }

        // Verify password
        const isValid = await verifyPassword(password, admin.password)

        if (!isValid) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
        }

        // Generate token
        const token = signToken({ id: admin.id, email: admin.email, role: admin.role })

        // Set cookie
        const cookieStore = await cookies()
        cookieStore.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax', // 'strict' can cause issues on some redirect flows, 'lax' is safer
            maxAge: 60 * 60 * 24, // 1 day
            path: '/'
        })

        return NextResponse.json({
            success: true,
            user: {
                id: admin.id,
                email: admin.email,
                name: admin.name,
                role: admin.role
            }
        })

    } catch (error) {
        console.error("DEBUG - Login failed at step:", error.message)
        console.error("DEBUG - Full error stack:", error.stack)
        if (error.code) console.error("DEBUG - Error code:", error.code)
        return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 })
    }
}
