"use client"

import { ClipboardList, UtensilsCrossed } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"

type Props = {
  className?: string
  cookieKey?: string
  defaultLeftPct?: number
  left: React.ReactNode
  leftIcon?: React.ReactNode
  leftLabel?: string
  right: React.ReactNode
  rightIcon?: React.ReactNode
  rightLabel?: string
}

type Tab = "left" | "right"

export function ResizablePanels({
  className,
  cookieKey = "panels-layout",
  defaultLeftPct = 50,
  left,
  leftIcon = <UtensilsCrossed size={18} />,
  leftLabel = "Left",
  right,
  rightIcon = <ClipboardList size={18} />,
  rightLabel = "Right"
}: Props) {
  const [leftPct, setLeftPct] = useState(defaultLeftPct)
  const [activeTab, setActiveTab] = useState<Tab>("left")
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const id = setTimeout(() => {
      document.cookie = `${cookieKey}=${encodeURIComponent(JSON.stringify({ leftPct }))}; path=/; max-age=31536000; SameSite=Lax`
    }, 200)
    return () => clearTimeout(id)
  }, [cookieKey, leftPct])

  const startDrag = useCallback(() => {
    const container = containerRef.current
    if (!container) return
    const rect = container.getBoundingClientRect()

    const onMove = (x: number) => {
      const pct = ((x - rect.left) / rect.width) * 100
      setLeftPct(Math.min(Math.max(pct, 20), 80))
    }

    const onMouseMove = (e: MouseEvent) => onMove(e.clientX)
    const onTouchMove = (e: TouchEvent) => onMove(e.touches[0].clientX)

    const cleanup = () => {
      document.removeEventListener("mousemove", onMouseMove)
      document.removeEventListener("mouseup", cleanup)
      document.removeEventListener("touchmove", onTouchMove)
      document.removeEventListener("touchend", cleanup)
      document.body.style.cursor = ""
      document.body.style.userSelect = ""
    }

    document.body.style.cursor = "col-resize"
    document.body.style.userSelect = "none"
    document.addEventListener("mousemove", onMouseMove)
    document.addEventListener("mouseup", cleanup)
    document.addEventListener("touchmove", onTouchMove, { passive: true })
    document.addEventListener("touchend", cleanup)
  }, [])

  const tabs = [
    { icon: leftIcon, label: leftLabel, tab: "left" as Tab },
    { icon: rightIcon, label: rightLabel, tab: "right" as Tab }
  ]

  return (
    <div
      className={["flex min-h-0 flex-1 flex-col md:flex-row", className].filter(Boolean).join(" ")}
      ref={containerRef}
      style={{ "--panel-left-width": `${leftPct}%` } as React.CSSProperties}
    >
      <div
        className={[
          "min-h-0 min-w-0 flex-col overflow-hidden panel-left",
          activeTab === "left" ? "flex flex-1 md:flex-none" : "hidden md:flex"
        ].join(" ")}
      >
        {left}
      </div>

      <div
        className="group hidden w-2 shrink-0 cursor-col-resize md:flex md:items-stretch"
        onMouseDown={() => startDrag()}
        onTouchStart={() => startDrag()}
      >
        <div className="mx-auto w-px bg-[#1a1a1a] transition-colors duration-100 group-hover:bg-[#444]" />
      </div>

      <div
        className={[
          "min-h-0 min-w-0 flex-1 flex-col overflow-hidden",
          activeTab === "right" ? "flex" : "hidden md:flex"
        ].join(" ")}
      >
        {right}
      </div>

      <div className="flex shrink-0 border-t border-[#1a1a1a] md:hidden">
        {tabs.map(({ icon, label, tab }) => (
          <button
            aria-pressed={activeTab === tab}
            className={[
              "flex flex-1 flex-col items-center gap-1 py-3 text-[11px] font-medium uppercase tracking-[0.08em] transition-colors duration-100",
              activeTab === tab ? "text-(--text)" : "text-(--text-muted)"
            ].join(" ")}
            key={tab}
            onClick={() => setActiveTab(tab)}
          >
            {icon}
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
