import type {
    CampaignsResponse,
    CampaignRecord,
    CampaignLaunchPayload,
    ConcurrencyStatus,
} from "@/types/campaign"

const BASE = "/api/campaigns"

export async function fetchCampaigns(query: {
    page?: number; limit?: number; search?: string
} = {}): Promise<CampaignsResponse> {
    const params = new URLSearchParams()
    if (query.page) params.set("page", String(query.page))
    if (query.limit) params.set("limit", String(query.limit))
    if (query.search) params.set("search", query.search)
    const res = await fetch(`${BASE}?${params}`)
    if (!res.ok) throw new Error("Failed to fetch campaigns")
    return res.json()
}

/**
 * Creates a campaign. If no scheduled_at is provided (send_now),
 * the server immediately triggers calls up to base_concurrency.
 *
 * Returns { campaign, concurrency } — concurrency is null for scheduled campaigns.
 */
export async function createCampaign(
    payload: CampaignLaunchPayload
): Promise<{ campaign: CampaignRecord; concurrency: ConcurrencyStatus | null }> {
    const res = await fetch(BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    })
    if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error ?? "Failed to create campaign")
    }
    return res.json()
}

/**
 * Launches or resumes pending contacts of an existing campaign.
 * Used for scheduled campaigns that are now due, or to refill concurrency slots.
 */
export async function launchCampaign(
    id: string,
    baseConcurrency?: number
): Promise<{ concurrency: ConcurrencyStatus }> {
    const res = await fetch(`${BASE}/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ base_concurrency: baseConcurrency }),
    })
    if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error ?? "Failed to launch campaign")
    }
    return res.json()
}

export async function deleteCampaign(id: string): Promise<void> {
    const res = await fetch(`${BASE}/${id}`, { method: "DELETE" })
    if (!res.ok) throw new Error("Failed to delete campaign")
}