import { getDB } from "../firestore"
import { toPlain } from "../utils"

const COL = "campaigns"
export function campaignsCol() { return getDB().collection(COL) }

export async function getCampaignDoc(id: string) {
    const snap = await campaignsCol().doc(id).get()
    if (!snap.exists) return null
    return toPlain(snap.id, snap.data()!)
}

export async function createCampaignDoc(data: Record<string, unknown>) {
    const ref = campaignsCol().doc()
    const now = new Date()
    await ref.set({ ...data, createdAt: now, updatedAt: now })
    return { id: ref.id, ...data, createdAt: now.toISOString(), updatedAt: now.toISOString() }
}

export async function updateCampaignDoc(id: string, data: Record<string, unknown>) {
    await campaignsCol().doc(id).update({ ...data, updatedAt: new Date() })
}

/**
 * Overwrites the entire `users` array on a campaign document.
 * Use this after mutating individual contact statuses / callIds in memory.
 */
export async function updateCampaignUsersArray(
    id: string,
    users: unknown[],
    extraFields?: Record<string, unknown>
) {
    await campaignsCol().doc(id).update({
        users,
        ...(extraFields ?? {}),
        updatedAt: new Date(),
    })
}

export async function listCampaignDocs(userId?: string) {
    let query = campaignsCol()
        .where("isDeleted", "==", false)
        .orderBy("createdAt", "desc") as FirebaseFirestore.Query
    if (userId) query = query.where("userId", "==", userId)
    const snap = await query.get()
    return snap.docs.map((d) => toPlain(d.id, d.data()))
}

export async function softDeleteCampaignDoc(id: string) {
    await campaignsCol().doc(id).update({ isDeleted: true, updatedAt: new Date() })
}