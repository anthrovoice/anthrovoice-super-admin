import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { listAdmins } from "@/lib/db/collections/users"
import { getDB } from "@/lib/db/firestore"

export async function GET(req: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        
        // TODO: Enforce super_admin role
        if ((session.user as any).role !== "super_admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

        const db = getDB()

        // Get all clients
        const clients = await listAdmins()
        
        const clientStats = await Promise.all(clients.map(async (client) => {
            // Count agents
            const agentsCountSnap = await db.collection("agents")
                .where("userId", "==", client.id)
                .where("isDeleted", "==", false)
                .count().get()
            
            // Count phones
            const phonesCountSnap = await db.collection("phone_numbers")
                .where("userId", "==", client.id)
                .where("isDeleted", "==", false)
                .count().get()
                
            // Count calls
            const callsCountSnap = await db.collection("calls")
                .where("userId", "==", client.id)
                .where("isDeleted", "==", false)
                .count().get()
                
            return {
                id: client.id,
                name: client.displayName || client.email,
                email: client.email,
                agents: agentsCountSnap.data().count,
                phones: phonesCountSnap.data().count,
                calls: callsCountSnap.data().count,
            }
        }))

        const totalClients = clients.length
        const totalAgents = clientStats.reduce((acc, curr) => acc + curr.agents, 0)
        const totalPhones = clientStats.reduce((acc, curr) => acc + curr.phones, 0)
        const totalCalls = clientStats.reduce((acc, curr) => acc + curr.calls, 0)

        return NextResponse.json({
            platform: {
                clients: totalClients,
                agents: totalAgents,
                phones: totalPhones,
                calls: totalCalls
            },
            clients: clientStats.sort((a, b) => b.calls - a.calls) // Sort by highest calls
        })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
