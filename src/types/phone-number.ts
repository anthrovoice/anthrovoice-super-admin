export interface PhoneNumberRecord {
    _id: string
    nickname: string
    phone: string
    provider: string
    status: string
    inbound_agent_id?: string | null
    outbound_agent_id?: string | null
    phone_number_pretty?: string
    createdAt: string
    updatedAt: string
}

export interface PhoneNumbersResponse {
    data: PhoneNumberRecord[]
    total: number
    page: number
    limit: number
}

export interface PhoneNumbersQuery {
    page?: number
    limit?: number
    search?: string
    userId?: string
}