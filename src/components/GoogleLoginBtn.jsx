'use client'

import { GoogleLogin } from '@react-oauth/google'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function GoogleLoginBtn() {
    const router = useRouter()
    const [error, setError] = useState('')

    const handleSuccess = async (credentialResponse) => {
        try {
            const res = await fetch('/api/auth/google', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ credential: credentialResponse.credential })
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || 'Google login failed')
                return
            }

            // Redirect to dashboard
            window.location.href = '/dashboard'
        } catch (err) {
            console.error('Google login error:', err)
            setError('An error occurred during login')
        }
    }

    const handleError = () => {
        setError('Google login failed. Please try again.')
    }

    return (
        <div className="space-y-2">
            <GoogleLogin
                onSuccess={handleSuccess}
                onError={handleError}
                useOneTap={false}
                theme="outline"
                size="large"
                text="signin_with"
                shape="rectangular"
            />
            {error && (
                <p className="text-sm text-red-600">{error}</p>
            )}
        </div>
    )
}
