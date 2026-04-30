import { getDB } from "../firestore"
import { toPlain } from "../utils"

const COL = "calls"
export function callsCol() { return getDB().collection(COL) }

export async function getCallDoc(id: string) {
    const snap = await callsCol().doc(id).get()
    if (!snap.exists) return null
    return toPlain(snap.id, snap.data()!)
}

export async function findCallByExternalId(externalCallId: string) {
    const snap = await callsCol()
        .where("ai_call_id", "==", externalCallId)
        .limit(1).get()
    if (snap.empty) return null
    return toPlain(snap.docs[0].id, snap.docs[0].data())
}

export async function createCallDoc(data: Record<string, any>) {
    const ref = callsCol().doc()
    const now = new Date()
    await ref.set({ ...data, createdAt: now, updatedAt: now })
    return { id: ref.id, ...data, createdAt: now.toISOString(), updatedAt: now.toISOString() }
}

export async function updateCallDoc(id: string, data: Record<string, any>) {
    await callsCol().doc(id).update({ ...data, updatedAt: new Date() })
}

export async function listCallDocs(params: {
    userId?: string
    agentId?: string
    limit?: number
} = {}) {
    let query = callsCol()
        .orderBy("createdAt", "desc") as FirebaseFirestore.Query
    if (params.userId) query = query.where("userId", "==", params.userId)
    if (params.agentId) query = query.where("agent_id", "==", params.agentId)
    if (params.limit) query = query.limit(params.limit)
    const snap = await query.get()
    return snap.docs.map((d) => toPlain(d.id, d.data()))
}