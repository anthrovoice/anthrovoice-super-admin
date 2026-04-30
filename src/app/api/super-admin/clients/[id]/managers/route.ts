import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { createManager } from "@/lib/services/org.service"

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await auth()
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        
        // TODO: Enforce super_admin role
        if ((session.user as any).role !== "super_admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

        const { id: clientId } = await params
        const body = await req.json()
        const { email, password, displayName } = body

        if (!email || !password) return NextResponse.json({ error: "Email and password are required" }, { status: 400 })

        // Re-use org.service.ts createManager, which securely hashes password and creates role: manager
        const newManager = await createManager(clientId, { email, password, displayName })
        
        const { password: _, ...safeManager } = newManager as any
        return NextResponse.json(safeManager)
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 })
    }
}
