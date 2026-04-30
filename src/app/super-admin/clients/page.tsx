export const dynamic = "force-dynamic"

import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { listAdmins } from "@/lib/db/collections/users"
import { ClientsTable } from "./clients-table"

export default async function SuperAdminClientsPage() {
    const session = await auth()
    if (!session?.user?.id) redirect("/login")

    // TODO: Enforce super_admin role
    if ((session.user as any).role !== "super_admin") redirect("/dashboard")

    const admins = await listAdmins()
    const safeAdmins = admins.map(a => {
        const { password, ...safe } = a
        return safe
    })

    return (
        <div className="flex-1 overflow-auto bg-slate-50 dark:bg-background">
            <div className="max-w-6xl mx-auto p-8">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Clients</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Manage your platform clients (admins).
                    </p>
                </div>
                
                <ClientsTable initialAdmins={safeAdmins} />
            </div>
        </div>
    )
}
