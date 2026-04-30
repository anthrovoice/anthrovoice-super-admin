import { client } from "./client"

export async function listVoices() {
    return client.voice.list()
}