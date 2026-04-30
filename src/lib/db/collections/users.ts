import { getDB } from "../firestore"
import { toPlain } from "../utils"

const COL = "users"
export function usersCol() { return getDB().collection(COL) }

export async function getUserDoc(id: string) {
    const snap = await usersCol().doc(id).get()
    if (!snap.exists) return null
    return toPlain(snap.id, snap.data()!)
}

export async function findUserByEmail(email: string) {
    const snap = await usersCol()
        .where("email", "==", email)
        .limit(1).get()
    if (snap.empty) return null
    return toPlain(snap.docs[0].id, snap.docs[0].data())
}

export async function createUserDoc(data: Record<string, any>) {
    const ref = usersCol().doc()
    const now = new Date()
    await ref.set({ ...data, createdAt: now, updatedAt: now })
    return { id: ref.id, ...data }
}

export async function updateUserDoc(id: string, data: Record<string, any>) {
    await usersCol().doc(id).update({ ...data, updatedAt: new Date() })
}

export async function listManagersByAdminId(adminId: string) {
    const snap = await usersCol()
        .where("adminId", "==", adminId)
        .where("role", "==", "manager")
        .orderBy("createdAt", "asc")
        .get()
    return snap.docs.map((d) => toPlain(d.id, d.data()))
}

export async function deleteUserDoc(id: string) {
    await usersCol().doc(id).delete()
}

export async function listAdmins() {
    const snap = await usersCol()
        .where("role", "in", ["admin", "user"]) // Fetching 'user' for legacy support before migration
        .get()
    const docs = snap.docs.map((d) => toPlain(d.id, d.data()))
    // Sort in memory to avoid needing a composite index
    return docs.sort((a, b) => {
        const t1 = new Date(b.createdAt || 0).getTime()
        const t2 = new Date(a.createdAt || 0).getTime()
        return t1 - t2
    })
}