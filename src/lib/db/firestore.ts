import { initializeApp, getApps, applicationDefault } from "firebase-admin/app"
import { getFirestore, Settings } from "firebase-admin/firestore"
import type { Firestore } from "firebase-admin/firestore"

let db: Firestore | null = null

export function getDB(): Firestore {
    if (!db) {
        if (!getApps().length) {
            initializeApp({ credential: applicationDefault() })
        }
        db = getFirestore()
        // Only call settings() once on first initialization
        try {
            db.settings({ ignoreUndefinedProperties: true })
        } catch {
            // Already initialized — ignore
        }
    }
    return db
}