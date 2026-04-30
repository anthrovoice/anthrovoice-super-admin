export const DOMAINS = {
    ADMIN: "admin.anthrovoice.com",
    PORTAL: "portal.anthrovoice.com",
    SUPER_ADMIN_EMAIL: "sa@av.com",
} as const

export function getPostLoginDestination(email: string): string {
    if (email === DOMAINS.SUPER_ADMIN_EMAIL) {
        return `https://${DOMAINS.ADMIN}/super-admin`
    }
    return `https://${DOMAINS.PORTAL}/dashboard`
}