// Frontend fetch functions — UI imports only from here, never from services or API routes.
// If the API contract changes, update here and TypeScript will catch all call sites.

import type { PhoneNumbersQuery, PhoneNumbersResponse } from "@/types/phone-number"

const BASE = "/api/phone-numbers"

export async function fetchPhoneNumbers(
    query: PhoneNumbersQuery = {}
): Promise<PhoneNumbersResponse> {
    const params = new URLSearchParams()

    if (query.page) params.set("page", String(query.page))
    if (query.limit) params.set("limit", String(query.limit))
    if (query.search) params.set("search", query.search)

    const res = await fetch(`${BASE}?${params.toString()}`)

    if (!res.ok) {
        throw new Error("Failed to fetch phone numbers")
    }

    return res.json()
}