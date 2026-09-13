import { and, asc, desc, eq, getTableColumns, gte, lte } from "drizzle-orm"

import { db } from "@/db"
import { dailyTargets, dayPlans, foods, weightEntries, weightTargets } from "@/db/schema"

export async function getDayPlanByDate(userId: string, date: string) {
  return db.query.dayPlans.findFirst({
    where: and(eq(dayPlans.userId, userId), eq(dayPlans.date, date)),
    with: {
      items: {
        orderBy: (items, { asc }) => [asc(items.position)],
        with: { food: true }
      },
      target: true
    }
  })
}

export async function getFoodById(userId: string, id: string) {
  return db.query.foods.findFirst({
    where: and(eq(foods.userId, userId), eq(foods.id, id))
  })
}

export async function getFoods(userId: string, { includeHidden = false } = {}) {
  return db
    .select()
    .from(foods)
    .where(and(eq(foods.userId, userId), includeHidden ? undefined : eq(foods.hidden, false)))
    .orderBy(asc(foods.position), asc(foods.name))
}

export async function getMostRecentTarget(userId: string, date: string) {
  const rows = await db
    .select(getTableColumns(dailyTargets))
    .from(dailyTargets)
    .innerJoin(dayPlans, eq(dailyTargets.dayPlanId, dayPlans.id))
    .where(and(eq(dayPlans.userId, userId), lte(dayPlans.date, date)))
    .orderBy(desc(dayPlans.date))
    .limit(1)
  return rows[0]
}

export async function getRecentDayPlans(userId: string, endDate: string, days = 30) {
  const start = new Date(`${endDate}T12:00:00`)
  start.setDate(start.getDate() - days + 1)
  const startDate = start.toISOString().split("T")[0]

  return db.query.dayPlans.findMany({
    orderBy: asc(dayPlans.date),
    where: and(
      eq(dayPlans.userId, userId),
      lte(dayPlans.date, endDate),
      gte(dayPlans.date, startDate)
    ),
    with: {
      items: { with: { food: true } },
      target: true
    }
  })
}

export async function getWeightEntries(userId: string, days = 90) {
  const start = new Date()
  start.setDate(start.getDate() - days + 1)
  const startDate = start.toISOString().split("T")[0]

  return db
    .select()
    .from(weightEntries)
    .where(and(eq(weightEntries.userId, userId), gte(weightEntries.date, startDate)))
    .orderBy(asc(weightEntries.date))
}

export async function getWeightEntryByDate(userId: string, date: string) {
  const [entry] = await db
    .select()
    .from(weightEntries)
    .where(and(eq(weightEntries.userId, userId), eq(weightEntries.date, date)))
    .limit(1)
  return entry ?? null
}

export async function getWeightTargetById(userId: string, id: string) {
  const [target] = await db
    .select()
    .from(weightTargets)
    .where(and(eq(weightTargets.userId, userId), eq(weightTargets.id, id)))
    .limit(1)
  return target ?? null
}

export async function getWeightTargets(userId: string) {
  return db
    .select()
    .from(weightTargets)
    .where(eq(weightTargets.userId, userId))
    .orderBy(asc(weightTargets.startDate))
}
