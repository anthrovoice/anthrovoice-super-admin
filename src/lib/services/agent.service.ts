/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    agentsCol,
    getAgentDoc,
    createAgentDoc,
    updateAgentDoc,
    softDeleteAgentDoc,
  } from "@/lib/db/collections/agents"
  import {
    listAgents, getAgent,
    createAgent as createExternalAgent,
    updateAgent as updateExternalAgent,
    deleteAgent as deleteExternalAgent,
  } from "@/lib/providers/alpha/agent"
  import { createLLM, updateLLM, getLLM } from "@/lib/providers/alpha/llm"
  import type { AgentRecord } from "@/types/agent"
  
  const WEBHOOK_URL = process.env.NEXT_PUBLIC_APP_URL
    ? `${process.env.NEXT_PUBLIC_APP_URL}/api/webhook/call`
    : ""
  
  function toDate(val: any): string {
    if (!val) return new Date().toISOString()
    if (val?.toDate) return val.toDate().toISOString()
    if (val instanceof Date) return val.toISOString()
    return new Date().toISOString()
  }
  
  function serialize(externalAgent: any, llmData?: any, dbRecord?: any): AgentRecord {
    return {
      _id: dbRecord?.id ?? externalAgent.agent_id,
      externalAgentId: externalAgent.agent_id,
      externalLlmId: dbRecord?.externalLlmId ?? llmData?.llm_id ?? "",
      name: externalAgent.agent_name ?? "",
      prompt: llmData?.general_prompt ?? "",
      first_message: llmData?.begin_message ?? "",
      language: externalAgent.language ?? "en-US",
      voice: {
        voice_id: externalAgent.voice_id ?? "",
        speed: externalAgent.voice_speed ?? 1,
        temperature: externalAgent.voice_temperature ?? 1,
        volume: externalAgent.volume ?? 1,
      },
      conversation_start: llmData?.start_speaker === "user" ? "user" : "agent",
      webhook_url: externalAgent.webhook_url ?? "",
      functions: [],
      status: dbRecord?.status ?? true,
      createdAt: toDate(dbRecord?.createdAt),
      updatedAt: toDate(dbRecord?.updatedAt),
    }
  }
  
  export async function getAgents(query: {
    page?: number
    limit?: number
    search?: string
    userId?: string
  } = {}) {
    const { page = 1, limit = 10, search, userId } = query
  
    const externalAgents = await listAgents()
    let filtered = externalAgents as any[]
  
    if (search) {
      const s = search.toLowerCase()
      filtered = filtered.filter((a) => a.agent_name?.toLowerCase().includes(s))
    }
  
    const total = filtered.length
    const paginated = filtered.slice((page - 1) * limit, page * limit)
    const externalIds = paginated.map((a) => a.agent_id)
  
    const dbMap = new Map<string, any>()
    if (externalIds.length > 0) {
      let q = agentsCol().where("externalAgentId", "in", externalIds) as FirebaseFirestore.Query
      if (userId) q = q.where("userId", "==", userId)
      const snap = await q.get()
      snap.docs.forEach((d) => {
        dbMap.set(d.data().externalAgentId, { id: d.id, ...d.data() })
      })
    }
  
    const data = paginated.map((a) => serialize(a, null, dbMap.get(a.agent_id)))
    return { data, total, page, limit }
  }
  
  export async function getAgentById(id: string) {
    const dbRecord = await getAgentDoc(id) as any
    if (!dbRecord) throw new Error("Agent not found")
  
    const [externalAgent, llmData] = await Promise.all([
      getAgent(dbRecord.externalAgentId),
      dbRecord.externalLlmId ? getLLM(dbRecord.externalLlmId) : Promise.resolve(null),
    ])
  
    return serialize(externalAgent, llmData, dbRecord)
  }
  
  export async function createAgentWithLLM(payload: {
    name: string
    prompt: string
    first_message?: string
    voice_id: string
    language?: string
    conversation_start?: string
    webhook_url?: string
    general_tools?: any[]
    userId?: string
  }) {
    const llm = await createLLM({
      general_prompt: payload.prompt,
      begin_message: payload.first_message ?? "",
      general_tools: payload.general_tools,
      start_speaker: payload.conversation_start === "user" ? "user" : "agent",
    })
  
    const agent = await createExternalAgent({
      name: payload.name,
      voice_id: payload.voice_id,
      llm_id: llm.llm_id,
      language: payload.language ?? "en-US",
      webhook_url: payload.webhook_url ?? WEBHOOK_URL,
    })
  
    const dbRecord = await createAgentDoc({
      externalAgentId: agent.agent_id,
      externalLlmId: llm.llm_id,
      externalAgent: agent,
      userId: payload.userId ?? "",
      start_speaker: payload.conversation_start ?? "agent",
      status: true,
      isDeleted: false,
      deletedAt: null,
    })
  
    return serialize(agent, llm, dbRecord)
  }
  
  export async function updateAgentWithLLM(id: string, payload: {
    name?: string
    prompt?: string
    first_message?: string
    voice_id?: string
    language?: string
    conversation_start?: string
    webhook_url?: string
    general_tools?: any[]
  }) {
    const dbRecord = await getAgentDoc(id) as any
    if (!dbRecord) throw new Error("Agent not found")
  
    const llm = await updateLLM(dbRecord.externalLlmId, {
      general_prompt: payload.prompt,
      begin_message: payload.first_message,
      general_tools: payload.general_tools,
      start_speaker: payload.conversation_start === "user" ? "user" : "agent",
    })
  
    const agent = await updateExternalAgent(dbRecord.externalAgentId, {
      name: payload.name,
      voice_id: payload.voice_id,
      language: payload.language,
      webhook_url: payload.webhook_url,
      llm_id: dbRecord.externalLlmId,
    })
  
    await updateAgentDoc(id, { externalAgent: agent })
    return serialize(agent, llm, dbRecord)
  }
  
  export async function deleteAgentById(id: string) {
    const dbRecord = await getAgentDoc(id) as any
    if (!dbRecord) throw new Error("Agent not found")
  
    await deleteExternalAgent(dbRecord.externalAgentId)
    await softDeleteAgentDoc(id)
  }

  export async function importAgent(agentId: string, userId: string) {
    // 1. Verify exists in Retell
    const externalAgent = await getAgent(agentId)
    if (!externalAgent) throw new Error("Agent not found in provider")

    // 2. Create in DB mapped to the userId
    const dbRecord = await createAgentDoc({
      externalAgentId: externalAgent.agent_id,
      externalLlmId: (externalAgent as any).llm_websocket_url ? (externalAgent as any).llm_websocket_url.split("/").pop() : "",
      externalAgent: externalAgent,
      userId: userId,
      start_speaker: "agent",
      status: true,
      isDeleted: false,
      deletedAt: null,
    })

    return serialize(externalAgent, null, dbRecord)
  }