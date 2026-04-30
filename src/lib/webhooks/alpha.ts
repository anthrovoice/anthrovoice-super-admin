// Normalizer for Provider Alpha (Retell AI)
// Maps Retell webhook payload → NormalizedCall

import type { NormalizedCall } from "./types"

export function normalizeAlphaPayload(payload: any): NormalizedCall | null {
    // Accept call_ended (basic termination) and call_analyzed (with full analysis data).
    if (payload.event !== "call_ended" && payload.event !== "call_analyzed") return null


    const call = payload.call ?? payload

    return {
        provider: "alpha",
        event_type: payload.event,
        ai_call_id: call.call_id ?? "",
        external_agent_id: call.agent_id ?? "",

        type: call.direction === "inbound" ? "inbound" : "outbound",
        call_type: call.call_type ?? "phone_call",
        from: call.from_number ?? "",
        to: call.to_number ?? "",
        status: "ended",
        duration: call.duration_ms ? Math.floor(call.duration_ms / 1000) : 0,
        cost: call.call_cost?.combined_cost ?? 0,

        transcript: call.transcript ?? "",
        transcript_object: call.transcript_object ?? [],
        recording_url: call.recording_url ?? "",
        disconnection_reason: call.disconnection_reason ?? "",

        call_successful: call.call_analysis?.call_successful ?? false,
        user_sentiment: call.call_analysis?.user_sentiment ?? "Unknown",
        call_summary: call.call_analysis?.call_summary ?? "",
        in_voicemail: call.call_analysis?.in_voicemail ?? false,
        custom_analysis_data: call.call_analysis?.custom_analysis_data ?? {},

        start_timestamp: call.start_timestamp ?? Date.now(),
        end_timestamp: call.end_timestamp ?? Date.now(),

        metadata: call.metadata ?? {},

        raw: call,
    }
}

export function verifyAlphaSignature(
    rawBody: string,
    signature: string,
    secret: string
): boolean {
    // Skip verification if no secret configured
    if (!secret) return true

    try {
        const crypto = require("crypto")
        const hmac = crypto
            .createHmac("sha256", secret)
            .update(rawBody)
            .digest("hex")
        return hmac === signature
    } catch {
        return false
    }
}