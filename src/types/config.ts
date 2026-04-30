export interface ConfigRecord {
    _id?: string
    logo?: string
    iframe?: string
    iframeList?: string
    activeProvider?: "alpha" | "beta"
    updatedAt?: string

    // keep backward compat during migration
    logo_base64?: string
    logo_mime_type?: string
    dashboard_iframe?: string
    org_iframe?: string
}