import type { AgentsQuery, AgentsResponse, AgentRecord } from "@/types/agent"

const BASE = "/api/agents"

// Payload shape that matches createAgentWithLLM / updateAgentWithLLM in service
export interface AgentPayload {
    name: string
    prompt: string
    first_message?: string
    voice_id: string
    language?: string
    conversation_start?: "agent" | "user"
    webhook_url?: string
}

export async function fetchAgents(query: AgentsQuery = {}): Promise<AgentsResponse> {
    const params = new URLSearchParams()
    if (query.page) params.set("page", String(query.page))
    if (query.limit) params.set("limit", String(query.limit))
    if (query.search) params.set("search", query.search)
    const res = await fetch(`${BASE}?${params}`)
    if (!res.ok) throw new Error("Failed to fetch agents")
    return res.json()
}

export async function fetchAgentById(id: string): Promise<AgentRecord> {
    const res = await fetch(`${BASE}/${id}`)
    if (!res.ok) throw new Error("Failed to fetch agent")
    return res.json()
}

export async function createAgent(payload: AgentPayload): Promise<AgentRecord> {
    const res = await fetch(BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    })
    if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error ?? "Failed to create agent")
    }
    return res.json()
}

export async function updateAgent(id: string, payload: Partial<AgentPayload>): Promise<AgentRecord> {
    const res = await fetch(`${BASE}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    })
    if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error ?? "Failed to update agent")
    }
    return res.json()
}

export async function deleteAgent(id: string): Promise<void> {
    const res = await fetch(`${BASE}/${id}`, { method: "DELETE" })
    if (!res.ok) throw new Error("Failed to delete agent")
}