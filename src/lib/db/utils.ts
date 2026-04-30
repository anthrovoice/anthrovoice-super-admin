import { Timestamp } from "firebase-admin/firestore"

function convertValue(v: any): any {
    if (v instanceof Timestamp) {
        return v.toDate().toISOString()
    }
    if (v && typeof v === "object" && "_seconds" in v && "_nanoseconds" in v) {
        return new Date(v._seconds * 1000).toISOString()
    }
    if (Array.isArray(v)) {
        return v.map(convertValue)
    }
    if (v && typeof v === "object" && !(v instanceof Date)) {
        return convertObject(v)
    }
    return v
}

function convertObject(data: Record<string, any>): Record<string, any> {
    const result: Record<string, any> = {}
    for (const [k, v] of Object.entries(data)) {
        result[k] = convertValue(v)
    }
    return result
}

export function toPlain(id: string, data: FirebaseFirestore.DocumentData): any {
    return { id, ...convertObject(data) }
}