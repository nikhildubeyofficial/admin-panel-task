'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { LayoutDashboard, CheckSquare, Users, CreditCard, LogOut, FileText, ListTodo } from 'lucide-react'
import { Button } from '@/components/ui/button'

const sidebarItems = [
    { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { href: '/dashboard/tasks', label: 'Tasks & Approvals', icon: CheckSquare },
    { href: '/dashboard/tasks/manage', label: 'Manage Tasks', icon: ListTodo },
    { href: '/dashboard/payouts', label: 'Payouts', icon: CreditCard },
    { href: '/dashboard/referrals', label: 'Referrals', icon: Users },
    { href: '/dashboard/certificates', label: 'Certificates', icon: FileText },
]

export default function DashboardLayout({ children }) {
    const pathname = usePathname()
    const router = useRouter()

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' })
            router.push('/login')
            router.refresh()
        } catch (error) {
            console.error("Logout failed", error)
        }
    }

    return (
        <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
            {/* Sidebar */}
            <aside className="hidden w-64 flex-col border-r bg-white dark:bg-gray-800 md:flex">
                <div className="flex h-14 items-center border-b px-4">
                    <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
                        <span className="">Admin Panel</span>
                    </Link>
                </div>
                <div className="flex-1 overflow-auto py-4">
                    <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                        {sidebarItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                                    pathname === item.href
                                        ? "bg-muted text-primary"
                                        : "text-muted-foreground"
                                )}
                            >
                                <item.icon className="h-4 w-4" />
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                </div>
                <div className="border-t p-4">
                    <Button variant="ghost" className="w-full justify-start gap-2" onClick={handleLogout}>
                        <LogOut className="h-4 w-4" />
                        Logout
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <div className="h-full px-4 py-6 md:px-8">
                    {children}
                </div>
            </main>
        </div>
    )
}
