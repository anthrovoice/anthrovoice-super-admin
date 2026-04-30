/* eslint-disable @typescript-eslint/no-explicit-any */
export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { findUserByEmail, createUserDoc } from "@/lib/db/collections/users"
import { getPostHogClient } from "@/lib/posthog-server"

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existing = await findUserByEmail(email)
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 400 }
      )
    }

    const hash = await bcrypt.hash(password, 12)

    await createUserDoc({
      email,
      password: hash,
      role: "user",
      isAccountLocked: false,
      isCallingEnabled: true,
      activeProvider: "alpha",
      retellPhoneNumber: [],
    })

    const posthog = getPostHogClient()
    posthog.identify({ distinctId: email, properties: { email } })
    posthog.capture({
      distinctId: email,
      event: "user_signed_up_server",
      properties: { email },
    })
    await posthog.shutdown()

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[Signup] Error:", error)
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    )
  }
}