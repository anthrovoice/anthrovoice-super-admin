/* eslint-disable @typescript-eslint/no-explicit-any */
import ProviderAlphaSDK from "retell-sdk"

let _client: ProviderAlphaSDK | null = null

export function getClient(): ProviderAlphaSDK {
  if (!_client) {
    if (!process.env.PROVIDER_ALPHA_API_KEY) {
      throw new Error("PROVIDER_ALPHA_API_KEY is not set")
    }
    _client = new ProviderAlphaSDK({ apiKey: process.env.PROVIDER_ALPHA_API_KEY })
  }
  return _client
}

export const client = new Proxy({} as ProviderAlphaSDK, {
  get(_, prop) {
    return (getClient() as any)[prop]
  }
})