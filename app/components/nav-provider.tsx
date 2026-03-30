"use client"

import { useRouter } from "nextjs-toploader/app"
import NProgress from "nprogress"
import { createContext, ReactNode, useContext, useEffect, useTransition } from "react"

type NavContextValue = {
  isPending: boolean
  navigate: (url: string) => void
}

const NavContext = createContext<NavContextValue>({ isPending: false, navigate: () => {} })

export function NavProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // NextTopLoader misses navigations that remove search params (e.g. /food?date=X → /food) so I trigger NProgress manually.
  function navigate(url: string) {
    NProgress.start()
    startTransition(() => router.replace(url))
  }

  useEffect(() => {
    if (!isPending) NProgress.done()
  }, [isPending])

  return <NavContext.Provider value={{ isPending, navigate }}>{children}</NavContext.Provider>
}

export const useNavContext = () => useContext(NavContext)
