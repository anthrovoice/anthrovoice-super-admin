/* eslint-disable @typescript-eslint/no-explicit-any */
import { callsCol } from "@/lib/db/collections/calls"
import { toPlain } from "@/lib/db/utils"

export async function getDashboardStats(userId?: string) {
  let q = callsCol()
    .where("isDeleted", "==", false) as FirebaseFirestore.Query
  if (userId) q = q.where("userId", "==", userId)

  const snap = await q.get()
  const allCalls = snap.docs.map((d) => d.data())
  const totalCalls = allCalls.length
  const escalatedCalls = allCalls.filter((c) => c.disconnectionReason === "call_transfer").length
  const successfulCalls = allCalls.filter((c) => c.callSuccessful === true).length
  const voicemailCalls = allCalls.filter((c) => c.callDetails?.call_analysis?.in_voicemail === true).length
  const aiHandled = totalCalls - escalatedCalls

  return {
    totalCalls,
    successfulCalls,
    escalatedCalls,
    voicemailCalls,
    aiHandled,
    aiHandledPercent: totalCalls > 0 ? Math.round((aiHandled / totalCalls) * 100) : 0,
    escalatedPercent: totalCalls > 0 ? Math.round((escalatedCalls / totalCalls) * 100) : 0,
    successRate: totalCalls > 0 ? Math.round((successfulCalls / totalCalls) * 100) : 0,
    escalationSuccessRate: totalCalls > 0 ? Math.round((escalatedCalls / totalCalls) * 100) : 0,
  }
}

export async function getLiveCallCount(userId?: string): Promise<number> {
  try {
    let q = callsCol().where("status", "==", "ongoing") as FirebaseFirestore.Query
    if (userId) q = q.where("userId", "==", userId)
    const snap = await q.get()
    return snap.size
  } catch {
    return 0
  }
}

export async function getCallDistribution(userId?: string) {
  let q = callsCol().where("isDeleted", "==", false) as FirebaseFirestore.Query
  if (userId) q = q.where("userId", "==", userId)

  const snap = await q.get()
  const groups: Record<string, number> = {}

  snap.docs.forEach((d) => {
    const reason = d.data().disconnectionReason ?? "unknown"
    const label = DISCONNECTION_LABELS[reason] ?? reason
    groups[label] = (groups[label] ?? 0) + 1
  })

  return Object.entries(groups)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)
}

export async function getInboundLeads({
  page = 1,
  limit = 10,
  sentiment,
  successful,
  userId,
}: {
  page?: number
  limit?: number
  sentiment?: string
  successful?: string
  userId?: string
} = {}) {
  let q = callsCol()
    .where("isDeleted", "==", false)
    .where("status", "==", "ended")
    .orderBy("createdAt", "desc") as FirebaseFirestore.Query

  if (userId) q = q.where("userId", "==", userId)

  const snap = await q.get()
  let docs = snap.docs.map((d) => toPlain(d.id, d.data()))

  if (sentiment && sentiment !== "all") {
    docs = docs.filter((d: any) => d.userSentiment === sentiment)
  }
  if (successful && successful !== "all") {
    docs = docs.filter((d: any) => String(d.callSuccessful) === successful)
  }

  const total = docs.length
  const paginated = docs.slice((page - 1) * limit, page * limit)
  return { data: paginated, total, page, limit }
}

const DISCONNECTION_LABELS: Record<string, string> = {
  user_hangup: "User Hangup",
  agent_hangup: "Agent Hangup",
  call_transfer: "Transferred",
  voicemail_reached: "Voicemail",
  inactivity: "Inactivity",
  machine_detected: "Machine Detected",
  max_duration_reached: "Max Duration",
  concurrency_limit_reached: "Concurrency Limit",
  dial_busy: "Busy",
  dial_failed: "Failed",
  dial_no_answer: "No Answer",
  error_inbound_webhook: "Webhook Error",
  unknown: "Unknown",
}