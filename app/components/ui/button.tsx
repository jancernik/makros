import type { ComponentProps } from "react"

import Link from "next/link"

type ButtonLinkProps = ComponentProps<typeof Link> & VisualProps

type ButtonProps = ComponentProps<"button"> & VisualProps
type Size = "lg" | "md" | "sm"

type Variant = "danger" | "ghost" | "primary" | "secondary"
type VisualProps = {
  iconOnly?: boolean
  size?: Size
  variant?: Variant
}

const baseClasses =
  "inline-flex items-center justify-center gap-2 border border-[#2a2a2a] text-(--text) cursor-pointer font-[inherit] transition-[background-color,border-color] duration-100 whitespace-nowrap disabled:opacity-[0.35] disabled:cursor-not-allowed"

const sizeClasses: Record<Size, string> = {
  lg: "h-11 px-5 text-[15px]",
  md: "h-9 px-3.5 text-[14px]",
  sm: "h-7 px-2.5 text-[11px]"
}

const iconOnlySizeClasses: Record<Size, string> = {
  lg: "h-11 w-11 p-0",
  md: "h-9 w-9 p-0",
  sm: "h-7 w-7 p-0"
}

const variantClasses: Record<Variant, string> = {
  danger:
    "bg-red-900 border-red-900 text-white hover:not-disabled:bg-[#5a0a0a] hover:not-disabled:border-[#5a0a0a]",
  ghost: "bg-transparent border-transparent hover:not-disabled:bg-[#111]",
  primary:
    "bg-white border-white text-black hover:not-disabled:bg-[#e5e5e5] hover:not-disabled:border-[#e5e5e5]",
  secondary: "bg-transparent hover:not-disabled:bg-[#111] hover:not-disabled:border-[#444]"
}

export function Button({
  children,
  className,
  iconOnly,
  ref,
  size,
  variant,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={buildButtonClasses({ className, iconOnly, size, variant })}
      ref={ref}
      {...rest}
    >
      {children}
    </button>
  )
}

export function ButtonLink({
  children,
  className,
  iconOnly,
  ref,
  size,
  variant,
  ...rest
}: ButtonLinkProps) {
  return (
    <Link
      className={buildButtonClasses({ className, iconOnly, size, variant })}
      ref={ref}
      {...rest}
    >
      {children}
    </Link>
  )
}

function buildButtonClasses({
  className,
  iconOnly = false,
  size = "md",
  variant = "secondary"
}: VisualProps & { className?: string }) {
  return [
    baseClasses,
    iconOnly ? iconOnlySizeClasses[size] : sizeClasses[size],
    variantClasses[variant],
    className
  ]
    .filter(Boolean)
    .join(" ")
}
