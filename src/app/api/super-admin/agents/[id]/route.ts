import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { deleteAgentById } from "@/lib/services/agent.service"

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await auth()
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        if ((session.user as any).role !== "super_admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

        const { id } = await params
        // deleteAgentById actually deletes from Retell too in the current implementation!
        // The user scope said: "I want to delete agent of a certain admin"
        await deleteAgentById(id)
        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
