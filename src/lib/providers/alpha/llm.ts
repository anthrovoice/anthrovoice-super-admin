/* eslint-disable @typescript-eslint/no-explicit-any */
import { client } from "./client"

export async function createLLM(data: {
    general_prompt: string
    begin_message?: string
    model?: string
    general_tools?: any[]
    begin_message_delay_ms?: number
    start_speaker?: string
}) {
    return client.llm.create({
        model: (data.model ?? "gpt-4o") as any,
        general_prompt: data.general_prompt,
        begin_message: data.begin_message ?? "",
        model_temperature: 0,
        model_high_priority: true,
        tool_call_strict_mode: true,
        ...(data.general_tools && { general_tools: data.general_tools }),
        ...(data.begin_message_delay_ms && { begin_message_delay_ms: data.begin_message_delay_ms }),
        ...(data.start_speaker && { start_speaker: data.start_speaker as any }),
    })
}

export async function updateLLM(externalLlmId: string, data: {
    general_prompt?: string
    begin_message?: string
    general_tools?: any[]
    begin_message_delay_ms?: number
    start_speaker?: string
}) {
    return client.llm.update(externalLlmId, {
        general_prompt: data.general_prompt,
        begin_message: data.begin_message ?? "",
        model_temperature: 0,
        model_high_priority: true,
        tool_call_strict_mode: true,
        ...(data.general_tools && { general_tools: data.general_tools }),
        ...(data.begin_message_delay_ms && { begin_message_delay_ms: data.begin_message_delay_ms }),
        ...(data.start_speaker && { start_speaker: data.start_speaker as any }),
    })
}

export async function getLLM(externalLlmId: string) {
    return client.llm.retrieve(externalLlmId)
}