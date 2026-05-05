"use client"

import { useRouter } from "nextjs-toploader/app"
import { useActionState, useEffect, useState } from "react"

import type { WeightTarget } from "@/db/schema"

import { SubmitButton } from "../../components/submit-button"
import { Input } from "../../components/ui/input"
import { Toggle } from "../../components/ui/toggle"
import { saveWeightTarget } from "../actions"
import { today } from "../utils"

export function TargetForm({ target }: { target?: null | WeightTarget }) {
  const router = useRouter()
  const [type, setType] = useState<"fixed" | "rate">(target?.type ?? "rate")
  const [state, action] = useActionState(saveWeightTarget, { error: null, success: false })

  useEffect(() => {
    if (state.success) router.push("/weight")
  }, [state.success, router])

  return (
    <form action={action} className="flex flex-col gap-6">
      {target && <input name="id" type="hidden" value={target.id} />}
      <input name="type" type="hidden" value={type} />

      <div className="flex gap-1">
        <Toggle onPressedChange={() => setType("rate")} pressed={type === "rate"}>
          Rate target
        </Toggle>
        <Toggle onPressedChange={() => setType("fixed")} pressed={type === "fixed"}>
          Fixed target
        </Toggle>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          defaultValue={target?.startDate ?? today()}
          id="startDate"
          label="Start date"
          name="startDate"
          type="date"
        />
        <Input
          defaultValue={target?.endDate ?? ""}
          id="endDate"
          label="End date"
          name="endDate"
          type="date"
        />
      </div>

      {type === "rate" && (
        <div className="grid gap-4 sm:grid-cols-3">
          <Input
            defaultValue={target?.startWeight ?? ""}
            id="startWeight"
            label="Start weight"
            min="0"
            name="startWeight"
            placeholder="75.0"
            step="0.01"
            type="number"
            unit="kg"
          />
          <Input
            defaultValue={target?.minTargetRate ?? 0.25}
            id="minTargetRate"
            label="Min rate"
            min="0"
            name="minTargetRate"
            step="0.05"
            type="number"
            unit="kg/wk"
          />
          <Input
            defaultValue={target?.maxTargetRate ?? 0.5}
            id="maxTargetRate"
            label="Max rate"
            min="0"
            name="maxTargetRate"
            step="0.05"
            type="number"
            unit="kg/wk"
          />
        </div>
      )}

      {type === "fixed" && (
        <Input
          defaultValue={target?.targetWeight ?? ""}
          id="targetWeight"
          label="Target weight"
          min="0"
          name="targetWeight"
          placeholder="80.0"
          step="0.01"
          type="number"
          unit="kg"
        />
      )}

      {state.error && <p className="text-sm text-red-400">{state.error}</p>}

      <div className="flex justify-center">
        <SubmitButton pendingLabel="Saving…">{target ? "Save changes" : "Add target"}</SubmitButton>
      </div>
    </form>
  )
}
