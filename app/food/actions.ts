"use server"

import { and, eq, sql } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { z } from "zod"

import { db } from "@/db"
import { isUniqueViolation } from "@/db/errors"
import { dailyTargets, dayPlanItems, dayPlans, foods } from "@/db/schema"

import type { FoodActionState } from "./types"

import { requireUserId } from "../auth/lib"
import { getMostRecentTarget } from "./queries"
import { foodFormSchema, targetsFormSchema } from "./schemas"

export async function addFoodToPlan(
  foodId: string,
  date: string,
  amount: number
): Promise<
  undefined | { consumedAmount: number; dayPlanId: string; id: string; position: number }
> {
  const userId = await requireUserId()
  if (!amount || amount <= 0 || isNaN(amount)) return

  const food = await db.query.foods.findFirst({
    columns: { id: true },
    where: and(eq(foods.userId, userId), eq(foods.id, foodId))
  })
  if (!food) return

  const planId = await ensurePlan(userId, date)

  const [item] = await db
    .insert(dayPlanItems)
    .values({
      amount,
      dayPlanId: planId,
      foodId,
      position: sql`(SELECT COALESCE(MAX(${dayPlanItems.position}), -1) + 1 FROM ${dayPlanItems} WHERE ${eq(dayPlanItems.dayPlanId, planId)})`,
      userId
    })
    .returning({
      consumedAmount: dayPlanItems.consumedAmount,
      dayPlanId: dayPlanItems.dayPlanId,
      id: dayPlanItems.id,
      position: dayPlanItems.position
    })

  return item
}

export async function createFood(
  _prevState: FoodActionState,
  formData: FormData
): Promise<FoodActionState> {
  const userId = await requireUserId()
  const fields = Object.fromEntries(formData) as Record<string, string>

  const parsed = foodFormSchema.safeParse(fields)

  if (!parsed.success) {
    return {
      errors: z.flattenError(parsed.error).fieldErrors,
      fields,
      message: "Invalid request",
      success: false
    }
  }

  const data = parsed.data

  try {
    await db.insert(foods).values({
      baseAmount: data.baseAmount,
      calories: data.calories,
      carbohydrates: data.carbohydrates,
      fat: data.fat,
      name: data.name,
      notes: data.notes ?? null,
      position: nextFoodPosition(userId),
      protein: data.protein,
      unit: data.unit,
      userId
    })

    revalidateFood()

    return { errors: {}, message: "Food created successfully.", success: true }
  } catch (error) {
    if (isUniqueViolation(error)) {
      return {
        errors: { name: ["A food with that name already exists."] },
        fields,
        message: "A food with that name already exists.",
        success: false
      }
    }

    console.error("createFood failed:", error)

    return {
      errors: {},
      fields,
      message: "Something went wrong while creating the food.",
      success: false
    }
  }
}

export async function deleteFood(foodId: string): Promise<undefined | { error: string }> {
  const userId = await requireUserId()
  const inUse = await db
    .select({ id: dayPlanItems.id })
    .from(dayPlanItems)
    .where(and(eq(dayPlanItems.userId, userId), eq(dayPlanItems.foodId, foodId)))
    .limit(1)

  if (inUse.length > 0) {
    return { error: "Cannot delete: food is used in a plan." }
  }

  await db.delete(foods).where(and(eq(foods.userId, userId), eq(foods.id, foodId)))
  revalidateFood()
}

export async function duplicateFood(foodId: string): Promise<{ error: string } | { id: string }> {
  const userId = await requireUserId()
  const food = await db.query.foods.findFirst({
    where: and(eq(foods.userId, userId), eq(foods.id, foodId))
  })
  if (!food) return { error: "Food not found." }

  try {
    const [newFood] = await db
      .insert(foods)
      .values({
        baseAmount: food.baseAmount,
        calories: food.calories,
        carbohydrates: food.carbohydrates,
        fat: food.fat,
        name: `${food.name} (copy)`,
        notes: food.notes,
        position: nextFoodPosition(userId),
        protein: food.protein,
        unit: food.unit,
        userId
      })
      .returning({ id: foods.id })
    revalidateFood()
    return { id: newFood.id }
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { error: `A food named "${food.name} (copy)" already exists.` }
    }
    console.error("duplicateFood failed:", error)

    return { error: "Something went wrong while duplicating the food." }
  }
}

export async function markFullyConsumed(itemId: string, amount: number) {
  const userId = await requireUserId()
  if (!amount || amount <= 0 || isNaN(amount) || !isFinite(amount)) return
  await db
    .update(dayPlanItems)
    .set({ consumedAmount: amount })
    .where(and(eq(dayPlanItems.userId, userId), eq(dayPlanItems.id, itemId)))
}

export async function removePlanItem(itemId: string) {
  const userId = await requireUserId()
  await db
    .delete(dayPlanItems)
    .where(and(eq(dayPlanItems.userId, userId), eq(dayPlanItems.id, itemId)))
}

export async function reorderFoods(ids: string[]) {
  const userId = await requireUserId()
  await Promise.all(
    ids.map((id, position) =>
      db
        .update(foods)
        .set({ position })
        .where(and(eq(foods.userId, userId), eq(foods.id, id)))
    )
  )
  revalidateFood()
}

export async function reorderPlanItems(ids: string[]) {
  const userId = await requireUserId()
  await Promise.all(
    ids.map((id, position) =>
      db
        .update(dayPlanItems)
        .set({ position })
        .where(and(eq(dayPlanItems.userId, userId), eq(dayPlanItems.id, id)))
    )
  )
}

