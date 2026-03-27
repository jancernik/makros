"use client"

import Link from "next/link"
import {
  cloneElement,
  type ComponentPropsWithoutRef,
  createContext,
  type CSSProperties,
  type HTMLAttributes,
  isValidElement,
  type ReactElement,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
  type Ref,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState
} from "react"
import { createPortal } from "react-dom"

type Align = "auto" | "center" | "left" | "right"

type FloatContextValue = {
  contentId: string
  open: boolean
  setOpen: (open: boolean) => void
  triggerRef: React.RefObject<HTMLElement | null>
}

const FloatContext = createContext<FloatContextValue | null>(null)

type FloatContentProps = {
  align?: Align
  children: ReactNode
  className?: string
  estimatedWidth?: number
  offset?: number
  onOpen?: () => void
}

type FloatItemProps = Omit<ComponentPropsWithoutRef<"button">, "className" | "type"> & {
  children: ReactNode
  className?: string
  closeOnSelect?: boolean
  danger?: boolean
  inset?: boolean
}

type FloatLinkProps = Omit<ComponentPropsWithoutRef<typeof Link>, "className"> & {
  children: ReactNode
  className?: string
  closeOnSelect?: boolean
  danger?: boolean
  inset?: boolean
}

type FloatProps = {
  children: ReactNode
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  open?: boolean
}

type FloatTriggerProps = {
  children: ReactElement<TriggerChildProps>
}

type TriggerChildProps = {
  "aria-controls"?: string
  "aria-expanded"?: boolean
  "aria-haspopup"?: "menu"
  onClick?: (event: ReactMouseEvent<HTMLElement>) => void
  ref?: Ref<HTMLElement>
}

export function Float({
  children,
  defaultOpen = false,
  onOpenChange,
  open: controlledOpen
}: FloatProps) {
  const contentId = useId()
  const triggerRef = useRef<HTMLElement>(null)

  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen)
  const open = controlledOpen ?? uncontrolledOpen

  const setOpen = useCallback(
    (nextOpen: boolean) => {
      if (controlledOpen === undefined) {
        setUncontrolledOpen(nextOpen)
      }

      onOpenChange?.(nextOpen)
    },
    [controlledOpen, onOpenChange]
  )

  const value = useMemo<FloatContextValue>(
    () => ({
      contentId,
      open,
      setOpen,
      triggerRef
    }),
    [contentId, open, setOpen]
  )

  return <FloatContext.Provider value={value}>{children}</FloatContext.Provider>
}

export function FloatContent({
  align = "right",
  children,
  className,
  estimatedWidth = 160,
  offset = 4,
  onOpen
}: FloatContentProps) {
  const { contentId, open, setOpen, triggerRef } = useFloatContext()
  const contentRef = useRef<HTMLDivElement>(null)
  const [style, setStyle] = useState<CSSProperties>({})

  useEffect(() => {
    if (!open) return

    onOpen?.()

    function updatePosition() {
      const trigger = triggerRef.current
      if (!trigger) return

      const rect = trigger.getBoundingClientRect()
      const panelHeight = contentRef.current?.offsetHeight ?? 160
      const panelWidth = contentRef.current?.offsetWidth ?? estimatedWidth

      const nextStyle: CSSProperties = {}

      const shouldOpenAbove = rect.bottom + offset + panelHeight > window.innerHeight
      if (shouldOpenAbove) {
        nextStyle.bottom = window.innerHeight - rect.top + offset
      } else {
        nextStyle.top = rect.bottom + offset
      }

      const resolvedAlign =
        align === "auto"
          ? rect.left + panelWidth > window.innerWidth - 8
            ? "right"
            : "left"
          : align

      const clamp = (left: number) =>
        Math.max(8, Math.min(left, window.innerWidth - panelWidth - 8))

      if (resolvedAlign === "right") {
        nextStyle.left = clamp(rect.right - panelWidth)
      } else if (resolvedAlign === "center") {
        nextStyle.left = clamp(rect.left + rect.width / 2 - panelWidth / 2)
      } else {
        nextStyle.left = clamp(rect.left)
      }

      setStyle(nextStyle)
    }

    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node | null
      if (!target) return

      const trigger = triggerRef.current
      const content = contentRef.current

      if (trigger?.contains(target)) return
      if (content?.contains(target)) return

      setOpen(false)
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key !== "Escape") return

      setOpen(false)
      triggerRef.current?.focus()
    }

    updatePosition()

    window.addEventListener("resize", updatePosition)
    window.addEventListener("scroll", updatePosition, true)
    window.addEventListener("pointerdown", handlePointerDown)
    window.addEventListener("keydown", handleEscape)

    return () => {
      window.removeEventListener("resize", updatePosition)
      window.removeEventListener("scroll", updatePosition, true)
      window.removeEventListener("pointerdown", handlePointerDown)
      window.removeEventListener("keydown", handleEscape)
    }
  }, [align, estimatedWidth, offset, onOpen, open, setOpen, triggerRef])

  if (!open || typeof document === "undefined") return null

  return createPortal(
    <div
      className={cn("fixed z-110 border border-[#2a2a2a] bg-(--bg-surface)", className)}
      id={contentId}
      ref={contentRef}
      role="menu"
      style={style}
    >
      {children}
    </div>,
    document.body
  )
}

