import { getDB } from "../firestore"
import { toPlain } from "../utils"

const COL = "phone_numbers"
export function phoneNumbersCol() { return getDB().collection(COL) }

export async function getPhoneNumberDoc(id: string) {
    const snap = await phoneNumbersCol().doc(id).get()
    if (!snap.exists) return null
    return toPlain(snap.id, snap.data()!)
}

export async function createPhoneNumberDoc(data: Record<string, any>) {
    // If ID is provided in data (like the actual +123 number), use it
    const id = data.id || data.phone_number
    const ref = id ? phoneNumbersCol().doc(id) : phoneNumbersCol().doc()
    
    const docData = { ...data }
    if (docData.id) delete docData.id
    
    const now = new Date()
    await ref.set({ ...docData, createdAt: now, updatedAt: now })
    return { id: ref.id, ...docData }
}

export async function updatePhoneNumberDoc(id: string, data: Record<string, any>) {
    await phoneNumbersCol().doc(id).update({ ...data, updatedAt: new Date() })
}

export async function softDeletePhoneNumberDoc(id: string) {
    await phoneNumbersCol().doc(id).update({
        isDeleted: true,
        deletedAt: new Date(),
        updatedAt: new Date()
    })
}
