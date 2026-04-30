/* eslint-disable @typescript-eslint/no-explicit-any */
import bcrypt from "bcryptjs"
import {
    listManagersByAdminId,
    createUserDoc,
    updateUserDoc,
    deleteUserDoc,
    findUserByEmail,
} from "@/lib/db/collections/users"
import {
    listLocationsByAdmin,
    createLocationDoc,
    updateLocationDoc,
    deleteLocationDoc,
    getLocationDoc,
} from "@/lib/db/collections/locations"
import type { ManagerRecord, LocationRecord } from "@/types/organization"

// ─── Managers ────────────────────────────────────────────────────────────────

function serializeManager(doc: any, locationName?: string | null): ManagerRecord {
    return {
        id: doc.id,
        email: doc.email ?? "",
        displayName: doc.displayName ?? "",
        role: "manager",
        adminId: doc.adminId ?? "",
        locationId: doc.locationId ?? null,
        locationName: locationName ?? null,
        isAccountLocked: doc.isAccountLocked ?? false,
        isCallingEnabled: doc.isCallingEnabled ?? true,
        createdAt: doc.createdAt ?? new Date().toISOString(),
        updatedAt: doc.updatedAt ?? new Date().toISOString(),
    }
}

export async function getManagersByAdmin(adminId: string): Promise<ManagerRecord[]> {
    const [managers, locations] = await Promise.all([
        listManagersByAdminId(adminId),
        listLocationsByAdmin(adminId),
    ])

    const locationMap = new Map(locations.map((l: any) => [l.id, l.name]))

    return managers.map((m: any) =>
        serializeManager(m, m.locationId ? (locationMap.get(m.locationId) ?? null) : null)
    )
}

export async function createManager(adminId: string, payload: {
    email: string
    password: string
    displayName?: string
    locationId?: string
}): Promise<ManagerRecord> {
    const existing = await findUserByEmail(payload.email)
    if (existing) throw new Error("A user with this email already exists")

    const hash = await bcrypt.hash(payload.password, 12)

    const doc = await createUserDoc({
        email: payload.email,
        password: hash,
        displayName: payload.displayName ?? "",
        role: "manager",
        adminId,
        locationId: payload.locationId ?? null,
        isAccountLocked: false,
        isCallingEnabled: true,
        activeProvider: "alpha",
        retellPhoneNumber: [],
    })

    return serializeManager(doc)
}

export async function updateManager(id: string, adminId: string, payload: {
    displayName?: string
    locationId?: string | null
    isAccountLocked?: boolean
}): Promise<void> {
    // Only allow updating managers that belong to this admin
    await updateUserDoc(id, {
        ...(payload.displayName !== undefined && { displayName: payload.displayName }),
        ...(payload.locationId !== undefined && { locationId: payload.locationId }),
        ...(payload.isAccountLocked !== undefined && { isAccountLocked: payload.isAccountLocked }),
        adminId, // ensure ownership stays intact
    })
}

export async function removeManager(id: string): Promise<void> {
    await deleteUserDoc(id)
}

// ─── Locations ───────────────────────────────────────────────────────────────

function serializeLocation(doc: any): LocationRecord {
    return {
        id: doc.id,
        adminId: doc.adminId ?? "",
        name: doc.name ?? "",
        address: doc.address ?? "",
        createdAt: doc.createdAt ?? new Date().toISOString(),
        updatedAt: doc.updatedAt ?? new Date().toISOString(),
    }
}

export async function getLocationsByAdmin(adminId: string): Promise<LocationRecord[]> {
    const docs = await listLocationsByAdmin(adminId)
    return docs.map(serializeLocation)
}

export async function createLocation(adminId: string, payload: {
    name: string
    address?: string
}): Promise<LocationRecord> {
    if (!payload.name?.trim()) throw new Error("Location name is required")
    const doc = await createLocationDoc({
        adminId,
        name: payload.name.trim(),
        address: payload.address?.trim() ?? "",
    })
    return serializeLocation(doc)
}

export async function updateLocation(id: string, adminId: string, payload: {
    name?: string
    address?: string
}): Promise<void> {
    const existing = await getLocationDoc(id) as any
    if (!existing || existing.adminId !== adminId) throw new Error("Location not found")
    await updateLocationDoc(id, {
        ...(payload.name !== undefined && { name: payload.name.trim() }),
        ...(payload.address !== undefined && { address: payload.address.trim() }),
    })
}

export async function removeLocation(id: string, adminId: string): Promise<void> {
    const existing = await getLocationDoc(id) as any
    if (!existing || existing.adminId !== adminId) throw new Error("Location not found")
    await deleteLocationDoc(id)
}
