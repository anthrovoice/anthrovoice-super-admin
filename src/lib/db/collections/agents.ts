import { getDB } from "../firestore"
import { toPlain } from "../utils"

const COL = "agents"
export function agentsCol() { return getDB().collection(COL) }

export async function getAgentDoc(id: string) {
    const snap = await agentsCol().doc(id).get()
    if (!snap.exists) return null
    return toPlain(snap.id, snap.data()!)
}

export async function findAgentByExternalId(externalId: string) {
    const snap = await agentsCol()
        .where("externalAgentId", "==", externalId)
        .where("isDeleted", "==", false)
        .limit(1).get()
    if (snap.empty) return null
    return toPlain(snap.docs[0].id, snap.docs[0].data())
}

export async function listAgentDocs() {
    const snap = await agentsCol()
        .where("isDeleted", "==", false)
        .orderBy("createdAt", "desc").get()
    return snap.docs.map((d) => toPlain(d.id, d.data()))
}

export async function createAgentDoc(data: Record<string, any>) {
    const ref = agentsCol().doc()
    const now = new Date()
    await ref.set({ ...data, createdAt: now, updatedAt: now })
    return { id: ref.id, ...data, createdAt: now.toISOString(), updatedAt: now.toISOString() }
}

export async function updateAgentDoc(id: string, data: Record<string, any>) {
    await agentsCol().doc(id).update({ ...data, updatedAt: new Date() })
}

export async function softDeleteAgentDoc(id: string) {
    await agentsCol().doc(id).update({
        isDeleted: true, deletedAt: new Date(),
        status: false, updatedAt: new Date(),
    })
}