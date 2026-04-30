/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    listCampaignDocs,
    createCampaignDoc,
    getCampaignDoc,
    updateCampaignDoc,
    updateCampaignUsersArray,
    softDeleteCampaignDoc,
} from "@/lib/db/collections/campaigns"
import { getAgentDoc, findAgentByExternalId } from "@/lib/db/collections/agents"
import {
    createPhoneCall,
    getActiveConcurrentCallCount,
    ALPHA_MAX_CONCURRENCY,
} from "@/lib/providers/alpha/call"
import type { CampaignRecord, CampaignContact, ConcurrencyStatus } from "@/types/campaign"

// ---------------------------------------------------------------------------
// ID generation — follows the same pattern as generateCallId() in processor.ts
// ---------------------------------------------------------------------------

function generateRecordId(): string {
    const timestamp = Date.now().toString(36)
    const random = Math.random().toString(36).slice(2, 7)
    return `rec_${timestamp}${random}`
}

// ---------------------------------------------------------------------------
// Serialisation helpers
// ---------------------------------------------------------------------------

function toDate(val: any): string | undefined {
    if (!val) return undefined
    if (val?.toDate) return val.toDate().toISOString()
    if (val instanceof Date) return val.toISOString()
    return undefined
}

function serialize(doc: any): CampaignRecord {
    return {
        _id: doc.id,
        name: doc.name,
        agent_id: doc.agentId ?? doc.agent_id ?? "",
        agent_name: doc.agent_name ?? "",
        from_number: doc.from_number ?? "",
        status: doc.status ?? "pending",
        total_calls: doc.totalCalls ?? doc.total_calls ?? 0,
        completed_calls: doc.completedCalls ?? doc.completed_calls ?? 0,
        failed_calls: doc.failedCalls ?? doc.failed_calls ?? 0,
        base_concurrency: doc.baseConcurrency ?? doc.base_concurrency ?? undefined,
        scheduled_at: toDate(doc.scheduleDateTime ?? doc.scheduled_at),
        createdAt: toDate(doc.createdAt),
        updatedAt: toDate(doc.updatedAt),
    }
}

// ---------------------------------------------------------------------------
// Read
// ---------------------------------------------------------------------------

export async function getCampaigns({
    page = 1, limit = 10, search, userId,
}: { page?: number; limit?: number; search?: string; userId?: string } = {}) {
    const all = await listCampaignDocs(userId)
    let filtered = all
    if (search) {
        const s = search.toLowerCase()
        filtered = all.filter((d: any) => d.name?.toLowerCase().includes(s))
    }
    const total = filtered.length
    const paginated = filtered.slice((page - 1) * limit, page * limit)
    return { data: paginated.map(serialize), total, page, limit }
}

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------

export async function createCampaign(payload: {
    name: string
    agent_id: string
    agent_name: string
    from_number: string
    contacts: { number: string; options?: Record<string, any> }[]
    scheduled_at?: string
    base_concurrency?: number
    userId?: string
}) {
    const doc = await createCampaignDoc({
        name: payload.name,
        agentId: payload.agent_id,
        agent_name: payload.agent_name,
        from_number: payload.from_number,
        userId: payload.userId ?? "",
        users: payload.contacts.map((c) => ({
            campaign_record_id: generateRecordId(),
            number: c.number,
            options: c.options ?? {},
            status: "pending",
            callId: null,
            failureReason: null,
        })),
        totalCalls: payload.contacts.length,
        total_task_count: payload.contacts.length,
        status: payload.scheduled_at ? "scheduled" : "pending",
        scheduleDateTime: payload.scheduled_at ? new Date(payload.scheduled_at) : null,
        send_now: !payload.scheduled_at,
        baseConcurrency: Math.min(
            payload.base_concurrency ?? 10,
            ALPHA_MAX_CONCURRENCY
        ),
        completedCalls: 0,
        failedCalls: 0,
        sent_count: 0,
        completed_count: 0,
        picked_up_count: 0,
        external_batch_id: null,
        external_status: null,
        isDeleted: false,
    })
    return serialize(doc)
}

// ---------------------------------------------------------------------------
// Launch / Concurrency-aware batch trigger
// ---------------------------------------------------------------------------

/**
 * Launches pending contacts of a campaign respecting Alpha concurrency limits.
 *
 * Formula:  available = base_concurrency − current_concurrency
 *           to_trigger = min(available, pending_contacts)
 *
 * @returns ConcurrencyStatus with how many calls were triggered this batch.
 */