export async function setConsumedAmount(itemId: string, maxAmount: number, value: number) {
  const userId = await requireUserId()
  if (isNaN(value) || value < 0) return
  if (isNaN(maxAmount) || maxAmount <= 0 || !isFinite(maxAmount)) return
  await db
    .update(dayPlanItems)
    .set({ consumedAmount: Math.min(value, maxAmount) })
    .where(and(eq(dayPlanItems.userId, userId), eq(dayPlanItems.id, itemId)))
}

export async function setFoodHidden(foodId: string, hidden: boolean) {
  const userId = await requireUserId()
  await db
    .update(foods)
    .set({ hidden })
    .where(and(eq(foods.userId, userId), eq(foods.id, foodId)))
  revalidateFood()
}

export async function setPlannedAmount(itemId: string, value: number) {
  const userId = await requireUserId()
  if (isNaN(value) || value <= 0) return
  await db
    .update(dayPlanItems)
    .set({
      amount: value,
      consumedAmount: sql`LEAST(${dayPlanItems.consumedAmount}, ${value})`
    })
    .where(and(eq(dayPlanItems.userId, userId), eq(dayPlanItems.id, itemId)))
}

export async function updateFood(
  id: string,
  _prevState: FoodActionState,
  formData: FormData
): Promise<FoodActionState> {
  const userId = await requireUserId()
  const fields = Object.fromEntries(formData) as Record<string, string>
  const parsed = foodFormSchema.safeParse(fields)

  if (!parsed.success) {
    return {
      errors: z.flattenError(parsed.error).fieldErrors,
      fields,
      message: "Invalid request",
      success: false
    }
  }

  const data = parsed.data

  try {
    const updated = await db
      .update(foods)
      .set({
        baseAmount: data.baseAmount,
        calories: data.calories,
        carbohydrates: data.carbohydrates,
        fat: data.fat,
        name: data.name,
        notes: data.notes ?? null,
        protein: data.protein,
        unit: data.unit,
        updatedAt: new Date()
      })
      .where(and(eq(foods.userId, userId), eq(foods.id, id)))
      .returning({ id: foods.id })

    if (updated.length === 0) {
      return { errors: {}, fields, message: "Food not found.", success: false }
    }

    revalidateFood()

    return { errors: {}, message: "Food updated successfully.", success: true }
  } catch (error) {
    if (isUniqueViolation(error)) {
      return {
        errors: { name: ["A food with that name already exists."] },
        fields,
        message: "A food with that name already exists.",
        success: false
      }
    }

    console.error("updateFood failed:", error)

    return {
      errors: {},
      fields,
      message: "Something went wrong while updating the food.",
      success: false
    }
  }
}

export async function upsertDailyTarget(
  date: string,
  _prevState: { error: null | string; success: boolean },
  formData: FormData
): Promise<{ error: null | string; success: boolean }> {
  const userId = await requireUserId()

  const parsed = targetsFormSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { error: "All values must be non-negative numbers.", success: false }
  }

  const { calories, carbohydrates, fat, protein } = parsed.data
  const planId = await ensurePlan(userId, date)

  await db
    .insert(dailyTargets)
    .values({ calories, carbohydrates, dayPlanId: planId, fat, protein, userId })
    .onConflictDoUpdate({
      set: { calories, carbohydrates, fat, protein, updatedAt: new Date() },
      target: dailyTargets.dayPlanId
    })

  revalidateFood()
  return { error: null, success: true }
}

export async function upsertDayPlanNote(
  date: string,
  _prevState: { error: null | string; success: boolean },
  formData: FormData
): Promise<{ error: null | string; success: boolean }> {
  const userId = await requireUserId()
  const note = formData.get("note")
  if (typeof note !== "string") return { error: "Invalid note.", success: false }
  if (note.length > 2000) return { error: "Note must be 2000 characters or fewer.", success: false }

  const planId = await ensurePlan(userId, date)

  await db
    .update(dayPlans)
    .set({ note: note.trim() || null, updatedAt: new Date() })
    .where(and(eq(dayPlans.userId, userId), eq(dayPlans.id, planId)))

  revalidateFood()
  return { error: null, success: true }
}

async function ensurePlan(userId: string, date: string): Promise<string> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error("Invalid date format")

  const existing = await db.query.dayPlans.findFirst({
    columns: { id: true },
    where: and(eq(dayPlans.userId, userId), eq(dayPlans.date, date))
  })
  if (existing) return existing.id

  const lastTarget = await getMostRecentTarget(userId, date)
  const [plan] = await db.insert(dayPlans).values({ date, userId }).returning({ id: dayPlans.id })

  await db.insert(dailyTargets).values({
    calories: lastTarget?.calories ?? 0,
    carbohydrates: lastTarget?.carbohydrates ?? 0,
    dayPlanId: plan.id,
    fat: lastTarget?.fat ?? 0,
    protein: lastTarget?.protein ?? 0,
    userId
  })

  return plan.id
}

function nextFoodPosition(userId: string) {
  return sql<number>`(SELECT COALESCE(MAX(${foods.position}), -1) + 1 FROM ${foods} WHERE ${eq(foods.userId, userId)})`
}

function revalidateFood() {
  revalidatePath("/food")
  revalidatePath("/food/history")
}
