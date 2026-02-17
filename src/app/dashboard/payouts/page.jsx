'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Check, X, Loader2, DollarSign } from 'lucide-react'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

async function fetchRequests() {
    const res = await fetch('/api/payouts/requests')
    if (!res.ok) throw new Error('Failed to fetch')
    return res.json()
}

export default function PayoutsPage() {
    const queryClient = useQueryClient()
    const [selectedRequest, setSelectedRequest] = useState(null)
    const [txId, setTxId] = useState('')
    const [note, setNote] = useState('')
    const [actionType, setActionType] = useState(null) // 'APPROVE', 'REJECT', 'PAY'

    const { data, isLoading } = useQuery({
        queryKey: ['payouts'],
        queryFn: fetchRequests,
    })

    const mutation = useMutation({
        mutationFn: async ({ id, action, transactionId }) => {
            const res = await fetch('/api/payouts/process', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, action, transactionId, adminNote: note }),
            })
            if (!res.ok) {
                const json = await res.json()
                throw new Error(json.error || 'Failed to process')
            }
            return res.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['payouts'] })
            handleClose()
        },
    })

    const handleClose = () => {
        setSelectedRequest(null)
        setTxId('')
        setNote('')
        setActionType(null)
    }

    const onAction = (req, type) => {
        setSelectedRequest(req)
        setActionType(type)
    }

    const confirmAction = () => {
        if (actionType === 'PAY' && !txId) return // Require Tx ID for manual payment

        // Map UI action to API action
        let apiAction = actionType
        if (actionType === 'PAY') apiAction = 'COMPLETE'

        mutation.mutate({
            id: selectedRequest.id,
            action: apiAction,
            transactionId: txId
        })
    }

    if (isLoading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>

    const requests = data?.requests || []

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Payout Management</h1>

            <Card>
                <CardContent className="p-0">
                    <div className="relative w-full overflow-auto">
                        <table className="w-full caption-bottom text-sm text-left">
                            <thead className="[&_tr]:border-b">
                                <tr className="border-b transition-colors hover:bg-muted/50">
                                    <th className="h-12 px-4 font-medium text-muted-foreground">User</th>
                                    <th className="h-12 px-4 font-medium text-muted-foreground">Available</th>
                                    <th className="h-12 px-4 font-medium text-muted-foreground">Redeem</th>
                                    <th className="h-12 px-4 font-medium text-muted-foreground">Status</th>
                                    <th className="h-12 px-4 font-medium text-muted-foreground">Requested</th>
                                    <th className="h-12 px-4 font-medium text-muted-foreground">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="[&_tr:last-child]:border-0">
                                {requests.length === 0 ? (
                                    <tr><td colSpan={6} className="p-4 text-center text-muted-foreground">No active requests</td></tr>
                                ) : (
                                    requests.map((req) => (
                                        <tr key={req.id} className="border-b transition-colors hover:bg-muted/50">
                                            <td className="p-4">
                                                <div className="font-medium">{req.user.name}</div>
                                                <div className="text-xs text-muted-foreground">{req.user.email}</div>
                                            </td>
                                            <td className="p-4">
                                                <div className="font-semibold text-blue-600">{req.user.points} pts</div>
                                            </td>
                                            <td className="p-4">{req.amount} pts</td>
                                            <td className="p-4">
                                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${req.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                                    req.status === 'APPROVED' ? 'bg-blue-100 text-blue-800' :
                                                        req.status === 'PAID' ? 'bg-green-100 text-green-800' :
                                                            'bg-red-100 text-red-800'
                                                    }`}>
                                                    {req.status}
                                                </span>
                                            </td>
                                            <td className="p-4">{format(new Date(req.createdAt), 'MMM d, p')}</td>
                                            <td className="p-4 flex gap-2">
                                                {req.status === 'PENDING' && (
                                                    <>
                                                        <Button size="sm" variant="default" onClick={() => onAction(req, 'APPROVE')}>Approve</Button>
                                                        <Button size="sm" variant="destructive" onClick={() => onAction(req, 'REJECT')}>Reject</Button>
                                                    </>
                                                )}
                                                {req.status === 'APPROVED' && (
                                                    <Button size="sm" variant="outline" className="border-green-600 text-green-600 hover:bg-green-50" onClick={() => onAction(req, 'PAY')}>
                                                        Mark Paid
                                                    </Button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={!!selectedRequest} onOpenChange={(open) => !open && handleClose()}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {actionType === 'APPROVE' && 'Approve Payout Request'}
                            {actionType === 'REJECT' && 'Reject Payout Request'}
                            {actionType === 'PAY' && 'Confirm Payment'}
                        </DialogTitle>
                        <DialogDescription>
                            {actionType === 'APPROVE' && `Are you sure you want to approve ${selectedRequest?.amount} points for payout? This will create a pending Payout record.`}
                            {actionType === 'REJECT' && `This will refund ${selectedRequest?.amount} points to the user.`}
                            {actionType === 'PAY' && `Enter transaction details to complete this payout of ${selectedRequest?.amount} points.`}
                        </DialogDescription>
                    </DialogHeader>

                    {(actionType === 'APPROVE' || actionType === 'REJECT') && (
                        <div className="space-y-2 py-4 border-t border-b mb-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">User Balance:</span>
                                <span className="font-semibold">{selectedRequest?.user?.points} pts</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Redeem Amount:</span>
                                <span className="font-semibold text-orange-600">{selectedRequest?.amount} pts</span>
                            </div>

                            <div className="pt-4 space-y-2">
                                <Label>Admin Note (Optional)</Label>
                                <textarea
                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="Add a reason or note..."
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    {actionType === 'PAY' && (
                        <div className="space-y-2 py-4">
                            <Label>Transaction ID (from Bank/Gateway)</Label>
                            <Input
                                value={txId}
                                onChange={(e) => setTxId(e.target.value)}
                                placeholder="e.g. TX-123456789"
                            />
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={handleClose}>Cancel</Button>
                        <Button
                            variant={actionType === 'REJECT' ? 'destructive' : 'default'}
                            onClick={confirmAction}
                            disabled={mutation.isPending || (actionType === 'PAY' && !txId)}
                        >
                            {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Confirm
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
