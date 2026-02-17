'use client'

import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, Mail, ExternalLink } from 'lucide-react'
import { format } from 'date-fns'
import { Input } from '@/components/ui/input'
// import { toast } from 'sonner' 
// import { Toaster } from "@/components/ui/sonner" 

async function fetchCertificates() {
    const res = await fetch('/api/certificates')
    if (!res.ok) throw new Error('Failed to fetch')
    return res.json()
}

export default function CertificatesPage() {
    const [search, setSearch] = useState('')
    const [resendingId, setResendingId] = useState(null)

    const { data, isLoading } = useQuery({
        queryKey: ['certificates'],
        queryFn: fetchCertificates,
    })

    const resendMutation = useMutation({
        mutationFn: async (id) => {
            const res = await fetch(`/api/certificates/${id}/send`, { method: 'POST' })
            if (!res.ok) throw new Error('Failed to send')
            return res.json()
        },
        onSuccess: () => {
            // We can use a toast here if configured, or just alert
            alert("Certificate email resent successfully!")
            setResendingId(null)
        },
        onError: () => {
            alert("Failed to resend email.")
            setResendingId(null)
        }
    })

    const handleResend = (id) => {
        if (confirm("Resend certificate email to this user?")) {
            setResendingId(id)
            resendMutation.mutate(id)
        }
    }

    if (isLoading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>

    const certificates = data?.certificates || []

    const filteredCertificates = certificates.filter(cert =>
        cert.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
        cert.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
        cert.courseName?.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Certificates</h1>
            </div>

            <div className="flex items-center gap-4">
                <Input
                    placeholder="Search by student, email, or course..."
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
                                    <th className="h-12 px-4 font-medium text-muted-foreground">Student</th>
                                    <th className="h-12 px-4 font-medium text-muted-foreground">Course/Task</th>
                                    <th className="h-12 px-4 font-medium text-muted-foreground">Issued Date</th>
                                    <th className="h-12 px-4 font-medium text-muted-foreground">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="[&_tr:last-child]:border-0">
                                {filteredCertificates.length === 0 ? (
                                    <tr><td colSpan={4} className="p-4 text-center text-muted-foreground">No certificates found</td></tr>
                                ) : (
                                    filteredCertificates.map((cert) => (
                                        <tr key={cert.id} className="border-b transition-colors hover:bg-muted/50">
                                            <td className="p-4">
                                                <div className="font-medium">{cert.user?.name || 'Unknown'}</div>
                                                <div className="text-xs text-muted-foreground">{cert.user?.email}</div>
                                            </td>
                                            <td className="p-4">
                                                {cert.courseName}
                                            </td>
                                            <td className="p-4">{format(new Date(cert.createdAt), 'MMM d, yyyy')}</td>
                                            <td className="p-4 flex gap-2">
                                                {cert.pdfUrl && (
                                                    <Button variant="outline" size="sm" asChild>
                                                        <a href={cert.pdfUrl} target="_blank" rel="noopener noreferrer">
                                                            <ExternalLink className="mr-2 h-3 w-3" /> View
                                                        </a>
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    onClick={() => handleResend(cert.id)}
                                                    disabled={resendingId === cert.id}
                                                >
                                                    {resendingId === cert.id ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : <Mail className="mr-2 h-3 w-3" />}
                                                    Resend
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
