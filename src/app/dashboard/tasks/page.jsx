'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Check, X, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

async function fetchSubmissions() {
    const res = await fetch('/api/tasks/submissions')
    if (!res.ok) throw new Error('Failed to fetch')
    return res.json()
}

export default function TasksPage() {
    const queryClient = useQueryClient()
    const [selectedSubmission, setSelectedSubmission] = useState(null)
    const [rejectReason, setRejectReason] = useState('')
    const [isRejecting, setIsRejecting] = useState(false)

    const { data, isLoading } = useQuery({
        queryKey: ['submissions'],
        queryFn: fetchSubmissions,
    })

    // Mutation for approve/reject
    const mutation = useMutation({
        mutationFn: async ({ id, status, reason }) => {
            const res = await fetch(`/api/tasks/submissions/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status, reason }),
            })
            if (!res.ok) {
                const json = await res.json()
                throw new Error(json.error || 'Failed to update')
            }
            return res.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['submissions'] })
            setSelectedSubmission(null)
            setRejectReason('')
            setIsRejecting(false)
        },
    })

    const handleVerify = (sub) => {
        setSelectedSubmission(sub)
        setIsRejecting(false)
        setRejectReason('')
    }

    const handleApprove = () => {
        if (!selectedSubmission) return
        mutation.mutate({ id: selectedSubmission.id, status: 'APPROVED' })
    }

    const handleReject = () => {
        if (!selectedSubmission) return
        if (!rejectReason) return
        mutation.mutate({ id: selectedSubmission.id, status: 'REJECTED', reason: rejectReason })
    }

    if (isLoading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>

    const submissions = data?.submissions || []

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Pending Tasks</h1>
            </div>

            <Card>
                <CardContent className="p-0">
                    <div className="relative w-full overflow-auto">
                        <table className="w-full caption-bottom text-sm text-left">
                            <thead className="[&_tr]:border-b">
                                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Student</th>
                                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Task</th>
                                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Date</th>
                                    <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="[&_tr:last-child]:border-0">
                                {submissions.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="p-4 text-center text-muted-foreground">
                                            No pending submissions
                                        </td>
                                    </tr>
                                ) : (
                                    submissions.map((sub) => {
                                        if (!sub || !sub.id) return null
                                        return (
                                            <tr key={sub.id} className="border-b transition-colors hover:bg-muted/50">
                                                <td className="p-4 align-middle">
                                                    <div className="font-medium">{sub.user?.name || 'Unknown'}</div>
                                                    <div className="text-xs text-muted-foreground">{sub.user?.email || 'No Email'}</div>
                                                </td>
                                                <td className="p-4 align-middle">
                                                    <div>{sub.task?.title || 'Untitled Task'}</div>
                                                    <div className="text-xs text-muted-foreground">+{sub.task?.points || 0} pts</div>
                                                </td>
                                                <td className="p-4 align-middle">{format(new Date(sub.createdAt), 'MMM d, yyyy')}</td>
                                                <td className="p-4 align-middle">
                                                    <Button size="sm" onClick={() => handleVerify(sub)}>Verify</Button>
                                                </td>
                                            </tr>
                                        )
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={!!selectedSubmission} onOpenChange={(open) => !open && setSelectedSubmission(null)}>
                <DialogContent>
                    {selectedSubmission ? (
                        <>
                            <DialogHeader>
                                <DialogTitle>Verify Submission</DialogTitle>
                                <DialogDescription>Review the proof and approve or reject.</DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Student</Label>
                                        <p className="text-sm font-medium">{selectedSubmission.user?.name}</p>
                                    </div>
                                    <div>
                                        <Label>Task</Label>
                                        <p className="text-sm font-medium">{selectedSubmission.task?.title}</p>
                                    </div>
                                </div>

                                <div>
                                    <Label>Proof</Label>
                                    {selectedSubmission.proofUrl ? (
                                        <div className="mt-2 rounded-md border p-2 bg-muted text-xs break-all">
                                            <a href={selectedSubmission.proofUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                                                {selectedSubmission.proofUrl}
                                            </a>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-yellow-600 mt-1">No proof URL provided (Auto-submission?)</p>
                                    )}
                                </div>

                                {isRejecting ? (
                                    <div className="space-y-2">
                                        <Label>Rejection Reason</Label>
                                        <textarea
                                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            placeholder="Provide a reason for rejection..."
                                            value={rejectReason}
                                            onChange={(e) => setRejectReason(e.target.value)}
                                        />
                                    </div>
                                ) : null}
                            </div>

                            <DialogFooter>
                                {isRejecting ? (
                                    <>
                                        <Button variant="outline" onClick={() => setIsRejecting(false)}>Cancel</Button>
                                        <Button variant="destructive" onClick={handleReject} disabled={mutation.isPending}>
                                            {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Confirm Reject
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <Button variant="destructive" onClick={() => setIsRejecting(true)}>Reject</Button>
                                        <Button onClick={handleApprove} disabled={mutation.isPending}>
                                            {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Approve & Credit
                                        </Button>
                                    </>
                                )}
                            </DialogFooter>
                        </>
                    ) : (
                        <div className="p-4 text-center">Loading details...</div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
