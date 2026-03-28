"use client"

import { useCallback, useEffect, useRef, useState } from "react"

const COOKIE_KEY = "panels-layout"

type Props = {
  className?: string
  defaultLeftPct?: number
  left: React.ReactNode
  right: React.ReactNode
}

export function ResizablePanels({ className, defaultLeftPct = 50, left, right }: Props) {
  const [leftPct, setLeftPct] = useState(defaultLeftPct)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const id = setTimeout(() => {
      document.cookie = `${COOKIE_KEY}=${encodeURIComponent(JSON.stringify({ leftPct }))}; path=/; max-age=31536000; SameSite=Lax`
    }, 200)
    return () => clearTimeout(id)
  }, [leftPct])

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

  return (
    <div
      className={["flex flex-col md:min-h-0 md:flex-1 md:flex-row", className]
        .filter(Boolean)
        .join(" ")}
      ref={containerRef}
      style={{ "--panel-left-width": `${leftPct}%` } as React.CSSProperties}
    >
      <div className="flex min-h-0 min-w-0 flex-col overflow-hidden border-b border-[#1a1a1a] md:border-b-0 panel-left">
        {left}
      </div>

      <div
        className="group hidden w-2 shrink-0 cursor-col-resize md:flex md:items-stretch"
        onMouseDown={() => startDrag()}
        onTouchStart={() => startDrag()}
      >
        <div className="mx-auto w-px bg-[#1a1a1a] transition-colors duration-100 group-hover:bg-[#444]" />
      </div>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">{right}</div>
    </div>
  )
}
