import type { CallsQuery, CallsResponse, CallRecord } from "@/types/call"

const BASE = "/api/calls"

export async function fetchCalls(query: CallsQuery = {}): Promise<CallsResponse> {
    const params = new URLSearchParams()
    if (query.page) params.set("page", String(query.page))
    if (query.limit) params.set("limit", String(query.limit))
    if (query.search) params.set("search", query.search)
    if (query.agentId) params.set("agentId", query.agentId)
    if (query.dateFrom) params.set("dateFrom", query.dateFrom)
    if (query.dateTo) params.set("dateTo", query.dateTo)

    const res = await fetch(`${BASE}?${params}`)
    if (!res.ok) throw new Error("Failed to fetch calls")
    return res.json()
}

export async function triggerCall(payload: {
    agentId: string
    fromNumber: string
    toNumber: string
}): Promise<{ success: boolean; call_id: string }> {
    const res = await fetch(`${BASE}/trigger`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    })
    if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? "Failed to trigger call")
    }
    return res.json()
}