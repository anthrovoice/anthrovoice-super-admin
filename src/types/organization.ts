export interface ManagerRecord {
    id: string
    email: string
    displayName: string
    role: "manager"
    adminId: string
    locationId?: string | null
    locationName?: string | null
    isAccountLocked: boolean
    isCallingEnabled: boolean
    createdAt: string
    updatedAt: string
}

export interface LocationRecord {
    id: string
    adminId: string
    name: string
    address?: string
    createdAt: string
    updatedAt: string
}
