/* eslint-disable @typescript-eslint/no-explicit-any */
import { createCallDoc, findCallByExternalId, updateCallDoc } from "@/lib/db/collections/calls"
import { findAgentByExternalId } from "@/lib/db/collections/agents"
import { processCampaignCallCompletion } from "@/lib/services/campaign.service"
import type { NormalizedCall } from "./types"

function generateCallId(): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).slice(2, 7)
  return `call_${timestamp}${random}`
}

export async function processCall(normalized: NormalizedCall): Promise<void> {
  const existing = await findCallByExternalId(normalized.ai_call_id)

  if (existing) {
    await updateCallDoc((existing as any).id, {
      status: normalized.status,
      duration: normalized.duration,
      transcript: normalized.transcript,
      recordingUrl: normalized.recording_url,
      detailedCallSummary: normalized.call_summary,
      disconnectionReason: normalized.disconnection_reason,
      userSentiment: normalized.user_sentiment,
      callSuccessful: normalized.call_successful,
      is_processed: true,
      processing_status: "done",
      callDetails: buildCallDetails(normalized),
    })
  } else {
    const agentDoc = await findAgentByExternalId(normalized.external_agent_id)
    const callId = generateCallId()
    const userId = normalized.metadata?.user_id || (agentDoc as any)?.userId || ""

    await createCallDoc({
      callId,
      ai_call_id: normalized.ai_call_id,
      agent_id: (agentDoc as any)?.id ?? "",
      userId,
      campaign_id: normalized.metadata?.campaign_id ?? null,
      batchCallId: normalized.metadata?.batch_call_id ?? null,
      provider: normalized.provider,
      type: normalized.type,
      call_type: normalized.call_type,
      status: normalized.status,
      from: normalized.from,
      to: normalized.to,
      time: new Date(normalized.start_timestamp),
      duration: normalized.duration,
      cost: normalized.cost,
      transcript: normalized.transcript,
      recordingUrl: normalized.recording_url,
      detailedCallSummary: normalized.call_summary,
      disconnectionReason: normalized.disconnection_reason,
      userSentiment: normalized.user_sentiment,
      callSuccessful: normalized.call_successful,
      endToEndLatency: 0,
      bookmarked: false,
      recordId: normalized.metadata?.record_id ?? "",
      is_processed: true,
      processing_status: "done",
      callDetails: buildCallDetails(normalized),
      isDeleted: false,
    })
  }

  // Update campaign child + parent status on call_ended or call_analyzed.
  // Both events are accepted: call_ended fires reliably for every call;
  // call_analyzed fires only when Retell call analysis is configured.
  const campaignId = normalized.metadata?.campaign_id
  const campaignRecordId = normalized.metadata?.campaign_record_id ?? null
  const isCampaignCall =
    (normalized.event_type === "call_ended" || normalized.event_type === "call_analyzed") &&
    !!campaignId

  if (isCampaignCall) {
    try {
      const hasAnalysis = normalized.event_type === "call_analyzed" || !!normalized.call_summary
      
      await processCampaignCallCompletion(
        campaignId,
        campaignRecordId,
        normalized.ai_call_id,
        {
          duration: normalized.duration,
          disconnection_reason: normalized.disconnection_reason,
          call_analysis: hasAnalysis ? {
            call_summary: normalized.call_summary,
            call_successful: normalized.call_successful,
            user_sentiment: normalized.user_sentiment,
            in_voicemail: normalized.in_voicemail,
            custom_analysis_data: normalized.custom_analysis_data,
          } : undefined,
          start_timestamp: normalized.start_timestamp
        }
      )
    } catch (err) {
      // Log but never re-throw — must not cause Retell to retry the webhook.
      console.error("[processCall] Failed to update campaign status:", err)
    }
  }
}

function buildCallDetails(normalized: NormalizedCall) {
  return {
    call_id: normalized.ai_call_id,
    call_status: normalized.status,
    call_type: normalized.call_type,
    direction: normalized.type,
    from_number: normalized.from,
    to_number: normalized.to,
    start_timestamp: normalized.start_timestamp,
    end_timestamp: normalized.end_timestamp,
    duration_ms: normalized.duration * 1000,
    transcript: normalized.transcript,
    transcript_object: normalized.transcript_object,
    recording_url: normalized.recording_url,
    public_log_url: normalized.raw.public_log_url ?? "",
    call_analysis: {
      call_summary: normalized.call_summary,
      call_successful: normalized.call_successful,
      user_sentiment: normalized.user_sentiment,
      in_voicemail: normalized.in_voicemail,
      custom_analysis_data: normalized.custom_analysis_data,
    },
    call_cost: normalized.raw.call_cost ?? {},
    metadata: normalized.metadata,
    disconnection_reason: normalized.disconnection_reason,
    raw_provider_response: normalized.raw,
  }
}