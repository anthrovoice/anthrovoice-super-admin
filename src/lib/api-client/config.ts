import type { ConfigRecord } from "@/types/config"

export async function fetchConfig(): Promise<ConfigRecord> {
    const res = await fetch("/api/config")
    if (!res.ok) throw new Error("Failed to fetch config")
    return res.json()
}

export async function updateConfig(data: Partial<ConfigRecord>): Promise<void> {
    const res = await fetch("/api/config", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error("Failed to update config")
}

export async function uploadLogo(file: File): Promise<void> {
    const formData = new FormData()
    formData.append("logo", file)
    const res = await fetch("/api/config/logo", {
        method: "POST",
        body: formData,
    })
    if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? "Failed to upload logo")
    }
}