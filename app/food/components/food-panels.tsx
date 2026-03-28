"use client"

import type { DailyTarget, Food } from "@/db/schema"

import type { FoodsTableState, PanelsLayout, PlanTableState } from "../cookies"
import type { getDayPlanByDate } from "../queries"

import { DayPlanTable } from "./day-plan-table"
import { FoodsTable } from "./food-table"
import { ResizablePanels } from "./resizable-panels"

type Props = {
  availableFoods: Food[]
  date: string
  foodsState: FoodsTableState
  panelsLayout: PanelsLayout
  plan: Awaited<ReturnType<typeof getDayPlanByDate>>
  planState: PlanTableState
  target: DailyTarget | undefined
}

export function FoodPanels({
  availableFoods,
  date,
  foodsState,
  panelsLayout,
  plan,
  planState,
  target
}: Props) {
  return (
    <ResizablePanels
      defaultLeftPct={panelsLayout.leftPct}
      left={
        <FoodsTable
          date={date}
          foods={availableFoods}
          initialOrder={foodsState.order}
          initialShowHidden={foodsState.showHidden}
          initialSorting={foodsState.sorting}
          initialVisibility={foodsState.visibility}
          target={target}
        />
      }
      right={
        <DayPlanTable
          initialOrder={planState.order}
          initialShowConsumed={planState.showConsumed}
          initialSorting={planState.sorting}
          initialVisibility={planState.visibility}
          plan={plan}
          target={target}
        />
      }
    />
  )
}
