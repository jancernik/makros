import type { Metadata } from "next"
import type { ReactNode } from "react"

import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Roboto } from "next/font/google"
import NextTopLoader from "nextjs-toploader"

import "./globals.css"
import { TimezoneSync } from "./components/timezone-sync"
import { Toaster } from "./components/toaster"

const roboto = Roboto({
  fallback: ["-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"]
})

export const metadata: Metadata = {
  description: "Macro tracker",
  title: "Makros"
}

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <html className={`bg-black ${roboto.className}`} lang="en" suppressHydrationWarning>
      <body className="bg-black text-[#ededed]">
        <NextTopLoader
          color="#ededed"
          easing="linear"
          height={2}
          shadow={false}
          showSpinner={false}
        />
        {children}
        <TimezoneSync />
        <Toaster />
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  )
}
