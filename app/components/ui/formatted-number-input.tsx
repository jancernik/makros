"use client"

import type { ChangeEvent, ComponentProps, FocusEvent, KeyboardEvent } from "react"

import { useRef, useState } from "react"

import { Input } from "./input"

type FormattedNumberInputProps = Omit<
  ComponentProps<"input">,
  "defaultValue" | "onBlur" | "onChange" | "onFocus" | "onKeyDown" | "size" | "type" | "value"
> & {
  className?: string
  description?: string
  error?: string
  label?: string
  onBlur?: (event: FocusEvent<HTMLInputElement>) => void
  onCommit: (value: number) => void
  onFocus?: (event: FocusEvent<HTMLInputElement>) => void
  onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void
  unit?: string
  value: number
}

export function FormattedNumberInput({
  onBlur,
  onCommit,
  onFocus,
  onKeyDown,
  unit,
  value,
  ...props
}: FormattedNumberInputProps) {
  const [focused, setFocused] = useState(false)
  const [draft, setDraft] = useState<null | string>(null)
  const blurTimeoutRef = useRef<null | ReturnType<typeof setTimeout>>(null)

  const displayValue = focused
    ? (draft ?? formatNumber(value))
    : unit && unit !== "unit"
      ? `${formatNumber(value)} ${unit}`
      : formatNumber(value)

  function clearPendingBlur() {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current)
      blurTimeoutRef.current = null
    }
  }

  function commit(raw: string) {
    const next = parseNumber(raw)

    if (next === null || next === value) {
      setDraft(null)
      return
    }

    onCommit(next)
    setDraft(null)
  }

  return (
    <Input
      {...props}
      inputMode="decimal"
      onBlur={(event: FocusEvent<HTMLInputElement>) => {
        setFocused(false)

        const raw = event.currentTarget.value

        blurTimeoutRef.current = setTimeout(() => {
          commit(raw)
        }, 0)

        onBlur?.(event)
      }}
      onChange={(event: ChangeEvent<HTMLInputElement>) => {
        setDraft(event.currentTarget.value)
      }}
      onFocus={(event: FocusEvent<HTMLInputElement>) => {
        clearPendingBlur()
        setFocused(true)
        setDraft(formatNumber(value))
        onFocus?.(event)
      }}
      onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
          clearPendingBlur()
          commit(event.currentTarget.value)
          event.currentTarget.blur()
        }

        onKeyDown?.(event)
      }}
      textAlign="center"
      type="text"
      value={displayValue}
    />
  )
}

function formatNumber(value: number): string {
  return String(value)
}

function parseNumber(raw: string): null | number {
  const normalized = raw.trim().replace(/\s+/g, "").replace(",", ".")
  const next = Number(normalized)

  return Number.isFinite(next) ? next : null
}
