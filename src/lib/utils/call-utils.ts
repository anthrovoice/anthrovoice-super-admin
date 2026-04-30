import type { CallRecord } from "@/types/call"

export function deriveStatus(call: CallRecord): string {
    if (call.call_status === "ongoing") return "Ongoing"
    if (call.call_status === "error") return "Error"
    if (call.disconnection_reason === "user_hangup") return "User Hangup"
    if (call.disconnection_reason === "agent_hangup") return "Agent Hangup"
    if (call.disconnection_reason === "call_transfer") return "Transferred"
    if (call.call_analysis?.call_successful === true) return "Completed"
    if (call.call_status === "ended") return "Ended"
    return "Registered"
}

export function formatDuration(ms?: number): string {
    if (!ms) return "—"
    const totalSeconds = Math.floor(ms / 1000)
    const m = Math.floor(totalSeconds / 60)
    const s = totalSeconds % 60
    return `${m}:${String(s).padStart(2, "0")}`
}

export function formatTimestamp(ts?: number): string {
    if (!ts) return "—"
    return new Date(ts).toLocaleString([], {
        year: "numeric", month: "2-digit", day: "2-digit",
        hour: "2-digit", minute: "2-digit",
    })
}