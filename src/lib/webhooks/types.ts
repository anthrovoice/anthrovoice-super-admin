// Shared normalized call schema — provider agnostic
// Every provider normalizer must produce this exact shape

export type ProviderType = "alpha" | "beta" | string  // extensible for future providers

export interface NormalizedCall {
    provider: ProviderType
    event_type: string               // original event name e.g. "call_ended" | "call_analyzed"
    ai_call_id: string               // provider's call id — never shown in UI
    external_agent_id: string        // provider's agent id — used to find our agentId

    type: "inbound" | "outbound"
    call_type: string
    from: string
    to: string
    status: string
    duration: number             // seconds
    cost: number

    transcript: string
    transcript_object: any[]
    recording_url: string
    disconnection_reason: string

    call_successful: boolean
    user_sentiment: string
    call_summary: string
    in_voicemail: boolean
    custom_analysis_data: Record<string, any>

    start_timestamp: number
    end_timestamp: number

    metadata: Record<string, any>

    raw: Record<string, any>    // full provider payload stored in callDetails
}