export type CampaignStatus =
    | "pending"
    | "in_progress"
    | "running"
    | "completed"
    | "failed"
    | "scheduled"
    | "cancelled"

export interface CampaignContact {
    campaign_record_id: string                                     // unique per-contact, sent in Retell metadata
    number: string
    status: "pending" | "in_progress" | "completed" | "failed"
    callId: string | null
    failureReason: string | null
    options?: Record<string, unknown>
    
    // Call details populated from webhooks
    duration?: number
    disconnection_reason?: string
    call_analysis?: {
        call_summary?: string
        call_successful?: boolean
        user_sentiment?: string
        in_voicemail?: boolean
        custom_analysis_data?: Record<string, unknown>
    }
    start_timestamp?: number
}

export interface CampaignRecord {
    _id: string
    name: string
    agent_id: string
    agent_name: string
    from_number: string
    status: CampaignStatus | string
    total_calls: number
    completed_calls: number
    failed_calls: number
    base_concurrency?: number
    scheduled_at?: string
    createdAt?: string
    updatedAt?: string
}

export interface CampaignsResponse {
    data: CampaignRecord[]
    total: number
    page: number
    limit: number
}

export interface CampaignsQuery {
    page?: number
    limit?: number
    search?: string
}

/** Body accepted by POST /api/campaigns */
export interface CampaignLaunchPayload {
    name: string
    agent_id: string
    agent_name: string
    from_number: string
    contacts: { number: string; options?: Record<string, unknown> }[]
    scheduled_at?: string
    /** Max concurrent calls for this campaign. Hard-capped at 20 for Alpha. Defaults to 10. */
    base_concurrency?: number
    userId?: string
}

/** Returned alongside campaign data from create/launch endpoints */
export interface ConcurrencyStatus {
    base_concurrency: number
    current_concurrency: number
    available_concurrency: number
    triggered: number
}

/** Full campaign detail including per-contact call statuses */
export interface CampaignDetail extends CampaignRecord {
    contacts: CampaignContact[]
}