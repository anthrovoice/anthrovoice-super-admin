import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import { DOMAINS } from "@/lib/constants/domains"

const PUBLIC_PATHS = [
    "/login",
    "/api/auth",
    "/api/webhook",
    "/api/campaigns",
    "/_next",
    "/favicon.ico",
]

function isPublicPath(pathname: string): boolean {
    return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p))
}

export async function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl

    if (isPublicPath(pathname)) {
        return NextResponse.next()
    }

    const token = await getToken({
        req,
        secret: process.env.AUTH_SECRET,
        cookieName:
            process.env.NODE_ENV === "production"
                ? "__Secure-authjs.session-token"
                : "authjs.session-token",
    })

    if (!token) {
        return NextResponse.redirect(new URL("/login", req.url))
    }

    const hostname =
        req.headers.get("x-forwarded-host") ??
        req.headers.get("host") ??
        req.nextUrl.hostname

    const email = token.email as string
    const isSuperAdmin = email === DOMAINS.SUPER_ADMIN_EMAIL
    const isAdminDomain = hostname === DOMAINS.ADMIN
    const isPortalDomain = hostname === DOMAINS.PORTAL

    if (isAdminDomain) {
        // Wrong user on admin domain → send to portal
        if (!isSuperAdmin) {
            return NextResponse.redirect(`https://${DOMAINS.PORTAL}/dashboard`)
        }
        // Super admin wandered off /super-admin → bring them back
        if (!pathname.startsWith("/super-admin")) {
            return NextResponse.redirect(new URL("/super-admin", req.url))
        }
    }

    if (isPortalDomain) {
        // Super admin on portal → send to admin
        if (isSuperAdmin) {
            return NextResponse.redirect(`https://${DOMAINS.ADMIN}/super-admin`)
        }
        // Portal user trying to access super-admin routes directly
        if (pathname.startsWith("/super-admin")) {
            return NextResponse.redirect(new URL("/dashboard", req.url))
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}