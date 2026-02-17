import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { generateCertificate, sendCertificateEmail } from '@/services/certificate'

export async function POST(req, { params }) {
    try {
        const { id } = params
        const certificate = await prisma.certificate.findUnique({
            where: { id },
            include: { user: true }
        })

        if (!certificate) {
            return NextResponse.json({ error: "Certificate not found" }, { status: 404 })
        }

        // Regenerate PDF (or use stored URL if we trust it, but regeneration is safer if URL is local/temp)
        // For local storage, the URL might be valid, but let's regenerate for simplicity in "resend" logic 
        // if the file is missing. Or just use the existing data.
        // Let's regenerate to be safe and ensure it works.
        const result = await generateCertificate(certificate.user.name, certificate.courseName)

        // Send Email
        await sendCertificateEmail(certificate.user.email, certificate.user.name, result.buffer)

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Resend Certificate Error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
