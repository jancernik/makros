"use client"

import { Eye, EyeOff } from "lucide-react"

import { Select } from "./ui/select"
import { Toggle } from "./ui/toggle"

const RANGE_OPTIONS = [
  { label: "1 week", value: "7" },
  { label: "2 weeks", value: "14" },
  { label: "1 month", value: "30" },
  { label: "3 months", value: "90" },
  { label: "All", value: "all" }
]

type Props = {
  onRangeChange: (range: null | number) => void
  onShowTargetChange: (show: boolean) => void
  range: null | number
  showTarget: boolean
}

export function ChartControls({ onRangeChange, onShowTargetChange, range, showTarget }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select
        className="w-25"
        onChange={(v) => onRangeChange(v === "all" ? null : Number(v))}
        options={RANGE_OPTIONS}
        size="sm"
        value={range === null ? "all" : String(range)}
      />
      <Toggle
        icon={showTarget ? <Eye size={12} /> : <EyeOff size={12} />}
        onPressedChange={onShowTargetChange}
        pressed={showTarget}
      >
        Target
      </Toggle>
    </div>
  )
}
