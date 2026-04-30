import { getDB } from "../firestore"

const COL = "subscriptions"

export async function getSubscriptionDoc(companyId?: string) {
    if (companyId) {
        const snap = await getDB().collection(COL)
            .where("companyId", "==", companyId)
            .where("isActive", "==", true)
            .limit(1)
            .get()
        if (snap.empty) return null
        const doc = snap.docs[0]
        return { id: doc.id, ...doc.data() }
    }

    // fallback — get first active subscription
    const snap = await getDB().collection(COL)
        .where("isActive", "==", true)
        .limit(1)
        .get()
    if (snap.empty) return null
    const doc = snap.docs[0]
    return { id: doc.id, ...doc.data() }
}

export async function updateSubscriptionDoc(id: string, data: Record<string, any>) {
    await getDB().collection(COL).doc(id).update({
        ...data,
        updatedAt: new Date(),
    })
}