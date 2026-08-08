"use server"

import { and, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { z } from "zod"

import { db } from "@/db"
import { weightEntries, weightTargets } from "@/db/schema"

import { requireUserId } from "../auth/lib"

const logSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  note: z.string().optional(),
  weight: z.coerce.number().positive("Weight must be positive")
})

const endDateField = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .nullable()
  .optional()
  .transform((v) => v || null)

const rateTargetSchema = z.object({
  endDate: endDateField,
  id: z.string().uuid().optional(),
  maxTargetRate: z.coerce.number(),
  minTargetRate: z.coerce.number(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startWeight: z.coerce.number().positive(),
  type: z.literal("rate")
})

const fixedTargetSchema = z.object({
  endDate: endDateField,
  id: z.string().uuid().optional(),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .nullable(),
  targetWeight: z.coerce.number().positive(),
  type: z.literal("fixed")
})

const targetSchema = z.discriminatedUnion("type", [rateTargetSchema, fixedTargetSchema])

export async function deleteWeightEntryByDate(date: string) {
  const userId = await requireUserId()
  await db
    .delete(weightEntries)
    .where(and(eq(weightEntries.userId, userId), eq(weightEntries.date, date)))
  revalidatePath("/weight")
}

export async function deleteWeightTargetById(id: string) {
  const userId = await requireUserId()
  await db
    .delete(weightTargets)
    .where(and(eq(weightTargets.userId, userId), eq(weightTargets.id, id)))
  revalidatePath("/weight")
}

export async function saveWeightTarget(_: unknown, formData: FormData) {
  const userId = await requireUserId()
  const raw = {
    endDate: (formData.get("endDate") as string) || null,
    id: formData.get("id") || undefined,
    maxTargetRate: formData.get("maxTargetRate"),
    minTargetRate: formData.get("minTargetRate"),
    startDate: formData.get("startDate"),
    startWeight: formData.get("startWeight"),
    targetWeight: formData.get("targetWeight"),
    type: formData.get("type")
  }

  const parsed = targetSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input", success: false }
  }

  const { id, ...values } = parsed.data

  if (id) {
    const updated = await db
      .update(weightTargets)
      .set({ ...values, updatedAt: new Date() })
      .where(and(eq(weightTargets.userId, userId), eq(weightTargets.id, id)))
      .returning({ id: weightTargets.id })

    if (updated.length === 0) {
      return { error: "Target not found", success: false }
    }
  } else {
    await db.insert(weightTargets).values({ ...values, userId })
  }

  revalidatePath("/weight")
  return { error: null, success: true }
}

export async function upsertWeightEntry(_: unknown, formData: FormData) {
  const userId = await requireUserId()
  const parsed = logSchema.safeParse({
    date: formData.get("date"),
    note: formData.get("note") || undefined,
    weight: formData.get("weight")
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input", success: false }
  }

  const { date, note, weight } = parsed.data
  const originalDate = formData.get("originalDate") as null | string
  const dateChanged = originalDate !== date

  if (dateChanged) {
    const [existing] = await db
      .select({ date: weightEntries.date })
      .from(weightEntries)
      .where(and(eq(weightEntries.userId, userId), eq(weightEntries.date, date)))
      .limit(1)
    if (existing) {
      return { error: `A log entry for ${date} already exists`, success: false }
    }
  }

  if (originalDate && dateChanged) {
    const updated = await db
      .update(weightEntries)
      .set({ date, note: note ?? null, updatedAt: new Date(), weight })
      .where(and(eq(weightEntries.userId, userId), eq(weightEntries.date, originalDate)))
      .returning({ id: weightEntries.id })

    if (updated.length === 0) {
      return { error: "Log entry not found", success: false }
    }
  } else {
    await db
      .insert(weightEntries)
      .values({ date, note: note ?? null, userId, weight })
      .onConflictDoUpdate({
        set: { note: note ?? null, updatedAt: new Date(), weight },
        target: [weightEntries.userId, weightEntries.date]
      })
  }

  revalidatePath("/weight")
  return { error: null, success: true }
}
