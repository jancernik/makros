"use client"

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react"

import type { getDayPlanByDate } from "../queries"

import { removePlanItem, setPlannedAmount } from "../actions"

export type PlanItem = NonNullable<Plan>["items"][number]
export type SaveStatus = "error" | "idle" | "saved" | "saving"

type AmountOverride = { amount: number; consumedAmount: number }
type Plan = Awaited<ReturnType<typeof getDayPlanByDate>>

type PlanContextValue = {
  addPendingItem: (item: PlanItem) => void
  amounts: Record<string, AmountOverride>
  baseItems: PlanItem[]
  cancelPendingItem: (itemId: string) => void
  markRemoved: (id: string) => void
  pendingItemIds: ReadonlySet<string>
  pendingItems: PlanItem[]
  planFoodIds: ReadonlySet<string>
  promotePendingItem: (tempId: string, realItem: PlanItem) => void
  removedIds: ReadonlySet<string>
  saveStatus: SaveStatus
  trackSave: (thunk: () => Promise<unknown>) => void
  updateAmounts: (id: string, amount: number, consumedAmount: number) => void
}

const PlanContext = createContext<null | PlanContextValue>(null)

export function PlanProvider({
  children,
  date,
  plan
}: {
  children: ReactNode
  date: string
  plan: Plan
}) {
  const serverItems = useMemo(() => plan?.items ?? [], [plan])

  const [baseItems, setBaseItems] = useState(serverItems)
  const [prevPlan, setPrevPlan] = useState(plan)
  const [prevDate, setPrevDate] = useState(date)
  const [amounts, setAmounts] = useState<Record<string, AmountOverride>>(() =>
    initialAmounts(serverItems)
  )
  const [removedIds, setRemovedIds] = useState<ReadonlySet<string>>(new Set())
  const [pendingItems, setPendingItems] = useState<PlanItem[]>([])
  const inFlightIds = useRef<Set<string>>(new Set())
  const cancelledPendingIds = useRef<Set<string>>(new Set())
  const amountsRef = useRef(amounts)
  amountsRef.current = amounts
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle")
  const inFlightSaves = useRef(0)
  const savedTimerRef = useRef<null | ReturnType<typeof setTimeout>>(null)
  const retryQueue = useRef<Array<() => Promise<unknown>>>([])

  if (date !== prevDate) {
    setPrevDate(date)
    setPrevPlan(plan)
    const newItems = plan?.items ?? []
    setBaseItems(newItems)
    setAmounts(initialAmounts(newItems))
    setRemovedIds(new Set())
    setPendingItems([])
    inFlightIds.current = new Set()
    cancelledPendingIds.current = new Set()
  } else if (plan !== prevPlan) {
    setPrevPlan(plan)
    const newItems = plan?.items ?? []
    const newFoodIds = new Set(newItems.map((i) => i.foodId))
    setBaseItems(newItems)
    setAmounts((prev) => mergeAmounts(prev, newItems))
    setRemovedIds(new Set())
    setPendingItems((prev) => prev.filter((i) => !newFoodIds.has(i.foodId)))
  }

  useEffect(() => {
    if (saveStatus !== "saving" && saveStatus !== "error") return
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
    }
    window.addEventListener("beforeunload", handler)
    return () => window.removeEventListener("beforeunload", handler)
  }, [saveStatus])

  const trackSave = useCallback((thunk: () => Promise<unknown>) => {
    inFlightSaves.current += 1
    if (savedTimerRef.current) clearTimeout(savedTimerRef.current)
    setSaveStatus("saving")
    thunk().then(
      () => {
        inFlightSaves.current -= 1
        if (inFlightSaves.current === 0) {
          setSaveStatus("saved")
          savedTimerRef.current = setTimeout(() => setSaveStatus("idle"), 2000)
        }
      },
      () => {
        inFlightSaves.current -= 1
        retryQueue.current.push(thunk)
        setSaveStatus("error")
      }
    )
  }, [])

  useEffect(() => {
    if (saveStatus !== "error") return

    const flush = () => {
      const queue = retryQueue.current.splice(0)
      for (const thunk of queue) trackSave(thunk)
    }

    window.addEventListener("online", flush)
    const id = setInterval(flush, 10_000)

    return () => {
      window.removeEventListener("online", flush)
      clearInterval(id)
    }
  }, [saveStatus, trackSave])

  const updateAmounts = useCallback((id: string, amount: number, consumedAmount: number) => {
    setAmounts((prev) => ({ ...prev, [id]: { amount, consumedAmount } }))
  }, [])

  const markRemoved = useCallback((id: string) => {
    setRemovedIds((prev) => new Set([...prev, id]))
  }, [])

  const addPendingItem = useCallback((item: PlanItem) => {
    inFlightIds.current.add(item.id)
    setPendingItems((prev) => [...prev, item])
  }, [])

  const cancelPendingItem = useCallback(
    (itemId: string) => {
      setPendingItems((prev) => prev.filter((i) => i.id !== itemId))
      if (inFlightIds.current.has(itemId)) {
        inFlightIds.current.delete(itemId)
        cancelledPendingIds.current.add(itemId)
      } else {
        trackSave(() => removePlanItem(itemId))
      }
    },
    [trackSave]
  )

  const promotePendingItem = useCallback(
    (tempId: string, realItem: PlanItem) => {
      inFlightIds.current.delete(tempId)
      if (cancelledPendingIds.current.has(tempId)) {
        cancelledPendingIds.current.delete(tempId)
        trackSave(() => removePlanItem(realItem.id))
        return
      }
      const override = amountsRef.current[tempId]
      setAmounts((prev) => {
        const o = prev[tempId]
        if (!o) return prev
        const { [tempId]: _, ...rest } = prev
        return { ...rest, [realItem.id]: o }
      })
      if (override && override.amount !== realItem.amount) {
        trackSave(() => setPlannedAmount(realItem.id, override.amount))
      }
      setPendingItems((prev) => prev.map((i) => (i.id === tempId ? realItem : i)))
    },
    [trackSave]
  )

  const pendingItemIds = useMemo(() => new Set(pendingItems.map((i) => i.id)), [pendingItems])

  const planFoodIds = useMemo(
    () =>
      new Set([
        ...baseItems.filter((i) => !removedIds.has(i.id)).map((i) => i.foodId),
        ...pendingItems.map((i) => i.foodId)
      ]),
    [baseItems, removedIds, pendingItems]
  )

  return (
    <PlanContext.Provider
      value={{
        addPendingItem,
        amounts,
        baseItems,
        cancelPendingItem,
        markRemoved,
        pendingItemIds,
        pendingItems,
        planFoodIds,
        promotePendingItem,
        removedIds,
        saveStatus,
        trackSave,
        updateAmounts
      }}
    >
      {children}
    </PlanContext.Provider>
  )
}

export function usePlan() {
  const ctx = useContext(PlanContext)
  if (!ctx) throw new Error("usePlan must be used within PlanProvider")
  return ctx
}

function initialAmounts(items: PlanItem[]): Record<string, AmountOverride> {
  return Object.fromEntries(
    items.map((i) => [i.id, { amount: i.amount, consumedAmount: i.consumedAmount }])
  )
}

function mergeAmounts(
  prev: Record<string, AmountOverride>,
  serverItems: PlanItem[]
): Record<string, AmountOverride> {
  const serverItemIds = new Set(serverItems.map((i) => i.id))
  const next: Record<string, AmountOverride> = {}
  for (const item of serverItems) {
    next[item.id] = prev[item.id] ?? { amount: item.amount, consumedAmount: item.consumedAmount }
  }
  for (const [id, override] of Object.entries(prev)) {
    if (!serverItemIds.has(id)) next[id] = override
  }
  return next
}
