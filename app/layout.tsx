import type { Metadata } from "next"

import "./globals.css"
import { TimezoneSync } from "./components/timezone-sync"

export const metadata: Metadata = {
  description: "Macro tracker",
  title: "Makros"
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html className="bg-black" lang="en">
      <body className="bg-black text-[#ededed]">
        <TimezoneSync />
        {children}
      </body>
    </html>
  )
}
