"use client"

import { LogOut, PlusCircle, Ruler, SquarePen } from "lucide-react"

import type { DailyTarget, Food } from "@/db/schema"

import type { FoodsTableState, PanelsLayout, PlanTableState } from "../cookies"
import type { getDayPlanByDate } from "../queries"

import { logout } from "../../auth/actions"
import { NavProvider } from "../../components/nav-provider"
import { Button, ButtonLink } from "../../components/ui/button"
import { DatePicker } from "./date-picker"
import { FoodPanels } from "./food-panels"
import { MacroBar } from "./macro-bar"
import { PlanProvider } from "./plan-provider"
import { SaveIcon } from "./save-icon"

type Props = {
  allFoods: Food[]
  authEnabled: boolean
  date: string
  foodsState: FoodsTableState
  panelsLayout: PanelsLayout
  plan: Awaited<ReturnType<typeof getDayPlanByDate>>
  planState: PlanTableState
  target: DailyTarget | undefined
  today: string
}

export function FoodContent({
  allFoods,
  authEnabled,
  date,
  foodsState,
  panelsLayout,
  plan,
  planState,
  target,
  today
}: Props) {
  return (
    <PlanProvider date={date} plan={plan}>
      <NavProvider>
        <main className="flex flex-col md:h-dvh md:overflow-hidden">
          <header className="flex shrink-0 items-center justify-between border-b border-[#1a1a1a] px-6 py-5">
            <div className="flex items-center gap-4">
              <h1>Makros</h1>
              <DatePicker date={date} today={today} />
            </div>
            <div className="flex items-center gap-3">
              <SaveIcon className="ml-6 mr-3" />
              <ButtonLink href={`/food/targets?date=${date}`}>
                <Ruler size={15} /> Targets
              </ButtonLink>
              <ButtonLink href={`/food/note?date=${date}`}>
                <SquarePen size={15} /> Note
              </ButtonLink>
              <ButtonLink href="/food/new">
                <PlusCircle size={15} /> New food
              </ButtonLink>
              {authEnabled && (
                <form action={logout}>
                  <Button type="submit" variant="danger">
                    <LogOut size={15} /> Logout
                  </Button>
                </form>
              )}
            </div>
          </header>
          <div className="shrink-0 border-b border-[#1a1a1a]">
            <MacroBar target={target} />
          </div>
          <FoodPanels
            allFoods={allFoods}
            date={date}
            foodsState={foodsState}
            panelsLayout={panelsLayout}
            planState={planState}
            target={target}
          />
        </main>
      </NavProvider>
    </PlanProvider>
  )
}
