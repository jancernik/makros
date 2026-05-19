"use client"

import { Menu } from "lucide-react"
import Link from "next/link"
import {
  type ComponentPropsWithoutRef,
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useState
} from "react"

type MobileNavButtonProps = ComponentPropsWithoutRef<"button"> & {
  children: ReactNode
}

type MobileNavLinkProps = ComponentPropsWithoutRef<typeof Link> & {
  children: ReactNode
}

type MobileNavProps = {
  children: ReactNode
}

const itemClass =
  "flex w-full items-center gap-3 px-4 py-2.5 text-left text-[14px] font-[inherit] text-(--text) transition-colors duration-100 hover:bg-[#111]"

const MobileNavCloseContext = createContext<() => void>(() => {})
export const useMobileNavClose = () => useContext(MobileNavCloseContext)

export function MobileNav({ children }: MobileNavProps) {
  const [open, setOpen] = useState(false)
  const close = useCallback(() => setOpen(false), [])

  return (
    <MobileNavCloseContext.Provider value={close}>
      <button
        aria-label="Open menu"
        className="flex h-9 w-9 items-center justify-center border border-[#2a2a2a] text-(--text) transition-colors duration-100 hover:bg-[#111] md:hidden"
        onClick={() => setOpen(true)}
        type="button"
      >
        <Menu size={16} />
      </button>

      {/* Backdrop */}
      <div
        className={[
          "fixed inset-0 z-40 bg-black/60 transition-opacity duration-200 md:hidden",
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        ].join(" ")}
        onClick={close}
      />

      {/* Sidebar panel */}
      <div
        className={[
          "fixed bottom-0 right-0 top-0 z-50 flex w-64 flex-col overflow-y-auto border-l border-[#1a1a1a] bg-(--bg-surface) transition-transform duration-200 md:hidden",
          open ? "translate-x-0" : "translate-x-full"
        ].join(" ")}
      >
        <nav className="flex flex-col">{children}</nav>
      </div>
    </MobileNavCloseContext.Provider>
  )
}

export function MobileNavButton({
  children,
  className,
  onClick,
  type = "button",
  ...rest
}: MobileNavButtonProps) {
  const close = useMobileNavClose()
  return (
    <button
      className={[itemClass, className].filter(Boolean).join(" ")}
      onClick={(e) => {
        close()
        onClick?.(e)
      }}
      type={type}
      {...rest}
    >
      {children}
    </button>
  )
}

export function MobileNavLink({ children, className, onClick, ...rest }: MobileNavLinkProps) {
  const close = useMobileNavClose()
  return (
    <Link
      className={[itemClass, className].filter(Boolean).join(" ")}
      onClick={(e) => {
        close()
        onClick?.(e)
      }}
      {...rest}
    >
      {children}
    </Link>
  )
}

export function MobileNavSeparator() {
  return <div className="my-1 h-px bg-[#1a1a1a]" />
}
