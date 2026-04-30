import { getSubscriptionDoc } from "@/lib/db/collections/subscriptions"
import type { SubscriptionRecord } from "@/types/subscription"

function toDate(val: any): string | undefined {
    if (!val) return undefined
    if (val?.toDate) return val.toDate().toISOString()
    if (val instanceof Date) return val.toISOString()
    return undefined
}

export async function getSubscription(): Promise<SubscriptionRecord> {
    const doc = await getSubscriptionDoc() as any

    if (!doc) {
        return {
            available_credits: 0,
            total_credits: 0,
            used_credits: 0,
            daily_usage: [],
            weekly_usage: [],
            monthly_usage: [],
        }
    }

    return {
        _id: doc.id,
        available_credits: doc.monthlyCredits ?? 0,
        total_credits: doc.monthlyCredits ?? 0,
        used_credits: 0,
        validity: toDate(doc.validUntil) ?? "",
        plan: doc.planType ?? "",
        daily_usage: [],
        weekly_usage: [],
        monthly_usage: [],
    }
}