export async function launchCampaignCalls(
    campaignId: string,
    baseConcurrencyOverride?: number
): Promise<ConcurrencyStatus> {
    // 1. Load campaign
    const doc = await getCampaignDoc(campaignId)
    if (!doc) throw new Error(`Campaign not found: ${campaignId}`)

    // 2. Resolve agent external ID
    const agentId: string = doc.agentId ?? doc.agent_id ?? ""
    let agentRecord: any = await getAgentDoc(agentId)
    if (!agentRecord) agentRecord = await findAgentByExternalId(agentId)
    if (!agentRecord) throw new Error("Agent not found for campaign")
    const externalAgentId: string = agentRecord.externalAgentId
    if (!externalAgentId) throw new Error("Agent has no external ID")

    // 3. Determine concurrency budget
    const baseConcurrency = Math.min(
        baseConcurrencyOverride ?? doc.baseConcurrency ?? 10,
        ALPHA_MAX_CONCURRENCY
    )
    const currentConcurrency = await getActiveConcurrentCallCount()
    const availableConcurrency = Math.max(0, baseConcurrency - currentConcurrency)

    // 4. Find pending contacts
    const users: CampaignContact[] = Array.isArray(doc.users) ? doc.users : []
    const pendingIndexes = users
        .map((u, i) => ({ u, i }))
        .filter(({ u }) => u.status === "pending")
        .slice(0, availableConcurrency)

    // 5. Fire calls
    let triggered = 0
    const updatedUsers = [...users]

    await Promise.allSettled(
        pendingIndexes.map(async ({ u, i }) => {
            try {
                const call = await createPhoneCall({
                    fromNumber: doc.from_number,
                    toNumber: u.number,
                    externalAgentId,
                    metadata: {
                        triggered_from: "campaign",
                        campaign_id: campaignId,
                        // campaign_record_id lets the webhook processor identify this exact
                        // contact row inside campaign.users[] without scanning by phone number.
                        campaign_record_id: u.campaign_record_id,
                        user_id: doc.userId ?? "",
                    },
                })
                updatedUsers[i] = {
                    ...u,
                    status: "in_progress",
                    callId: call.call_id ?? null,
                    failureReason: null,
                }
                triggered++
            } catch (err: any) {
                updatedUsers[i] = {
                    ...u,
                    status: "failed",
                    callId: null,
                    failureReason: err?.message ?? "Unknown error",
                }
            }
        })
    )

    // 6. Persist updated users array + campaign status
    const newStatus =
        doc.status === "pending" || doc.status === "scheduled"
            ? "in_progress"
            : doc.status

    await updateCampaignUsersArray(campaignId, updatedUsers, {
        status: newStatus,
        sent_count: (doc.sent_count ?? 0) + triggered,
    })

    return {
        base_concurrency: baseConcurrency,
        current_concurrency: currentConcurrency,
        available_concurrency: availableConcurrency,
        triggered,
    }
}

// ---------------------------------------------------------------------------
// Delete
// ---------------------------------------------------------------------------

export async function deleteCampaign(id: string) {
    await softDeleteCampaignDoc(id)
}

export async function getCampaign(id: string): Promise<CampaignRecord> {
    const doc = await getCampaignDoc(id)
    if (!doc) throw new Error(`Campaign not found: ${id}`)
    return serialize(doc)
}

export async function getCampaignDetail(id: string): Promise<import("@/types/campaign").CampaignDetail> {
    const doc = await getCampaignDoc(id)
    if (!doc) throw new Error(`Campaign not found: ${id}`)

    const contacts: CampaignContact[] = Array.isArray(doc.users)
        ? doc.users.map((u: any) => ({
            campaign_record_id: u.campaign_record_id ?? "",
            number: u.number ?? "",
            status: u.status ?? "pending",
            callId: u.callId ?? null,
            failureReason: u.failureReason ?? null,
            options: u.options ?? {},
            duration: u.duration,
            disconnection_reason: u.disconnection_reason,
            call_analysis: u.call_analysis,
            start_timestamp: u.start_timestamp,
        }))
        : []

    return { ...serialize(doc), contacts }
}

// ---------------------------------------------------------------------------
// Webhook: update child + parent status on call completion
// ---------------------------------------------------------------------------

/**
 * Called by the webhook processor when a call terminates.
 * Updates the individual contact status and recomputes the campaign's overall progress.
 */
export async function processCampaignCallCompletion(
    campaignId: string,
    campaignRecordId: string | null,
    retellCallId: string,
    callDetails?: {
        duration: number
        disconnection_reason: string
        call_analysis: any
        start_timestamp: number
    }
): Promise<void> {
    // 1. Load the campaign doc
    const doc = await getCampaignDoc(campaignId)
    if (!doc) {
        console.warn(`[processCampaignCallCompletion] Campaign not found: ${campaignId}`)
        return
    }

    const users: CampaignContact[] = Array.isArray(doc.users) ? doc.users : []

    // 2. Find the contact (prefer campaign_record_id, fall back to callId)
    let contactIndex = -1
    if (campaignRecordId) {
        contactIndex = users.findIndex((u: any) => u.campaign_record_id === campaignRecordId)
    }
    if (contactIndex === -1 && retellCallId) {
        contactIndex = users.findIndex((u: any) => u.callId === retellCallId)
    }

    if (contactIndex === -1) {
        console.warn(
            `[processCampaignCallCompletion] Contact not found:`,
            `campaign_record_id=${campaignRecordId} retellCallId=${retellCallId}`
        )
        return
    }

    // 3. Update the contact.
    const existing = users[contactIndex]

    const updatedUsers = [...users]
    updatedUsers[contactIndex] = {
        ...existing,
        status: "completed",
        // Merge in new details if provided
        ...(callDetails ? {
            duration: callDetails.duration,
            disconnection_reason: callDetails.disconnection_reason,
            call_analysis: callDetails.call_analysis,
            start_timestamp: callDetails.start_timestamp,
        } : {})
    }

    // 4. Recompute parent counters from the updated array (source of truth)
    const completedCalls = updatedUsers.filter((u) => u.status === "completed").length
    const failedCalls = updatedUsers.filter((u) => u.status === "failed").length
    const allTerminal = updatedUsers.every(
        (u) => u.status === "completed" || u.status === "failed"
    )

    // 5. Determine parent campaign status
    const campaignStatus = allTerminal ? "completed" : "in_progress"

    // 6. Write everything back in one Firestore update
    await updateCampaignUsersArray(campaignId, updatedUsers, {
        completedCalls,
        failedCalls,
        completed_count: completedCalls,
        status: campaignStatus,
    })

    console.log(
        `[processCampaignCallCompletion] campaign=${campaignId} ` +
        `record=${campaignRecordId ?? retellCallId} ` +
        `completed=${completedCalls} failed=${failedCalls} allDone=${allTerminal}`
    )
}