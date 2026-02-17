'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createTaskSchema } from '@/lib/validations/task'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2 } from 'lucide-react'

export default function TaskDialog({ open, onClose, onSuccess, editTask = null }) {
    const [loading, setLoading] = useState(false)
    const isEdit = !!editTask

    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        resolver: zodResolver(createTaskSchema),
        defaultValues: editTask || {
            title: '',
            description: '',
            points: 10,
            deadline: '',
            category: '',
            proofRequired: true,
            requirements: [],
            status: 'ACTIVE'
        }
    })

    const onSubmit = async (data) => {
        setLoading(true)
        try {
            const url = isEdit ? `/api/tasks/${editTask.id}` : '/api/tasks/create'
            const method = isEdit ? 'PUT' : 'POST'

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })

            const result = await res.json()

            if (!res.ok) {
                // Return detailed error from API if available
                const errorMessage = result.message || result.error || 'Failed to save task'
                console.error('API Error details:', result)
                throw new Error(errorMessage)
            }

            reset()
            onSuccess?.()
            onClose()
        } catch (error) {
            console.error('Task save error:', error)
            alert(error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEdit ? 'Edit Task' : 'Create New Task'}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <Label htmlFor="title">Title *</Label>
                        <Input
                            id="title"
                            {...register('title')}
                            placeholder="Enter task title"
                            disabled={loading}
                        />
                        {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>}
                    </div>

                    <div>
                        <Label htmlFor="description">Description *</Label>
                        <Textarea
                            id="description"
                            {...register('description')}
                            placeholder="Describe what students need to do"
                            rows={4}
                            disabled={loading}
                        />
                        {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="points">Points *</Label>
                            <Input
                                id="points"
                                type="number"
                                {...register('points', { valueAsNumber: true })}
                                placeholder="10"
                                disabled={loading}
                            />
                            {errors.points && <p className="text-sm text-red-500 mt-1">{errors.points.message}</p>}
                        </div>

                        <div>
                            <Label htmlFor="category">Category</Label>
                            <Input
                                id="category"
                                {...register('category')}
                                placeholder="e.g., Social Media, Survey"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="deadline">Deadline (Optional)</Label>
                        <Input
                            id="deadline"
                            type="datetime-local"
                            {...register('deadline')}
                            disabled={loading}
                        />
                    </div>

                    <div>
                        <Label htmlFor="status">Status</Label>
                        <select
                            id="status"
                            {...register('status')}
                            className="w-full px-3 py-2 border rounded-md"
                            disabled={loading}
                        >
                            <option value="ACTIVE">Active</option>
                            <option value="INACTIVE">Inactive</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            id="proofRequired"
                            type="checkbox"
                            {...register('proofRequired')}
                            disabled={loading}
                        />
                        <Label htmlFor="proofRequired">Proof Required</Label>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isEdit ? 'Update Task' : 'Create Task'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
