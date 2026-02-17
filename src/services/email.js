import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const EMAIL_FROM = 'Acme Student Program <onboarding@resend.dev>'

export async function sendWelcomeEmail(userEmail, userName) {
    if (!process.env.RESEND_API_KEY) {
        console.log(`[Mock Email] Welcome email to ${userEmail}`)
        return
    }

    try {
        await resend.emails.send({
            from: EMAIL_FROM,
            to: userEmail,
            subject: 'Welcome to the Student Program!',
            html: `
                <h1>Welcome, ${userName}!</h1>
                <p>We are excited to have you on board.</p>
                <p>Start completing tasks to earn points and rewards.</p>
                <p>Best regards,<br>Student Program Team</p>
            `
        })
    } catch (error) {
        console.error("Failed to send welcome email:", error)
    }
}

export async function sendTaskStatusEmail(userEmail, userName, taskTitle, status, reason = null) {
    if (!process.env.RESEND_API_KEY) {
        console.log(`[Mock Email] Task ${status} email to ${userEmail}`)
        return
    }

    const subject = status === 'APPROVED' ? 'Task Approved!' : 'Task Returned'
    const color = status === 'APPROVED' ? 'green' : 'red'

    let html = `
        <h1>Task Update: ${taskTitle}</h1>
        <p>Hi ${userName},</p>
        <p>Your submission for <strong>${taskTitle}</strong> has been <span style="color: ${color}; font-weight: bold;">${status}</span>.</p>
    `

    if (status === 'APPROVED') {
        html += `<p>Points have been credited to your account. Keep up the good work!</p>`
    } else {
        html += `<p><strong>Reason:</strong> ${reason || 'Does not meet requirements.'}</p>`
        html += `<p>Please review and resubmit if applicable.</p>`
    }

    html += `<p>Best regards,<br>Student Program Team</p>`

    try {
        await resend.emails.send({
            from: EMAIL_FROM,
            to: userEmail,
            subject: subject,
            html: html
        })
    } catch (error) {
        console.error("Failed to send task status email:", error)
    }
}

export async function sendPayoutStatusEmail(userEmail, userName, amount, status, note = null) {
    if (!process.env.RESEND_API_KEY) {
        console.log(`[Mock Email] Payout ${status} email to ${userEmail}`)
        return
    }

    const subject = `Payout Update: ${status}`

    let html = `
        <h1>Payout Status Update</h1>
        <p>Hi ${userName},</p>
        <p>Your payout request for <strong>${amount} points</strong> has been marked as <strong>${status}</strong>.</p>
    `

    if (status === 'PAID' || status === 'COMPLETED') {
        html += `<p>The funds should appear in your account shortly.</p>`
        if (note) html += `<p><strong>Transaction ID/Note:</strong> ${note}</p>`
    } else if (status === 'REJECTED') {
        html += `<p>Points have been refunded to your account.</p>`
        if (note) html += `<p><strong>Reason:</strong> ${note}</p>`
    } else if (status === 'APPROVED') {
        html += `<p>Your request has been approved and is being processed for payment.</p>`
    }

    html += `<p>Best regards,<br>Student Program Team</p>`

    try {
        await resend.emails.send({
            from: EMAIL_FROM,
            to: userEmail,
            subject: subject,
            html: html
        })
    } catch (error) {
        console.error("Failed to send payout email:", error)
    }
}

// Re-export certificate sending for backward compatibility or centralization
export async function sendCertificateEmail(userEmail, userName, pdfBuffer, courseName) {
    if (!process.env.RESEND_API_KEY) {
        console.log(`[Mock Email] Certificate email to ${userEmail}`)
        return
    }

    try {
        await resend.emails.send({
            from: EMAIL_FROM,
            to: userEmail,
            subject: `Certificate Earned: ${courseName}`,
            html: `
                <h1>Congratulations, ${userName}!</h1>
                <p>You have successfully completed <strong>${courseName}</strong>.</p>
                <p>Please find your certificate attached.</p>
                <p>Best regards,<br>Student Program Team</p>
            `,
            attachments: [
                {
                    filename: 'certificate.pdf',
                    content: pdfBuffer,
                },
            ],
        })
    } catch (error) {
        console.error("Failed to send certificate email:", error)
    }
}
