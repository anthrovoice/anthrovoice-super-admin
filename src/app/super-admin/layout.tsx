export const dynamic = "force-dynamic"
import { SidebarProvider } from "@/components/ui/sidebar"
import { TooltipProvider as TP } from "@/components/ui/tooltip"
import { SuperAdminSidebar } from "@/components/super-admin-sidebar"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
const SUPER_ADMIN_EMAIL = "sa@av.com"

export default async function SuperAdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth()

    if (!session?.user) redirect("/login")

    if (session.user.email !== SUPER_ADMIN_EMAIL) {
        redirect("/login")
    }

    const user = {
        name: session.user.name ?? session.user.email ?? "Super Admin",
        email: session.user.email ?? "",
        role: (session.user as any).role ?? "user",
    }

    return (
        <TP delayDuration={200}>
            <div className="flex min-h-screen w-full bg-slate-50 dark:bg-background">
                <SidebarProvider defaultOpen={true}>
                    <SuperAdminSidebar user={user} />
                    <main className="flex-1 w-full overflow-hidden flex flex-col">
                        {children}
                    </main>
                </SidebarProvider>
            </div>
        </TP>
    )
}