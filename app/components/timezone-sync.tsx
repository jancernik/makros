"use client"

import { useEffect } from "react"

export function TimezoneSync() {
  useEffect(() => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    document.cookie = `timezone=${timezone}; path=/; max-age=31536000; SameSite=Lax`
  }, [])
  return null
}
