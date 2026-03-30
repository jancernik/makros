"use client"

import { useRouter } from "nextjs-toploader/app"
import { useActionState, useEffect, useState } from "react"

import type { Food } from "@/db/schema"

import type { FoodActionState } from "../types"

import { SubmitButton } from "../../components/submit-button"
import { Input } from "../../components/ui/input"
import { Select } from "../../components/ui/select"
import { createFood, updateFood } from "../actions"

type Props = {
  food?: Food
}

const initialState: FoodActionState = {
  errors: {},
  message: null,
  success: false
}

const UNIT_OPTIONS = [
  { label: "grams", value: "g" },
  { label: "milliliters", value: "ml" },
  { label: "units", value: "unit" }
]

export function FoodForm({ food }: Props) {
  const router = useRouter()
  const action = food ? updateFood.bind(null, food.id) : createFood
  const [state, formAction] = useActionState(action, initialState)
  const [unit, setUnit] = useState<string>(state.fields?.unit ?? food?.unit ?? "g")

  useEffect(() => {
    if (state.success) router.push("/food")
  }, [state.success, router])

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          className="sm:col-span-2"
          defaultValue={state.fields?.name ?? food?.name}
          error={state.errors.name?.[0]}
          id="name"
          label="Name"
          name="name"
          placeholder={food ? undefined : "Rice"}
          type="text"
        />

        <Input
          defaultValue={state.fields?.baseAmount ?? food?.baseAmount}
          error={state.errors.baseAmount?.[0]}
          id="baseAmount"
          label="Base amount"
          min="0"
          name="baseAmount"
          placeholder={food ? undefined : unit === "unit" ? "1" : "100"}
          step="1"
          type="number"
          unit={unit !== "unit" ? unit : undefined}
        />

        <Select
          defaultValue={state.fields?.unit ?? food?.unit ?? "g"}
          error={state.errors.unit?.[0]}
          id="unit"
          label="Unit"
          name="unit"
          onChange={setUnit}
          options={UNIT_OPTIONS}
        />

        <Input
          defaultValue={state.fields?.calories ?? food?.calories}
          error={state.errors.calories?.[0]}
          id="calories"
          label="Calories"
          min="0"
          name="calories"
          placeholder={food ? undefined : "130"}
          step="0.01"
          type="number"
          unit="kcal"
        />

        <Input
          defaultValue={state.fields?.protein ?? food?.protein}
          error={state.errors.protein?.[0]}
          id="protein"
          label="Protein"
          min="0"
          name="protein"
          placeholder={food ? undefined : "2.7"}
          step="0.01"
          type="number"
          unit="g"
        />

        <Input
          defaultValue={state.fields?.carbohydrates ?? food?.carbohydrates}
          error={state.errors.carbohydrates?.[0]}
          id="carbohydrates"
          label="Carbohydrates"
          min="0"
          name="carbohydrates"
          placeholder={food ? undefined : "28"}
          step="0.01"
          type="number"
          unit="g"
        />

        <Input
          defaultValue={state.fields?.fat ?? food?.fat}
          error={state.errors.fat?.[0]}
          id="fat"
          label="Fat"
          min="0"
          name="fat"
          placeholder={food ? undefined : "0.3"}
          step="0.01"
          type="number"
          unit="g"
        />

        <Input
          className="sm:col-span-2"
          defaultValue={state.fields?.notes ?? food?.notes ?? ""}
          error={state.errors.notes?.[0]}
          id="notes"
          label="Notes"
          multiline
          name="notes"
          placeholder="Optional"
          rows={3}
        />
      </div>

      {state.message && !state.success && !Object.values(state.errors).some((e) => e?.length) ? (
        <p className="text-sm text-red-400">{state.message}</p>
      ) : null}

      <div className="flex justify-center">
        <SubmitButton pendingLabel="Saving…">{food ? "Save changes" : "Save food"}</SubmitButton>
      </div>
    </form>
  )
}
