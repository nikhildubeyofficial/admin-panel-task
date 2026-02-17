'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Edit, Trash2, Loader2, Search, ToggleLeft, ToggleRight } from 'lucide-react'
import TaskDialog from '@/components/TaskDialog'
import { formatDistanceToNow } from 'date-fns'

async function fetchTasks(params) {
    const queryString = new URLSearchParams(params).toString()
    const res = await fetch(`/api/tasks/list?${queryString}`)
    if (!res.ok) throw new Error('Failed to fetch tasks')
    return res.json()
}

async function deleteTask(id) {
    const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error('Failed to delete task')
    return res.json()
}

async function toggleStatus(id, status) {
    const res = await fetch(`/api/tasks/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
    })
    if (!res.ok) throw new Error('Failed to toggle status')
    return res.json()
}

export default function TaskManagementPage() {
    const queryClient = useQueryClient()
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editTask, setEditTask] = useState(null)
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('ALL')
    const [page, setPage] = useState(1)

    const { data, isLoading } = useQuery({
        queryKey: ['tasks', { search, status: statusFilter, page }],
        queryFn: () => fetchTasks({ search, status: statusFilter, page, limit: 10 })
    })

    const deleteMutation = useMutation({
        mutationFn: deleteTask,
        onSuccess: () => {
            queryClient.invalidateQueries(['tasks'])
            queryClient.invalidateQueries(['analytics'])
        }
    })

    const toggleMutation = useMutation({
        mutationFn: ({ id, status }) => toggleStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries(['tasks'])
            queryClient.invalidateQueries(['analytics'])
        }
    })

    const handleCreate = () => {
        setEditTask(null)
        setDialogOpen(true)
    }

    const handleEdit = (task) => {
        setEditTask(task)
        setDialogOpen(true)
    }

    const handleDelete = async (id, title) => {
        if (confirm(`Are you sure you want to archive "${title}"?`)) {
            try {
                await deleteMutation.mutateAsync(id)
            } catch (error) {
                alert(error.message)
            }
        }
    }

    const handleToggleStatus = async (task) => {
        const newStatus = task.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
        try {
            await toggleMutation.mutateAsync({ id: task.id, status: newStatus })
        } catch (error) {
            alert(error.message)
        }
    }

    const handleSuccess = () => {
        queryClient.invalidateQueries(['tasks'])
        queryClient.invalidateQueries(['analytics'])
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Task Management</h1>
                <Button onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Task
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex gap-4 items-center">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search tasks..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-3 py-2 border rounded-md"
                        >
                            <option value="ALL">All Status</option>
                            <option value="ACTIVE">Active</option>
                            <option value="INACTIVE">Inactive</option>
                            <option value="ARCHIVED">Archived</option>
                        </select>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                    ) : data?.tasks?.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">No tasks found</p>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left py-3 px-4">Title</th>
                                            <th className="text-left py-3 px-4">Points</th>
                                            <th className="text-left py-3 px-4">Status</th>
                                            <th className="text-left py-3 px-4">Submissions</th>
                                            <th className="text-left py-3 px-4">Created</th>
                                            <th className="text-right py-3 px-4">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data?.tasks?.map((task) => (
                                            <tr key={task.id} className="border-b hover:bg-muted/50">
                                                <td className="py-3 px-4">
                                                    <div>
                                                        <p className="font-medium">{task.title}</p>
                                                        {task.category && (
                                                            <span className="text-xs text-muted-foreground">{task.category}</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">{task.points}</td>
                                                <td className="py-3 px-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs ${task.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                                                        task.status === 'INACTIVE' ? 'bg-yellow-100 text-yellow-700' :
                                                            'bg-gray-100 text-gray-700'
                                                        }`}>
                                                        {task.status}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">{task._count?.submissions || 0}</td>
                                                <td className="py-3 px-4 text-sm text-muted-foreground">
                                                    {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="flex gap-2 justify-end">
                                                        {task.status !== 'ARCHIVED' && (
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() => handleToggleStatus(task)}
                                                                disabled={toggleMutation.isPending}
                                                            >
                                                                {task.status === 'ACTIVE' ? (
                                                                    <ToggleRight className="h-4 w-4" />
                                                                ) : (
                                                                    <ToggleLeft className="h-4 w-4" />
                                                                )}
                                                            </Button>
                                                        )}
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => handleEdit(task)}
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        {task.status !== 'ARCHIVED' && (
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() => handleDelete(task.id, task.title)}
                                                                disabled={deleteMutation.isPending}
                                                            >
                                                                <Trash2 className="h-4 w-4 text-red-500" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {data?.pagination && data.pagination.totalPages > 1 && (
                                <div className="flex justify-center gap-2 mt-4">
                                    <Button
                                        variant="outline"
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                    >
                                        Previous
                                    </Button>
                                    <span className="px-4 py-2">
                                        Page {page} of {data.pagination.totalPages}
                                    </span>
                                    <Button
                                        variant="outline"
                                        onClick={() => setPage(p => p + 1)}
                                        disabled={page >= data.pagination.totalPages}
                                    >
                                        Next
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>

            <TaskDialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                onSuccess={handleSuccess}
                editTask={editTask}
            />
        </div>
    )
}
