/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    listPhoneNumbers,
    getPhoneNumber,
    updatePhoneNumber,
} from "@/lib/providers/alpha/phone-number"
import { phoneNumbersCol, createPhoneNumberDoc, getPhoneNumberDoc } from "@/lib/db/collections/phone_numbers"
import type { PhoneNumberRecord, PhoneNumbersQuery } from "@/types/phone-number"

function serialize(doc: any): PhoneNumberRecord {
    return {
        _id: doc.phone_number,
        nickname: doc.nickname ?? "",
        phone: doc.phone_number,
        // hide provider name — just show "sip" or "twilio"
        provider: doc.phone_number_type?.includes("twilio") ? "twilio" : "sip",
        status: "active",
        inbound_agent_id: doc.inbound_agent_id ?? null,
        outbound_agent_id: doc.outbound_agent_id ?? null,
        phone_number_pretty: doc.phone_number_pretty ?? doc.phone_number,
        createdAt: doc.last_modification_timestamp
            ? new Date(doc.last_modification_timestamp).toISOString()
            : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    }
}

export async function getPhoneNumbers(query: PhoneNumbersQuery = {}) {
    const { search, page = 1, limit = 10, userId } = query

    // 1. Fetch external
    const all = await listPhoneNumbers()
    let filtered = all as any[]

    if (search) {
        const s = search.toLowerCase()
        filtered = filtered.filter(
            (p: any) =>
                p.phone_number?.includes(s) ||
                p.nickname?.toLowerCase().includes(s) ||
                p.phone_number_pretty?.toLowerCase().includes(s)
        )
    }

    const total = filtered.length
    const paginated = filtered.slice((page - 1) * limit, page * limit)

    return { data: paginated.map(serialize), total, page, limit }
}

export async function getPhoneNumberById(phoneNumber: string) {
    const doc = await getPhoneNumber(phoneNumber)
    return serialize(doc)
}

export async function updatePhoneNumberNickname(
    phoneNumber: string,
    nickname: string
) {
    const doc = await updatePhoneNumber(phoneNumber, { nickname })
    return serialize(doc)
}

export async function importPhoneNumber(phoneNumber: string, userId: string) {
    // Check if it exists externally
    const external = await getPhoneNumber(phoneNumber)
    if (!external) throw new Error("Phone number not found in provider")

    // Check if already mapped
    const existing = await getPhoneNumberDoc(phoneNumber)
    if (existing && !existing.isDeleted) {
        throw new Error("Phone number already imported")
    }

    await createPhoneNumberDoc({
        id: phoneNumber,
        phone_number: phoneNumber,
        userId: userId,
        isDeleted: false,
    })

    return serialize(external)
}