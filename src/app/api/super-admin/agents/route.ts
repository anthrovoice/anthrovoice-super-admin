import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { getAgents, importAgent } from "@/lib/services/agent.service"

export async function GET(req: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        if ((session.user as any).role !== "super_admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

        const { searchParams } = req.nextUrl
        const query = {
            page: Number(searchParams.get("page") ?? 1),
            limit: Number(searchParams.get("limit") ?? 50),
            search: searchParams.get("search") ?? undefined,
        }

        const result = await getAgents(query)
        // Note: result.data includes ALL agents on Retell that have a DB mapping.
        // It also includes those that don't have a mapping but we filter them out below
        const importedOnly = result.data.filter(a => a._id && a._id !== a.externalAgentId)
        
        return NextResponse.json({ ...result, data: importedOnly })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        if ((session.user as any).role !== "super_admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

        const body = await req.json()
        const { agentId, userId } = body

        if (!agentId || !userId) return NextResponse.json({ error: "Agent ID and Client ID are required" }, { status: 400 })

        const newAgent = await importAgent(agentId, userId)
        return NextResponse.json(newAgent)
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 })
    }
}
