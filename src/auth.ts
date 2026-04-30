import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { findUserByEmail } from "@/lib/db/collections/users"

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt" },
  trustHost: true,

  pages: {
    signIn: "/login",
    error: "/login",
  },

  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) return null

          const user = await findUserByEmail(credentials.email as string) as any
          if (!user) return null
          // Super admin is not subject to portal-level flags
          // if (user.isAccountLocked) return null
          // if (!user.isCallingEnabled) return null

          const valid = await bcrypt.compare(
            credentials.password as string,
            user.password
          )
          if (!valid) return null

          return {
            id: user.id,
            email: user.email,
            name: user.email,
            role: user.role ?? "user",
            isCallingEnabled: user.isCallingEnabled ?? true,
          }
        } catch (e) {
          console.error("[Auth] Error:", e)
          return null
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
        token.isCallingEnabled = (user as any).isCallingEnabled
      }
      return token
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = (token.sub ?? token.id) as string
          ; (session.user as any).role = token.role
          ; (session.user as any).isCallingEnabled = token.isCallingEnabled
      }
      return session
    },
  },
})