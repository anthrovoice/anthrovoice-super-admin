import { getDB } from "../firestore"
import { toPlain } from "../utils"

const COL = "locations"
export function locationsCol() { return getDB().collection(COL) }

export async function getLocationDoc(id: string) {
    const snap = await locationsCol().doc(id).get()
    if (!snap.exists) return null
    return toPlain(snap.id, snap.data()!)
}

export async function listLocationsByAdmin(adminId: string) {
    const snap = await locationsCol()
        .where("adminId", "==", adminId)
        .where("isDeleted", "==", false)
        .orderBy("createdAt", "asc")
        .get()
    return snap.docs.map((d) => toPlain(d.id, d.data()))
}

export async function createLocationDoc(data: Record<string, any>) {
    const ref = locationsCol().doc()
    const now = new Date()
    await ref.set({ ...data, isDeleted: false, createdAt: now, updatedAt: now })
    return toPlain(ref.id, { ...data, isDeleted: false, createdAt: now.toISOString(), updatedAt: now.toISOString() })
}

export async function updateLocationDoc(id: string, data: Record<string, any>) {
    await locationsCol().doc(id).update({ ...data, updatedAt: new Date() })
}

export async function deleteLocationDoc(id: string) {
    await locationsCol().doc(id).update({ isDeleted: true, updatedAt: new Date() })
}
