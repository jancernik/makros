import { ArrowLeft } from "lucide-react"

import { ButtonLink } from "../../components/ui/button"
import { getDayPlanByDate } from "../queries"
import { SetNoteForm } from "./set-note-form"

type Props = {
  searchParams: Promise<{ date?: string }>
}

export default async function NotePage({ searchParams }: Props) {
  const { date } = await searchParams
  const today = new Date().toISOString().split("T")[0]
  const selectedDate = date ?? today

  const plan = await getDayPlanByDate(selectedDate)
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(new Date(`${selectedDate}T12:00:00`))

  return (
    <main className="min-h-dvh">
      <header className="relative flex items-center border-b border-[#1a1a1a] px-6 py-5">
        <ButtonLink href={`/food?date=${selectedDate}`} variant="secondary">
          <ArrowLeft size={14} /> Back
        </ButtonLink>
        <div className="absolute left-1/2 -translate-x-1/2 text-center">
          <h1>Day note</h1>
          <p className="text-sm text-[#555]">{formattedDate}</p>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-6 py-8">
        <SetNoteForm date={selectedDate} note={plan?.note} />
      </div>
    </main>
  )
}
