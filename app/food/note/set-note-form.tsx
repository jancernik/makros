"use client"

import { useRouter } from "next/navigation"
import { useActionState, useEffect } from "react"

import { SubmitButton } from "../../components/submit-button"
import { Input } from "../../components/ui/input"
import { upsertDayPlanNote } from "../actions"

type Props = {
  date: string
  note: null | string | undefined
}

const initialState = { error: null, success: false }

export function SetNoteForm({ date, note }: Props) {
  const router = useRouter()
  const boundAction = upsertDayPlanNote.bind(null, date)
  const [state, formAction] = useActionState(boundAction, initialState)

  useEffect(() => {
    if (state.success) router.push(`/food?date=${date}`)
  }, [state.success, date, router])

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <Input
        defaultValue={note ?? ""}
        id="note"
        label="Note"
        maxLength={2000}
        multiline
        name="note"
        placeholder="Add a note for this day…"
        rows={8}
      />

      {state.error && <p className="text-sm text-red-400">{state.error}</p>}

      <div className="flex justify-center">
        <SubmitButton pendingLabel="Saving…">Save note</SubmitButton>
      </div>
    </form>
  )
}
