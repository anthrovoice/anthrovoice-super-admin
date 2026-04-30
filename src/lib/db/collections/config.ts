import { getDB } from "../firestore"
import { toPlain } from "../utils"

const COL = "config"

export async function getConfigDoc(userId: string) {
    if (!userId) return {}
    const snap = await getDB().collection(COL).doc(userId).get()
    if (!snap.exists) return {}
    return toPlain(snap.id, snap.data()!)
}

export async function updateConfigDoc(userId: string, data: Record<string, any>) {
    if (!userId) throw new Error("userId is required")
    await getDB().collection(COL).doc(userId)
        .set({ ...data, updatedAt: new Date() }, { merge: true })
}