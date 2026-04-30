/* eslint-disable @typescript-eslint/no-explicit-any */
import { client } from "./client"

export async function listAgents() {
    return client.agent.list()
}

export async function getAgent(externalAgentId: string) {
    return client.agent.retrieve(externalAgentId)
}

export async function createAgent(data: {
    name: string
    voice_id: string
    llm_id: string
    language?: string
    webhook_url?: string
}) {
    return client.agent.create({
        agent_name: data.name,
        voice_id: data.voice_id,
        response_engine: {
            type: "retell-llm",
            llm_id: data.llm_id,
        },
        language: (data.language ?? "en-US") as any,
        webhook_url: data.webhook_url,
        voice_temperature: 1,
        voice_speed: 1,
        volume: 1,
        responsiveness: 1,
        interruption_sensitivity: 1,
        enable_backchannel: true,
        backchannel_frequency: 0.9,
        reminder_trigger_ms: 10000,
        reminder_max_count: 2,
        end_call_after_silence_ms: 600000,
        max_call_duration_ms: 3600000,
        begin_message_delay_ms: 1000,
        allow_user_dtmf: true,
    })
}

export async function updateAgent(externalAgentId: string, data: {
    name?: string
    voice_id?: string
    llm_id?: string
    language?: string
    webhook_url?: string
}) {
    return client.agent.update(externalAgentId, {
        ...(data.name && { agent_name: data.name }),
        ...(data.voice_id && { voice_id: data.voice_id }),
        ...(data.llm_id && { response_engine: { type: "retell-llm", llm_id: data.llm_id } }),
        ...(data.language && { language: data.language as any }),
        ...(data.webhook_url !== undefined && { webhook_url: data.webhook_url }),
    })
}

export async function deleteAgent(externalAgentId: string) {
    return client.agent.delete(externalAgentId)
}