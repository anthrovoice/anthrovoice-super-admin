export interface SubscriptionRecord {
    _id?: string
    available_credits: number
    total_credits: number
    used_credits: number
    validity?: string
    plan?: string
    daily_usage: { date: string; credits: number }[]
    weekly_usage: { week: string; credits: number }[]
    monthly_usage: { month: string; credits: number }[]
}