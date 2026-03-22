import { asc, desc, eq, getTableColumns, lte } from "drizzle-orm"

import { db } from "@/db"
import { dailyTargets, dayPlans, foods } from "@/db/schema"

export async function getDayPlanByDate(date: string) {
  return db.query.dayPlans.findFirst({
    where: eq(dayPlans.date, date),
    with: {
      items: {
        orderBy: (items, { asc }) => [asc(items.position)],
        with: { food: true }
      },
      target: true
    }
  })
}

export async function getFoodById(id: string) {
  return db.query.foods.findFirst({ where: eq(foods.id, id) })
}

export async function getFoods({ includeHidden = false } = {}) {
  return db
    .select()
    .from(foods)
    .where(includeHidden ? undefined : eq(foods.hidden, false))
    .orderBy(asc(foods.position), asc(foods.name))
}

export async function getMostRecentTarget(date: string) {
  const rows = await db
    .select(getTableColumns(dailyTargets))
    .from(dailyTargets)
    .innerJoin(dayPlans, eq(dailyTargets.dayPlanId, dayPlans.id))
    .where(lte(dayPlans.date, date))
    .orderBy(desc(dayPlans.date))
    .limit(1)
  return rows[0]
}
