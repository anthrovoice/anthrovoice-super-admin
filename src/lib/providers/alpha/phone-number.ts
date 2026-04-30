import { client } from "./client"

export async function listPhoneNumbers() {
    return client.phoneNumber.list()
}

export async function getPhoneNumber(number: string) {
    return client.phoneNumber.retrieve(number)
}

export async function updatePhoneNumber(
    number: string,
    data: {
        nickname?: string
        inbound_agent_id?: string
        outbound_agent_id?: string
    }
) {
    return client.phoneNumber.update(number, data)
}