import type { SortingState } from "@tanstack/react-table"

const DEFAULT_FOODS_VISIBILITY: Record<string, boolean> = { carbohydrates: false }
const DEFAULT_PLAN_VISIBILITY: Record<string, boolean> = { carbohydrates: false, notes: false }

export type FoodsTableState = {
  order: string[]
  showHidden: boolean
  sorting: SortingState
  visibility: Record<string, boolean>
}

export type PanelsLayout = {
  leftPct: number
}

export type PlanTableState = {
  order: string[]
  showConsumed: boolean
  sorting: SortingState
  visibility: Record<string, boolean>
}

export function parseFoodsTableCookie(
  raw: string | undefined,
  defaultOrder: string[]
): FoodsTableState {
  try {
    if (!raw)
      return {
        order: defaultOrder,
        showHidden: false,
        sorting: [],
        visibility: DEFAULT_FOODS_VISIBILITY
      }
    const parsed = JSON.parse(decodeURIComponent(raw))
    return {
      order: parsed.columnOrder ?? defaultOrder,
      showHidden: parsed.showHidden === true,
      sorting: parsed.sorting ?? [],
      visibility: parsed.columnVisibility ?? DEFAULT_FOODS_VISIBILITY
    }
  } catch {
    return {
      order: defaultOrder,
      showHidden: false,
      sorting: [],
      visibility: DEFAULT_FOODS_VISIBILITY
    }
  }
}

export function parsePanelsLayoutCookie(raw: string | undefined): PanelsLayout {
  try {
    if (!raw) return { leftPct: 50 }
    const parsed = JSON.parse(decodeURIComponent(raw))
    return {
      leftPct: typeof parsed.leftPct === "number" ? parsed.leftPct : 50
    }
  } catch {
    return { leftPct: 50 }
  }
}

export function parsePlanTableCookie(
  raw: string | undefined,
  defaultOrder: string[]
): PlanTableState {
  try {
    if (!raw)
      return {
        order: defaultOrder,
        showConsumed: true,
        sorting: [],
        visibility: DEFAULT_PLAN_VISIBILITY
      }
    const parsed = JSON.parse(decodeURIComponent(raw))
    return {
      order: parsed.columnOrder ?? defaultOrder,
      showConsumed: parsed.showConsumed !== false,
      sorting: parsed.sorting ?? [],
      visibility: parsed.columnVisibility ?? DEFAULT_PLAN_VISIBILITY
    }
  } catch {
    return {
      order: defaultOrder,
      showConsumed: true,
      sorting: [],
      visibility: DEFAULT_PLAN_VISIBILITY
    }
  }
}
