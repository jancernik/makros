"use server"

import { eq, sql } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { z } from "zod"

import { db } from "@/db"
import { dailyTargets, dayPlanItems, dayPlans, foods } from "@/db/schema"

import type { FoodActionState } from "./types"

import { requireAuth } from "../auth/lib"
import { getMostRecentTarget } from "./queries"
import { foodFormSchema, targetsFormSchema } from "./schemas"

export async function addFoodToPlan(
  foodId: string,
  date: string,
  amount: number
): Promise<
  undefined | { consumedAmount: number; dayPlanId: string; id: string; position: number }
> {
  await requireAuth()
  if (!amount || amount <= 0 || isNaN(amount)) return

  const planId = await ensurePlan(date)

  const [item] = await db
    .insert(dayPlanItems)
    .values({
      amount,
      dayPlanId: planId,
      foodId,
      position: sql`(SELECT COALESCE(MAX(${dayPlanItems.position}), -1) + 1 FROM ${dayPlanItems} WHERE ${dayPlanItems.dayPlanId} = ${planId})`
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
  await requireAuth()
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
      position: sql`(SELECT COALESCE(MAX(${foods.position}), -1) + 1 FROM ${foods})`,
      protein: data.protein,
      unit: data.unit
    })

    revalidatePath("/food")

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

    return {
      errors: {},
      fields,
      message: "Something went wrong while creating the food.",
      success: false
    }
  }
}

export async function deleteFood(foodId: string): Promise<undefined | { error: string }> {
  await requireAuth()
  const inUse = await db
    .select({ id: dayPlanItems.id })
    .from(dayPlanItems)
    .where(eq(dayPlanItems.foodId, foodId))
    .limit(1)

  if (inUse.length > 0) {
    return { error: "Cannot delete: food is used in a plan." }
  }

  await db.delete(foods).where(eq(foods.id, foodId))
  revalidatePath("/food")
}

export async function duplicateFood(foodId: string): Promise<{ error: string } | { id: string }> {
  await requireAuth()
  const food = await db.query.foods.findFirst({ where: eq(foods.id, foodId) })
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
        position: sql`(SELECT COALESCE(MAX(${foods.position}), -1) + 1 FROM ${foods})`,
        protein: food.protein,
        unit: food.unit
      })
      .returning({ id: foods.id })
    revalidatePath("/food")
    return { id: newFood.id }
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { error: `A food named "${food.name} (copy)" already exists.` }
    }
    return { error: "Something went wrong while duplicating the food." }
  }
}

export async function markFullyConsumed(itemId: string, amount: number) {
  await requireAuth()
  if (!amount || amount <= 0 || isNaN(amount) || !isFinite(amount)) return
  await db.update(dayPlanItems).set({ consumedAmount: amount }).where(eq(dayPlanItems.id, itemId))
}

export async function removePlanItem(itemId: string) {
  await requireAuth()
  await db.delete(dayPlanItems).where(eq(dayPlanItems.id, itemId))
}

export async function reorderFoods(ids: string[]) {
  await requireAuth()
  await Promise.all(
    ids.map((id, position) => db.update(foods).set({ position }).where(eq(foods.id, id)))
  )
  revalidatePath("/food")
}

export async function reorderPlanItems(ids: string[]) {
  await requireAuth()
  await Promise.all(
    ids.map((id, position) =>
      db.update(dayPlanItems).set({ position }).where(eq(dayPlanItems.id, id))
    )
  )
}

export async function setConsumedAmount(itemId: string, maxAmount: number, value: number) {
  await requireAuth()
  if (isNaN(value) || value < 0) return
  if (isNaN(maxAmount) || maxAmount <= 0 || !isFinite(maxAmount)) return
  await db
    .update(dayPlanItems)
    .set({ consumedAmount: Math.min(value, maxAmount) })
    .where(eq(dayPlanItems.id, itemId))
}

export async function setFoodHidden(foodId: string, hidden: boolean) {
  await requireAuth()
  await db.update(foods).set({ hidden }).where(eq(foods.id, foodId))
  revalidatePath("/food")
}

export async function setPlannedAmount(itemId: string, value: number) {
  await requireAuth()
  if (isNaN(value) || value <= 0) return
  await db
    .update(dayPlanItems)
    .set({
      amount: value,
      consumedAmount: sql`LEAST(${dayPlanItems.consumedAmount}, ${value})`
    })
    .where(eq(dayPlanItems.id, itemId))
}

export async function updateFood(
  id: string,
  _prevState: FoodActionState,
  formData: FormData
): Promise<FoodActionState> {
  await requireAuth()
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
    await db
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
      .where(eq(foods.id, id))

    revalidatePath("/food")

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
  await requireAuth()

  const parsed = targetsFormSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { error: "All values must be non-negative numbers.", success: false }
  }

  const { calories, carbohydrates, fat, protein } = parsed.data
  const planId = await ensurePlan(date)

  await db
    .insert(dailyTargets)
    .values({ calories, carbohydrates, dayPlanId: planId, fat, protein })
    .onConflictDoUpdate({
      set: { calories, carbohydrates, fat, protein, updatedAt: new Date() },
      target: dailyTargets.dayPlanId
    })

  revalidatePath("/food")
  return { error: null, success: true }
}

export async function upsertDayPlanNote(
  date: string,
  _prevState: { error: null | string; success: boolean },
  formData: FormData
): Promise<{ error: null | string; success: boolean }> {
  await requireAuth()
  const note = formData.get("note")
  if (typeof note !== "string") return { error: "Invalid note.", success: false }
  if (note.length > 2000) return { error: "Note must be 2000 characters or fewer.", success: false }

  const planId = await ensurePlan(date)

  await db
    .update(dayPlans)
    .set({ note: note.trim() || null, updatedAt: new Date() })
    .where(eq(dayPlans.id, planId))

  revalidatePath("/food")
  return { error: null, success: true }
}

async function ensurePlan(date: string): Promise<string> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error("Invalid date format")

  const existing = await db.query.dayPlans.findFirst({
    columns: { id: true },
    where: eq(dayPlans.date, date)
  })
  if (existing) return existing.id

  const lastTarget = await getMostRecentTarget(date)
  const [plan] = await db.insert(dayPlans).values({ date }).returning({ id: dayPlans.id })

  await db.insert(dailyTargets).values({
    calories: lastTarget?.calories ?? 0,
    carbohydrates: lastTarget?.carbohydrates ?? 0,
    dayPlanId: plan.id,
    fat: lastTarget?.fat ?? 0,
    protein: lastTarget?.protein ?? 0
  })

  return plan.id
}

function isUniqueViolation(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false
  if ("code" in error && (error as { code: unknown }).code === "23505") return true
  if ("cause" in error) return isUniqueViolation((error as { cause: unknown }).cause)
  return false
}
