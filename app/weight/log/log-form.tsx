"use client"

import { useRouter } from "nextjs-toploader/app"
import { useActionState, useEffect } from "react"

import type { WeightEntry } from "@/db/schema"

import { SubmitButton } from "../../components/submit-button"
import { Input } from "../../components/ui/input"
import { upsertWeightEntry } from "../actions"
import { today } from "../utils"

export function LogWeightForm({ entry }: { entry?: null | WeightEntry }) {
  const router = useRouter()
  const [state, action] = useActionState(upsertWeightEntry, { error: null, success: false })

  useEffect(() => {
    if (state.success) router.push("/weight")
  }, [state.success, router])

  return (
    <form action={action} className="flex flex-col gap-6">
      {entry && <input name="originalDate" type="hidden" value={entry.date} />}
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          defaultValue={entry?.date ?? today()}
          id="date"
          label="Date"
          name="date"
          type="date"
        />
        <Input
          defaultValue={entry?.weight ?? ""}
          id="weight"
          label="Weight"
          min="0"
          name="weight"
          placeholder="75.0"
          step="0.01"
          type="number"
          unit="kg"
        />
        <Input
          className="sm:col-span-2"
          defaultValue={entry?.note ?? ""}
          id="note"
          label="Note"
          name="note"
          placeholder="Optional"
          type="text"
        />
      </div>
      {state.error && <p className="text-sm text-red-400">{state.error}</p>}
      <div className="flex justify-center">
        <SubmitButton pendingLabel="Saving…">{entry ? "Save changes" : "Log weight"}</SubmitButton>
      </div>
    </form>
  )
}
