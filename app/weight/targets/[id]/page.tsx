import { ArrowLeft } from "lucide-react"
import { notFound } from "next/navigation"

import { ButtonLink } from "../../../components/ui/button"
import { getWeightTargetById } from "../../../food/queries"
import { TargetForm } from "../target-form"

type Props = { params: Promise<{ id: string }> }

export default async function EditTargetPage({ params }: Props) {
  const { id } = await params
  const target = await getWeightTargetById(id)
  if (!target) notFound()

  return (
    <main className="min-h-dvh">
      <header className="relative flex items-center border-b border-[#1a1a1a] px-4 py-3 md:px-6 md:py-5">
        <ButtonLink href="/weight" variant="secondary">
          <ArrowLeft size={14} /> Back
        </ButtonLink>
        <h1 className="absolute left-1/2 -translate-x-1/2">Edit target</h1>
      </header>

      <div className="mx-auto max-w-2xl px-6 py-8">
        <TargetForm target={target} />
      </div>
    </main>
  )
}
