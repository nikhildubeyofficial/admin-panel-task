import { NextResponse } from 'next/server'
import { OAuth2Client } from 'google-auth-library'
import prisma from '@/lib/db'
import { signToken } from '@/lib/jwt'
import { cookies } from 'next/headers'

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

export async function POST(req) {
    try {
        const { credential } = await req.json()

        if (!credential) {
            return NextResponse.json({ error: 'Missing credential' }, { status: 400 })
        }

        // Verify Google ID Token
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        })

        const payload = ticket.getPayload()
        const email = payload.email

        if (!email) {
            return NextResponse.json({ error: 'Email not found in token' }, { status: 400 })
        }

        // Check if admin exists
        const admin = await prisma.admin.findUnique({
            where: { email }
        })

        if (!admin) {
            return NextResponse.json({
                error: 'Access denied. This email is not registered as an admin.'
            }, { status: 403 })
        }

        // Generate JWT
        const token = signToken({
            id: admin.id,
            email: admin.email,
            role: admin.role
        })

        // Set cookie
        const cookieStore = await cookies()
        cookieStore.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24, // 1 day
            path: '/',
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
        console.error('Google Auth Error:', error)
        return NextResponse.json({
            error: 'Authentication failed. Please try again.'
        }, { status: 500 })
    }
}
