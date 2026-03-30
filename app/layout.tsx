import type { Metadata } from "next"

import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import NextTopLoader from "nextjs-toploader"
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
        <NextTopLoader
          color="#ededed"
          easing="linear"
          height={2}
          shadow={false}
          showSpinner={false}
        />
        {children}
        <TimezoneSync />
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  )
}
