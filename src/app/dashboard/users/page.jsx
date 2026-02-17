'use client'

import { useQuery } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { format } from 'date-fns'

import { Button } from '@/components/ui/button'
import Link from 'next/link'

async function fetchUsers() {
    const res = await fetch('/api/users')
    if (!res.ok) throw new Error('Failed to fetch')
    return res.json()
}

export default function UsersPage() {
    const { data, isLoading } = useQuery({
        queryKey: ['users'],
        queryFn: fetchUsers,
    })

    if (isLoading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>

    const users = data?.users || []

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Registered Students</h1>

            <Card>
                <CardContent className="p-0">
                    <div className="relative w-full overflow-auto">
                        <table className="w-full caption-bottom text-sm text-left">
                            <thead className="[&_tr]:border-b">
                                <tr className="border-b transition-colors hover:bg-muted/50">
                                    <th className="h-12 px-4 font-medium text-muted-foreground">Name</th>
                                    <th className="h-12 px-4 font-medium text-muted-foreground">Email</th>
                                    <th className="h-12 px-4 font-medium text-muted-foreground">Points</th>
                                    <th className="h-12 px-4 font-medium text-muted-foreground">Referrals</th>
                                    <th className="h-12 px-4 font-medium text-muted-foreground">Joined</th>
                                    <th className="h-12 px-4 font-medium text-muted-foreground">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="[&_tr:last-child]:border-0">
                                {users.length === 0 ? (
                                    <tr><td colSpan={6} className="p-4 text-center text-muted-foreground">No users found</td></tr>
                                ) : (
                                    users.map((user) => (
                                        <tr key={user.id} className="border-b transition-colors hover:bg-muted/50">
                                            <td className="p-4 font-medium">{user.name}</td>
                                            <td className="p-4">{user.email}</td>
                                            <td className="p-4 font-bold text-green-600">{user.points}</td>
                                            <td className="p-4">{user._count?.referrals || 0}</td>
                                            <td className="p-4">{format(new Date(user.createdAt), 'MMM d, yyyy')}</td>
                                            <td className="p-4">
                                                <Button size="sm" variant="outline" asChild>
                                                    <Link href={`/dashboard/referrals?referrerCode=${user.referralCode}`}>
                                                        View Referrals
                                                    </Link>
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

