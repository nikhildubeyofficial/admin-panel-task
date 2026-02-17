'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { Input } from '@/components/ui/input'


async function fetchReferrals() {
    const res = await fetch('/api/referrals')
    if (!res.ok) throw new Error('Failed to fetch')
    return res.json()
}

export default function ReferralsPage() {
    const [search, setSearch] = useState('')
    const { data, isLoading } = useQuery({
        queryKey: ['referrals'],
        queryFn: fetchReferrals,
    })

    if (isLoading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>
    const referrals = data?.referrals || []

    const filteredReferrals = referrals.filter(user =>
        user.name?.toLowerCase().includes(search.toLowerCase()) ||
        user.email?.toLowerCase().includes(search.toLowerCase()) ||
        user.referredBy?.name?.toLowerCase().includes(search.toLowerCase()) ||
        user.referredBy?.email?.toLowerCase().includes(search.toLowerCase()) ||
        user.referredBy?.referralCode?.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Referral Tracking</h1>
            </div>

            <div className="flex items-center gap-4">
                <Input
                    placeholder="Search by name, email, or code..."
                    className="max-w-sm"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <Card>
                <CardContent className="p-0">
                    <div className="relative w-full overflow-auto">
                        <table className="w-full caption-bottom text-sm text-left">
                            <thead className="[&_tr]:border-b">
                                <tr className="border-b transition-colors hover:bg-muted/50">
                                    <th className="h-12 px-4 font-medium text-muted-foreground">Referee</th>
                                    <th className="h-12 px-4 font-medium text-muted-foreground">Referred By</th>
                                    <th className="h-12 px-4 font-medium text-muted-foreground">Referrer Code</th>
                                    <th className="h-12 px-4 font-medium text-muted-foreground">Date</th>
                                </tr>
                            </thead>
                            <tbody className="[&_tr:last-child]:border-0">
                                {filteredReferrals.length === 0 ? (
                                    <tr><td colSpan={4} className="p-4 text-center text-muted-foreground">No referrals found</td></tr>
                                ) : (
                                    filteredReferrals.map((user) => (
                                        <tr key={user.id} className="border-b transition-colors hover:bg-muted/50">
                                            <td className="p-4">
                                                <div className="font-medium">{user.name}</div>
                                                <div className="text-xs text-muted-foreground">{user.email}</div>
                                            </td>
                                            <td className="p-4">
                                                <div className="font-medium">{user.referredBy?.name || 'Unknown'}</div>
                                                <div className="text-xs text-muted-foreground">{user.referredBy?.email}</div>
                                            </td>
                                            <td className="p-4 font-mono">{user.referredBy?.referralCode}</td>
                                            <td className="p-4">{format(new Date(user.createdAt), 'MMM d, yyyy')}</td>
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
