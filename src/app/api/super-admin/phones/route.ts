import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { getPhoneNumbers, importPhoneNumber } from "@/lib/services/phone-number.service"

export async function GET(req: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        
        // TODO: Enforce super_admin role
        if ((session.user as any).role !== "super_admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

        const { searchParams } = req.nextUrl
        const query = {
            page: Number(searchParams.get("page") ?? 1),
            limit: Number(searchParams.get("limit") ?? 50),
            search: searchParams.get("search") ?? undefined,
            // NOT passing userId here so super admin sees ALL mapped phones across all clients
        }

        const result = await getPhoneNumbers(query)
        return NextResponse.json(result)
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
        const { phoneNumber, userId } = body

        if (!phoneNumber || !userId) return NextResponse.json({ error: "Phone number and client ID are required" }, { status: 400 })

        const newPhone = await importPhoneNumber(phoneNumber, userId)
        return NextResponse.json(newPhone)
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 })
    }
}
