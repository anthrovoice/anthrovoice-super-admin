export const dynamic = "force-dynamic"

import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getUserDoc, listManagersByAdminId } from "@/lib/db/collections/users"
import { ClientManagersTable } from "./client-managers-table"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"

export default async function ClientDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await auth()
    if (!session?.user?.id) redirect("/login")

    // TODO: Enforce super_admin role
    if ((session.user as any).role !== "super_admin") redirect("/dashboard")

    const { id: clientId } = await params
    const client = await getUserDoc(clientId)
    
    if (!client) {
        return (
            <div className="flex-1 p-8 bg-slate-50 dark:bg-background">
                <div className="max-w-6xl mx-auto text-center py-20">
                    <h1 className="text-2xl font-bold text-slate-900">Client not found</h1>
                    <Link href="/super-admin/clients" className="text-indigo-600 mt-4 inline-block hover:underline">
                        Return to Clients
                    </Link>
                </div>
            </div>
        )
    }

    const managers = await listManagersByAdminId(clientId)
    const safeManagers = managers.map(m => {
        const { password, ...safe } = m
        return safe
    })

    return (
        <div className="flex-1 overflow-auto bg-slate-50 dark:bg-background">
            <div className="max-w-6xl mx-auto p-8">
                <div className="mb-6">
                    <Link href="/super-admin/clients" className="text-sm text-indigo-600 hover:underline flex items-center mb-4">
                        <ChevronLeft className="w-4 h-4 mr-1" /> Back to Clients
                    </Link>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                        {client.displayName || client.email}'s Managers
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Manage the team members assigned to this client account.
                    </p>
                </div>
                
                <ClientManagersTable clientId={clientId} initialManagers={safeManagers} />
            </div>
        </div>
    )
}
