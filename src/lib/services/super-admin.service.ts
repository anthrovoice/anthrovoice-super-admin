import { createUserDoc, updateUserDoc, deleteUserDoc } from "@/lib/db/collections/users"
import bcrypt from "bcryptjs"

export async function createAdmin(data: {
    email: string
    password?: string
    displayName?: string
}) {
    // Generate hashed password if provided
    const hashedPassword = data.password ? await bcrypt.hash(data.password, 10) : null

    const docData: any = {
        email: data.email,
        displayName: data.displayName || "",
        role: "admin",
        isAccountLocked: false,
        isCallingEnabled: true,
    }

    if (hashedPassword) {
        docData.password = hashedPassword
    }

    return createUserDoc(docData)
}

export async function updateAdmin(
    adminId: string,
    updates: {
        displayName?: string
        isAccountLocked?: boolean
        isCallingEnabled?: boolean
    }
) {
    const dataToUpdate: any = {}
    if (updates.displayName !== undefined) dataToUpdate.displayName = updates.displayName
    if (updates.isAccountLocked !== undefined) dataToUpdate.isAccountLocked = updates.isAccountLocked
    if (updates.isCallingEnabled !== undefined) dataToUpdate.isCallingEnabled = updates.isCallingEnabled

    await updateUserDoc(adminId, dataToUpdate)
}

export async function removeAdmin(adminId: string) {
    // Soft delete or hard delete? Let's hard delete for now to match manager logic.
    await deleteUserDoc(adminId)
}
