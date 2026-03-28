import { createInsertSchema } from "drizzle-zod"
import { z } from "zod"

import { foods } from "@/db/schema"

export const foodFormSchema = createInsertSchema(foods, {
  baseAmount: z.coerce.number().positive("Base amount must be greater than 0"),
  calories: z.coerce.number().min(0, "Calories must be 0 or more"),
  carbohydrates: z.coerce.number().min(0, "Carbohydrates must be 0 or more"),
  fat: z.coerce.number().min(0, "Fat must be 0 or more"),
  name: z.string().trim().min(1, "Name is required").max(120, "Name is too long"),
  notes: z
    .string()
    .trim()
    .max(500, "Notes must be 500 characters or less")
    .optional()
    .transform((value) => (value === "" ? undefined : value)),
  protein: z.coerce.number().min(0, "Protein must be 0 or more")
}).omit({ createdAt: true, hidden: true, id: true, position: true, updatedAt: true })

export type FoodFormInput = z.infer<typeof foodFormSchema>

export const targetsFormSchema = z.object({
  calories: z.coerce.number().min(0, "Calories must be 0 or more"),
  carbohydrates: z.coerce.number().min(0, "Carbohydrates must be 0 or more"),
  fat: z.coerce.number().min(0, "Fat must be 0 or more"),
  protein: z.coerce.number().min(0, "Protein must be 0 or more")
})

export type TargetsFormInput = z.infer<typeof targetsFormSchema>
