import type { ReactNode } from "react"

type Props = {
  children: ReactNode
  icon?: ReactNode
  onPressedChange: (pressed: boolean) => void
  pressed: boolean
  size?: Size
}

type Size = "lg" | "md" | "sm"

const baseClasses =
  "inline-flex cursor-pointer items-center gap-2 border font-[inherit] font-semibold uppercase tracking-wider whitespace-nowrap transition-colors duration-100"

const sizeClasses: Record<Size, string> = {
  lg: "h-11 px-5 text-[13px]",
  md: "h-9 px-3.5 text-[12px]",
  sm: "h-7 px-2.5 text-[11px]"
}

const offClasses =
  "border-[#2a2a2a] bg-transparent text-(--text) hover:bg-[#111] hover:border-[#444]"

const onClasses = "border-[#444] bg-[#222] text-(--text) hover:bg-[#2a2a2a] hover:border-[#555]"

export function Toggle({ children, icon, onPressedChange, pressed, size = "sm" }: Props) {
  return (
    <button
      aria-pressed={pressed}
      className={`${baseClasses} ${sizeClasses[size]} ${pressed ? onClasses : offClasses}`}
      onClick={() => onPressedChange(!pressed)}
      type="button"
    >
      {icon}
      {children}
    </button>
  )
}
