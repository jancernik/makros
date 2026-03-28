import { ArrowLeft } from "lucide-react"
import { notFound } from "next/navigation"

import { ButtonLink } from "../../../components/ui/button"
import { FoodForm } from "../../components/food-form"
import { getFoodById } from "../../queries"

type Props = {
  params: Promise<{ id: string }>
}

export default async function EditFoodPage({ params }: Props) {
  const { id } = await params
  const food = await getFoodById(id)

  if (!food) notFound()

  return (
    <main className="min-h-dvh">
      <header className="relative flex items-center border-b border-[#1a1a1a] px-6 py-5">
        <ButtonLink href="/food" variant="secondary">
          <ArrowLeft size={14} /> Back
        </ButtonLink>
        <h1 className="absolute left-1/2 -translate-x-1/2">Edit food</h1>
      </header>

      <div className="mx-auto max-w-2xl px-6 py-8">
        <FoodForm food={food} />
      </div>
    </main>
  )
}
