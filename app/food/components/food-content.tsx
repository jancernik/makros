"use client"

import { LogOut, PlusCircle, Ruler, SquarePen, TrendingUp, Weight } from "lucide-react"

import type { DailyTarget, Food } from "@/db/schema"

import type { FoodsTableState, PanelsLayout, PlanTableState } from "../cookies"
import type { getDayPlanByDate } from "../queries"

import { logout } from "../../auth/actions"
import {
  MobileNav,
  MobileNavButton,
  MobileNavLink,
  MobileNavSeparator
} from "../../components/mobile-nav"
import { NavProvider } from "../../components/nav-provider"
import { Button, ButtonLink } from "../../components/ui/button"
import { DatePicker, SidebarDatePicker } from "./date-picker"
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
        <main className="flex h-dvh flex-col overflow-hidden">
          <header className="flex shrink-0 items-center justify-between border-b border-[#1a1a1a] px-4 py-3 md:px-6 md:py-5">
            <div className="flex items-center gap-2 md:gap-4">
              <ButtonLink href="/weight" variant="primary">
                <Weight size={15} />
                Weight
              </ButtonLink>
              <div className="hidden md:block">
                <DatePicker date={date} today={today} />
              </div>
            </div>

            <div className="flex items-center gap-1.5 md:gap-3">
              <SaveIcon className="mr-0 md:mr-3" />

              <div className="hidden md:flex md:items-center md:gap-3">
                <ButtonLink href={`/food/targets?date=${date}`}>
                  <Ruler size={15} /> Targets
                </ButtonLink>
                <ButtonLink href="/food/history">
                  <TrendingUp size={15} /> History
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

              <MobileNav>
                <SidebarDatePicker date={date} today={today} />
                <MobileNavLink href={`/food/targets?date=${date}`}>
                  <Ruler size={14} /> Targets
                </MobileNavLink>
                <MobileNavLink href="/food/history">
                  <TrendingUp size={14} /> History
                </MobileNavLink>
                <MobileNavLink href={`/food/note?date=${date}`}>
                  <SquarePen size={14} /> Note
                </MobileNavLink>
                <MobileNavLink href="/food/new">
                  <PlusCircle size={14} /> New food
                </MobileNavLink>
                {authEnabled && (
                  <>
                    <MobileNavSeparator />
                    <form action={logout}>
                      <MobileNavButton className="text-red-400" type="submit">
                        <LogOut size={14} /> Logout
                      </MobileNavButton>
                    </form>
                  </>
                )}
              </MobileNav>
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
