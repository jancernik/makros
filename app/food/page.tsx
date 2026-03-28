import { LogOut, PlusCircle, Ruler, SquarePen } from "lucide-react"
import { cookies } from "next/headers"

import { logout } from "../auth/actions"
import { isAuthEnabled } from "../auth/lib"
import { NavProvider } from "../components/nav-provider"
import { Button, ButtonLink } from "../components/ui/button"
import { DatePicker } from "./components/date-picker"
import { PLAN_TABLE_DEFAULT_ORDER } from "./components/day-plan-table"
import { FoodPanels } from "./components/food-panels"
import { FOODS_TABLE_DEFAULT_ORDER } from "./components/food-table"
import { MacroBar } from "./components/macro-bar"
import { parseFoodsTableCookie, parsePanelsLayoutCookie, parsePlanTableCookie } from "./cookies"
import { getDayPlanByDate, getFoods, getMostRecentTarget } from "./queries"

type Props = {
  searchParams: Promise<{ date?: string }>
}

export default async function FoodPage({ searchParams }: Props) {
  const { date } = await searchParams
  const cookieStore = await cookies()
  const timezone = cookieStore.get("timezone")?.value ?? "UTC"
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: timezone }).format(new Date())
  const selectedDate = date ?? today

  const foodsState = parseFoodsTableCookie(
    cookieStore.get("food-table")?.value,
    FOODS_TABLE_DEFAULT_ORDER
  )
  const planState = parsePlanTableCookie(
    cookieStore.get("plan-table")?.value,
    PLAN_TABLE_DEFAULT_ORDER
  )
  const panelsLayout = parsePanelsLayoutCookie(cookieStore.get("panels-layout")?.value)

  const authEnabled = isAuthEnabled()
  const [allFoods, plan] = await Promise.all([
    getFoods({ includeHidden: true }),
    getDayPlanByDate(selectedDate)
  ])
  const target = plan?.target ?? (await getMostRecentTarget(selectedDate))

  const planFoodIds = new Set(plan?.items.map((item) => item.foodId))
  const availableFoods = allFoods.filter((food) => !planFoodIds.has(food.id))

  return (
    <NavProvider>
      <main className="flex flex-col md:h-dvh md:overflow-hidden">
        <header className="flex shrink-0 items-center justify-between border-b border-[#1a1a1a] px-6 py-5">
          <div className="flex items-center gap-4">
            <h1>Makros</h1>
            <DatePicker date={selectedDate} today={today} />
          </div>

          <div className="flex items-center gap-3">
            <ButtonLink className="ml-3" href={`/food/targets?date=${selectedDate}`}>
              <Ruler size={15} /> Targets
            </ButtonLink>
            <ButtonLink href={`/food/note?date=${selectedDate}`}>
              <SquarePen size={15} /> Note
            </ButtonLink>
            <ButtonLink href="/food/new">
              <PlusCircle size={15} />
              New food
            </ButtonLink>
            {authEnabled ? (
              <form action={logout}>
                <Button type="submit" variant="danger">
                  <LogOut size={15} /> Logout
                </Button>
              </form>
            ) : null}
          </div>
        </header>

        <div className="shrink-0 border-b border-[#1a1a1a]">
          <MacroBar plan={plan} target={target} />
        </div>

        <FoodPanels
          availableFoods={availableFoods}
          date={selectedDate}
          foodsState={foodsState}
          panelsLayout={panelsLayout}
          plan={plan}
          planState={planState}
          target={target}
        />
      </main>
    </NavProvider>
  )
}
