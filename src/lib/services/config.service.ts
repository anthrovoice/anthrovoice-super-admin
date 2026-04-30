import { getConfigDoc, updateConfigDoc } from "@/lib/db/collections/config"
import type { ConfigRecord } from "@/types/config"

function toDate(val: any): string | undefined {
    if (!val) return undefined
    if (val?.toDate) return val.toDate().toISOString()
    if (val instanceof Date) return val.toISOString()
    return undefined
}

export async function getConfig(userId: string): Promise<ConfigRecord> {
    const doc = await getConfigDoc(userId) as any
    if (!doc || !doc.id) return {}
    return {
        _id: doc.id,
        logo: doc.logo ?? "",
        iframe: doc.iframe ?? "",
        iframeList: doc.iframeList ?? "",
        activeProvider: doc.activeProvider ?? "alpha",
        updatedAt: toDate(doc.updatedAt),
        org_iframe: doc.org_iframe ?? "",
        dashboard_iframe: doc.dashboard_iframe ?? "",
        logo_base64: doc.logo_base64 ?? "",
        logo_mime_type: doc.logo_mime_type ?? "",
    }
}

export async function updateConfig(userId: string, data: Partial<ConfigRecord>) {
    await updateConfigDoc(userId, data)
}