'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { loginSchema } from '@/lib/validations/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import GoogleLoginBtn from '@/components/GoogleLoginBtn'

export default function LoginPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(loginSchema),
    })

    async function onSubmit(data) {
        setLoading(true)
        setError('')

        try {
            console.log("Attempting login...")
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            })

            const json = await res.json()

            if (!res.ok) {
                console.error("Login failed:", json)
                throw new Error(json.error || 'Login failed')
            }

            console.log("Login success! Redirecting...")
            // Force hard reload to ensure cookies are recognized by middleware
            window.location.href = '/dashboard'
        } catch (err) {
            console.error("Login Error:", err)
            setError(err.message)
            // Optional: alert(err.message) // for visibility if needed
        } finally {
            setLoading(false)
        }
    }

    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''

    return (
        <GoogleOAuthProvider clientId={googleClientId}>
            <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl font-bold">Admin Login</CardTitle>
                        <CardDescription>Enter your credentials to access the panel</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            {error && (
                                <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md border border-red-200">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="admin@example.com"
                                    {...register('email')}
                                    disabled={loading}
                                />
                                {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    {...register('password')}
                                    disabled={loading}
                                />
                                {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
                            </div>

                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Sign In
                            </Button>

                            <div className="relative my-4">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-white dark:bg-gray-800 px-2 text-muted-foreground">Or continue with</span>
                                </div>
                            </div>

                            <GoogleLoginBtn />
                        </form>
                    </CardContent>
                    <CardFooter className="justify-center">
                        <p className="text-sm text-gray-500">
                            Don't have an account?{" "}
                            <Link href="/register" className="text-blue-600 hover:underline">
                                Register
                            </Link>
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </GoogleOAuthProvider>
    )
}
