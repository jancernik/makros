import { ArrowLeft } from "lucide-react"

import { ButtonLink } from "../../../components/ui/button"
import { TargetForm } from "../target-form"

export default function NewTargetPage() {
  return (
    <main className="min-h-dvh">
      <header className="relative flex items-center border-b border-[#1a1a1a] px-6 py-5">
        <ButtonLink href="/weight" variant="secondary">
          <ArrowLeft size={14} /> Back
        </ButtonLink>
        <h1 className="absolute left-1/2 -translate-x-1/2">New target</h1>
      </header>

      <div className="mx-auto max-w-2xl px-6 py-8">
        <TargetForm />
      </div>
    </main>
  )
}
