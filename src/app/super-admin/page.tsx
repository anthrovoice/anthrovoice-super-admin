export const dynamic = "force-dynamic"

import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { DashboardClient } from "./dashboard-client"

export default async function SuperAdminDashboardPage() {
    const session = await auth()
    if (!session?.user?.id) redirect("/login")

    // TODO: Enforce super_admin role
    if ((session.user as any).role !== "super_admin") redirect("/dashboard")

    return (
        <div className="flex-1 overflow-auto bg-slate-50 dark:bg-background">
            <div className="max-w-6xl mx-auto p-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Platform Overview</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        High-level metrics across all clients and agents.
                    </p>
                </div>
                
                <DashboardClient />
            </div>
        </div>
    )
}
