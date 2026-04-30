/* eslint-disable @typescript-eslint/no-explicit-any */
import { client } from "./client"

export async function listCalls(params: {
    limit?: number
    externalAgentId?: string
    startTimestamp?: number
    endTimestamp?: number
} = {}) {
    return client.call.list({
        limit: params.limit ?? 50,
        ...(params.externalAgentId && {
            filter_criteria: { agent_id: [params.externalAgentId] }
        }),
        ...(params.startTimestamp && { start_timestamp: params.startTimestamp }),
        ...(params.endTimestamp && { end_timestamp: params.endTimestamp }),
    })
}

export async function getCall(externalCallId: string) {
    return client.call.retrieve(externalCallId)
}

export async function createPhoneCall(data: {
    fromNumber: string
    toNumber: string
    externalAgentId?: string
    metadata?: Record<string, any>
    dynamicVariables?: Record<string, any>
}) {
    return client.call.createPhoneCall({
        from_number: data.fromNumber,
        to_number: data.toNumber,
        ...(data.externalAgentId && { override_agent_id: data.externalAgentId }),
        metadata: data.metadata ?? {},
        retell_llm_dynamic_variables: data.dynamicVariables ?? {},
    })
}

/**
 * Returns the number of currently active calls on the Alpha (Retell) platform.
 * Uses call_status filter for "registered" and "ongoing" calls.
 * This is the live current_concurrency value used in the campaign launch formula:
 *   available = base_concurrency - current_concurrency
 */
export async function getActiveConcurrentCallCount(): Promise<number> {
    const result = await client.call.list({
        limit: 1000,
        filter_criteria: {
            call_status: ["ongoing"],
        } as any,
    })
    console.log("[getActiveConcurrentCallCount] raw result:", JSON.stringify(result))
    return Array.isArray(result) ? result.length : 0
}

/** Hard concurrency limit for the Alpha (Retell) provider */
export const ALPHA_MAX_CONCURRENCY = 20