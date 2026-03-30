"use client"

import { useRouter } from "nextjs-toploader/app"
import { useActionState, useEffect } from "react"

import type { DailyTarget } from "@/db/schema"

import { SubmitButton } from "../../components/submit-button"
import { Input } from "../../components/ui/input"
import { upsertDailyTarget } from "../actions"

type Props = {
  date: string
  target: DailyTarget | undefined
}

const initialState = { error: null, success: false }

export function SetTargetsForm({ date, target }: Props) {
  const router = useRouter()
  const boundAction = upsertDailyTarget.bind(null, date)
  const [state, formAction] = useActionState(boundAction, initialState)

  useEffect(() => {
    if (state.success) router.push(`/food?date=${date}`)
  }, [state.success, date, router])

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          defaultValue={target?.calories ?? ""}
          id="calories"
          label="Calories"
          min="0"
          name="calories"
          placeholder="0"
          step="50"
          type="number"
          unit="kcal"
        />
        <Input
          defaultValue={target?.protein ?? ""}
          id="protein"
          label="Protein"
          min="0"
          name="protein"
          placeholder="0"
          step="1"
          type="number"
          unit="g"
        />
        <Input
          defaultValue={target?.fat ?? ""}
          id="fat"
          label="Fat"
          min="0"
          name="fat"
          placeholder="0"
          step="1"
          type="number"
          unit="g"
        />
        <Input
          defaultValue={target?.carbohydrates ?? ""}
          id="carbohydrates"
          label="Carbs"
          min="0"
          name="carbohydrates"
          placeholder="0"
          step="1"
          type="number"
          unit="g"
        />
      </div>

      {state.error && <p className="text-sm text-red-400">{state.error}</p>}

      <div className="flex justify-center">
        <SubmitButton pendingLabel="Saving…">Save targets</SubmitButton>
      </div>
    </form>
  )
}
