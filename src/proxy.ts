import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"

const SUPER_ADMIN_EMAIL = "sa@av.com"

const PUBLIC_PATHS = [
    "/login",
    "/api/auth",
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

    // Not logged in → login page
    if (!token) {
        return NextResponse.redirect(new URL("/login", req.url))
    }

    // Only sa@av.com is allowed in this app
    if (token.email !== SUPER_ADMIN_EMAIL) {
        return NextResponse.redirect(new URL("/login", req.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}