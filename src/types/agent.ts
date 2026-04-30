export type ConversationStart = "agent" | "user"

export interface AgentFunction {
    type: "end_call" | "transfer" | "press_digit"
    name: string
    description?: string
    transferNumber?: string
    transferType?: "cold" | "warm"
    displayNumber?: "agent" | "transfer"
    digit?: string
}

export interface AgentVoice {
    voice_id: string
    speed?: number
    temperature?: number
    volume?: number
}

export interface AgentRecord {
    _id: string
    externalAgentId: string
    externalLlmId: string
    name: string
    prompt: string
    first_message: string
    language: string
    voice: AgentVoice
    conversation_start: ConversationStart
    webhook_url?: string
    functions: AgentFunction[]
    status: boolean
    createdAt: string
    updatedAt: string
}

export interface AgentsResponse {
    data: AgentRecord[]
    total: number
    page: number
    limit: number
}

export interface AgentsQuery {
    page?: number
    limit?: number
    search?: string
}