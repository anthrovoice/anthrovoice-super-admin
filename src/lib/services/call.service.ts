/* eslint-disable @typescript-eslint/no-explicit-any */
import { callsCol, getCallDoc } from "@/lib/db/collections/calls"
import { toPlain } from "@/lib/db/utils"
import type { CallRecord, CallsQuery } from "@/types/call"

function serialize(doc: any): CallRecord {
  const details = doc.callDetails ?? {}
  const durationMs = doc.duration ? doc.duration * 1000 : 0

  return {
    _id: doc.id ?? doc.callId,
    call_id: doc.callId ?? doc.id,
    call_type: doc.call_type ?? "phone_call",
    call_status: doc.status ?? "ended",
    agent_id: doc.agent_id ?? "",
    from: doc.from ?? "",
    to: doc.to ?? "",
    start_timestamp: details.start_timestamp ?? null,
    end_timestamp: details.end_timestamp ?? null,
    duration_ms: durationMs,
    transcript: doc.transcript ?? "",
    transcript_object: details.transcript_object ?? [],
    recording_url: doc.recordingUrl ?? "",
    public_log_url: details.public_log_url ?? "",
    call_analysis: {
      call_summary: doc.detailedCallSummary ?? "",
      call_successful: doc.callSuccessful ?? false,
      user_sentiment: doc.userSentiment ?? "Unknown",
      in_voicemail: details.call_analysis?.in_voicemail ?? false,
      custom_analysis_data: details.call_analysis?.custom_analysis_data ?? {},
    },
    disconnection_reason: doc.disconnectionReason ?? "",
    metadata: details.metadata ?? {},
    createdAt: doc.createdAt ?? new Date().toISOString(),
  }
}

export async function getCalls(query: CallsQuery & { userId?: string } = {}) {
  const { page = 1, limit = 10, search, agentId, dateFrom, dateTo, userId } = query

  let q = callsCol()
    .where("isDeleted", "==", false)
    .orderBy("createdAt", "desc") as FirebaseFirestore.Query

  if (userId) q = q.where("userId", "==", userId)

  const snap = await q.get()
  let docs = snap.docs.map((d) => toPlain(d.id, d.data()))

  if (agentId && agentId !== "all") {
    docs = docs.filter((d: any) => d.agent_id === agentId)
  }
  if (dateFrom) {
    docs = docs.filter((d: any) =>
      new Date(d.time ?? d.createdAt) >= new Date(dateFrom)
    )
  }
  if (dateTo) {
    docs = docs.filter((d: any) =>
      new Date(d.time ?? d.createdAt) <= new Date(dateTo)
    )
  }
  if (search) {
    const s = search.toLowerCase()
    docs = docs.filter((d: any) =>
      d.callId?.toLowerCase().includes(s) ||
      d.from?.includes(s) ||
      d.to?.includes(s) ||
      d.transcript?.toLowerCase().includes(s)
    )
  }

  const total = docs.length
  const paginated = docs.slice((page - 1) * limit, page * limit)
  return { data: paginated.map(serialize) as CallRecord[], total, page, limit }
}

export async function getCallByCallId(callId: string) {
  let doc = await getCallDoc(callId) as any

  if (!doc) {
    const snap = await callsCol()
      .where("callId", "==", callId)
      .limit(1).get()
    if (!snap.empty) {
      doc = toPlain(snap.docs[0].id, snap.docs[0].data())
    }
  }

  // Fallback: search by ai_call_id (Retell's call ID) which is what campaigns store
  if (!doc) {
    const snap = await callsCol()
      .where("ai_call_id", "==", callId)
      .limit(1).get()
    if (!snap.empty) {
      doc = toPlain(snap.docs[0].id, snap.docs[0].data())
    }
  }

  if (!doc) return null
  return serialize(doc)
}