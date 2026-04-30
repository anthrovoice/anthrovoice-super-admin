import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { updateAdmin, removeAdmin } from "@/lib/services/super-admin.service"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await auth()
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        
        // TODO: Enforce super_admin role
        if ((session.user as any).role !== "super_admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

        const { id } = await params
        const body = await req.json()

        await updateAdmin(id, {
            displayName: body.displayName,
            isAccountLocked: body.isAccountLocked,
            isCallingEnabled: body.isCallingEnabled,
        })
        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 })
    }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await auth()
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        
        // TODO: Enforce super_admin role
        if ((session.user as any).role !== "super_admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

        const { id } = await params
        await removeAdmin(id)
        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
