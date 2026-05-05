import { ArrowLeft } from "lucide-react"
import { notFound } from "next/navigation"

import { ButtonLink } from "../../../components/ui/button"
import { getWeightEntryByDate } from "../../../food/queries"
import { LogWeightForm } from "../log-form"

type Props = { params: Promise<{ date: string }> }

export default async function EditLogPage({ params }: Props) {
  const { date } = await params
  const entry = await getWeightEntryByDate(date)
  if (!entry) notFound()

  return (
    <main className="min-h-dvh">
      <header className="relative flex items-center border-b border-[#1a1a1a] px-6 py-5">
        <ButtonLink href="/weight" variant="secondary">
          <ArrowLeft size={14} /> Back
        </ButtonLink>
        <h1 className="absolute left-1/2 -translate-x-1/2">Edit log</h1>
      </header>

      <div className="mx-auto max-w-2xl px-6 py-8">
        <LogWeightForm entry={entry} />
      </div>
    </main>
  )
}
