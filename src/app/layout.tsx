import type { Metadata } from "next"
import { Geist_Mono } from "next/font/google"
import "./globals.css"
import { SessionProvider } from "next-auth/react"
import { DM_Sans } from "next/font/google"

const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
})

export const metadata: Metadata = {
  title: "Anthrovoice",
  description: "AI-powered call operations platform",
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${dmSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}