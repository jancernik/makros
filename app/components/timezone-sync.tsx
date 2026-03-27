"use client"

import { useEffect } from "react"

export function TimezoneSync() {
  useEffect(() => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    const existing = document.cookie.split("; ").find((c) => c.startsWith("timezone="))
    if (existing === `timezone=${timezone}`) return
    document.cookie = `timezone=${timezone}; path=/; max-age=31536000; SameSite=Lax`
  }, [])
  return null
}
