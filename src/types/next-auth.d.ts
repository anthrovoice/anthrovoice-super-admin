import { DefaultSession } from "next-auth"

declare module "next-auth" {
    interface Session {
        user: {
            id: string
            role: string
            isCallingEnabled: boolean
        } & DefaultSession["user"]
    }
}