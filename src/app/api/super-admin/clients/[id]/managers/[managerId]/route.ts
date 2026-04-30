import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { updateManager, removeManager } from "@/lib/services/org.service"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string, managerId: string }> }) {
    try {
        const session = await auth()
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        
        // TODO: Enforce super_admin role
        if ((session.user as any).role !== "super_admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

        const { id: clientId, managerId } = await params
        const body = await req.json()

        // Pass clientId as the requesting adminId to pass ownership checks in updateManager
        await updateManager(managerId, clientId, {
            isAccountLocked: body.isAccountLocked,
        })
        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 })
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string, managerId: string }> }) {
    try {
        const session = await auth()
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        
        // TODO: Enforce super_admin role
        if ((session.user as any).role !== "super_admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

        const { managerId } = await params
        await removeManager(managerId)
        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