export function FloatItem({
  children,
  className,
  closeOnSelect = true,
  danger = false,
  inset = false,
  onClick,
  ...rest
}: FloatItemProps) {
  const { setOpen } = useFloatContext()

  return (
    <button
      {...rest}
      className={cn(
        "block w-full cursor-pointer rounded-none border-0 px-3 py-1.5 text-left text-[14px] font-[inherit] hover:bg-[#111]",
        danger && "text-red-400",
        inset && "pl-5",
        className
      )}
      onClick={(event) => {
        onClick?.(event)

        if (closeOnSelect && !event.defaultPrevented) {
          setOpen(false)
        }
      }}
      type="button"
    >
      {children}
    </button>
  )
}

export function FloatLink({
  children,
  className,
  closeOnSelect = true,
  danger = false,
  inset = false,
  onClick,
  ...rest
}: FloatLinkProps) {
  const { setOpen } = useFloatContext()

  return (
    <Link
      {...rest}
      className={cn(
        "block px-3 py-1.5 text-[14px] hover:bg-[#111]",
        danger && "text-red-400",
        inset && "pl-5",
        className
      )}
      onClick={(event) => {
        onClick?.(event)

        if (closeOnSelect && !event.defaultPrevented) {
          setOpen(false)
        }
      }}
    >
      {children}
    </Link>
  )
}

export function FloatSeparator({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div {...rest} className={cn("my-1 h-px bg-[#1a1a1a]", className)} role="separator" />
}

export function FloatTrigger({ children }: FloatTriggerProps) {
  const { contentId, open, setOpen, triggerRef } = useFloatContext()

  if (!isValidElement(children)) {
    throw new Error("<FloatTrigger> expects a single React element child.")
  }

  return cloneElement(children, {
    "aria-controls": contentId,
    "aria-expanded": open,
    "aria-haspopup": "menu",
    onClick: (event: ReactMouseEvent<HTMLElement>) => {
      children.props.onClick?.(event)

      if (!event.defaultPrevented) {
        setOpen(!open)
      }
    },
    ref: composeRefs(children.props.ref, triggerRef)
  })
}

function cn(...values: Array<false | null | string | undefined>) {
  return values.filter(Boolean).join(" ")
}

function composeRefs<T>(...refs: Array<Ref<T> | undefined>) {
  return (node: null | T) => {
    for (const ref of refs) {
      if (!ref) continue

      if (typeof ref === "function") {
        ref(node)
      } else {
        ref.current = node
      }
    }
  }
}

function useFloatContext() {
  const context = useContext(FloatContext)

  if (!context) {
    throw new Error("Float components must be used inside <Float>")
  }

  return context
}
