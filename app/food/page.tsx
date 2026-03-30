import { cookies } from "next/headers"

import { isAuthEnabled } from "../auth/lib"
import { PLAN_TABLE_DEFAULT_ORDER } from "./components/day-plan-table"
import { FoodContent } from "./components/food-content"
import { FOODS_TABLE_DEFAULT_ORDER } from "./components/food-table"
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

  return (
    <FoodContent
      allFoods={allFoods}
      authEnabled={authEnabled}
      date={selectedDate}
      foodsState={foodsState}
      panelsLayout={panelsLayout}
      plan={plan}
      planState={planState}
      target={target}
      today={today}
    />
  )
}
