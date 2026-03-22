"use client"

import { useRouter } from "next/navigation"
import { createContext, useContext, useTransition } from "react"

type NavContextValue = {
  isPending: boolean
  navigate: (url: string) => void
}

const NavContext = createContext<NavContextValue>({ isPending: false, navigate: () => {} })

export function NavProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function navigate(url: string) {
    startTransition(() => router.replace(url))
  }

  return <NavContext.Provider value={{ isPending, navigate }}>{children}</NavContext.Provider>
}

export const useNavContext = () => useContext(NavContext)
