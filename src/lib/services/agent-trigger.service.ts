/* eslint-disable @typescript-eslint/no-explicit-any */
import { createPhoneCall } from "@/lib/providers/alpha/call"
import { getAgentDoc, findAgentByExternalId } from "@/lib/db/collections/agents"

export async function triggerCall({
  agentMongoId,
  fromNumber,
  toNumber,
  userId,
}: {
  agentMongoId: string
  fromNumber: string
  toNumber: string
  userId?: string
}) {
  let dbRecord: any = await getAgentDoc(agentMongoId)
  if (!dbRecord) dbRecord = await findAgentByExternalId(agentMongoId)
  if (!dbRecord) throw new Error("Agent not found")

  const externalAgentId = dbRecord.externalAgentId
  if (!externalAgentId) throw new Error("Agent has no external ID")

  return createPhoneCall({
    fromNumber,
    toNumber,
    externalAgentId,
    metadata: {
      triggered_from: "dashboard",
      user_id: userId ?? "",
    },
  })
}