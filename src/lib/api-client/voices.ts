export interface Voice {
    voice_id: string
    voice_name: string
    provider?: string
    accent?: string
    gender?: string
    age?: string
    preview_audio_url?: string
    supportedLanguages?: string[]
}

export async function fetchVoices(language?: string): Promise<Voice[]> {
    const base = typeof window !== "undefined"
        ? ""
        : (process.env.NEXT_PUBLIC_APP_URL ?? "")
    const res = await fetch(`${base}/api/voices`)
    if (!res.ok) throw new Error("Failed to fetch voices")
    const voices: Voice[] = await res.json()

    if (!language) return voices

    const langPrefix = language.split("-")[0].toLowerCase()
    return voices.filter((v) =>
        v.supportedLanguages?.some((l) => l.toLowerCase().startsWith(langPrefix)) ?? true
    )
}