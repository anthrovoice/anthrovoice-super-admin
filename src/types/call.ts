export interface CallRecord {
    _id: string
    call_id: string
    call_type: string
    call_status: string
    agent_id: string
    from: string
    to: string
    start_timestamp?: number
    end_timestamp?: number
    duration_ms?: number
    transcript?: string
    transcript_object?: TranscriptItem[]
    recording_url?: string
    public_log_url?: string
    call_analysis?: CallAnalysis
    disconnection_reason?: string
    metadata?: Record<string, any>
    createdAt: string
}

export interface TranscriptItem {
    role: "agent" | "user"
    content: string
    words?: { word: string; start: number; end: number }[]
}

export interface CallAnalysis {
    call_summary?: string
    in_voicemail?: boolean
    user_sentiment?: "Positive" | "Negative" | "Neutral" | "Unknown"
    call_successful?: boolean
    custom_analysis_data?: Record<string, any>
}

export interface CallsResponse {
    data: CallRecord[]
    total: number
    page: number
    limit: number
}

export interface CallsQuery {
    page?: number
    limit?: number
    search?: string
    agentId?: string
    dateFrom?: string
    dateTo?: string
}