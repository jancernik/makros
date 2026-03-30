"use client"

import { Check, CloudOff, Loader2 } from "lucide-react"
import { useState } from "react"

import { usePlan } from "./plan-provider"

export function SaveIcon({ className }: { className?: string }) {
  const { saveStatus } = usePlan()
  const [displayStatus, setDisplayStatus] = useState(saveStatus)
  if (saveStatus !== "idle" && saveStatus !== displayStatus) {
    if (!(displayStatus === "error" && saveStatus === "saving")) setDisplayStatus(saveStatus)
  }

  return (
    <span
      className={["min-w-3.75", className].filter(Boolean).join(" ")}
      style={{ opacity: saveStatus === "idle" ? 0 : 1, transition: "opacity 0.2s ease-in-out" }}
    >
      {displayStatus === "saving" && <Loader2 className="animate-spin" size={15} />}
      {displayStatus === "saved" && <Check size={15} />}
      {displayStatus === "error" && <CloudOff size={15} />}
    </span>
  )
}
