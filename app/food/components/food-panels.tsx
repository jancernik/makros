"use client"

import type { DailyTarget, Food } from "@/db/schema"

import type { FoodsTableState, PanelsLayout, PlanTableState } from "../cookies"

import { DayPlanTable } from "./day-plan-table"
import { FoodsTable } from "./food-table"
import { ResizablePanels } from "./resizable-panels"

type Props = {
  allFoods: Food[]
  date: string
  foodsState: FoodsTableState
  panelsLayout: PanelsLayout
  planState: PlanTableState
  target: DailyTarget | undefined
}

export function FoodPanels({ allFoods, date, foodsState, panelsLayout, planState, target }: Props) {
  return (
    <ResizablePanels
      defaultLeftPct={panelsLayout.leftPct}
      left={
        <FoodsTable
          allFoods={allFoods}
          date={date}
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
          target={target}
        />
      }
    />
  )
}
