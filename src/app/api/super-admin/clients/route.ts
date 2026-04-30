import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { listAdmins } from "@/lib/db/collections/users"
import { createAdmin } from "@/lib/services/super-admin.service"

export async function GET() {
    try {
        const session = await auth()
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        
        // TODO: Enforce super_admin role once we implement it properly
        if ((session.user as any).role !== "super_admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

        const admins = await listAdmins()

        // Strip passwords
        const safeAdmins = admins.map(admin => {
            const { password, ...safe } = admin
            return safe
        })

        return NextResponse.json(safeAdmins)
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        
        // TODO: Enforce super_admin role
        if ((session.user as any).role !== "super_admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

        const body = await req.json()
        const { email, password, displayName } = body

        if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 })

        const newAdmin = await createAdmin({ email, password, displayName })
        
        const { password: _, ...safeAdmin } = newAdmin as any
        return NextResponse.json(safeAdmin)
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 })
    }
}
