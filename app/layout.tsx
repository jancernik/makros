import type { Metadata } from "next"

import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { ReactNode } from "react"

import "./globals.css"
import { TimezoneSync } from "./components/timezone-sync"

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
    <html className="bg-black" lang="en" suppressHydrationWarning>
      <body className="bg-black text-[#ededed]">
        {children}
        <TimezoneSync />
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  )
}
