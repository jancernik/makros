import { ArrowLeft } from "lucide-react"
import { notFound } from "next/navigation"

import { requireUserIdOrRedirect } from "../../../auth/lib"
import { ButtonLink } from "../../../components/ui/button"
import { FoodForm } from "../../components/food-form"
import { getFoodById } from "../../queries"
import { foodPath } from "../../utils"

type Props = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ date?: string }>
}

export default async function EditFoodPage({ params, searchParams }: Props) {
  const userId = await requireUserIdOrRedirect()
  const { id } = await params
  const { date } = await searchParams
  const food = await getFoodById(userId, id)

  if (!food) notFound()

  const returnTo = foodPath(date)

  return (
    <main className="min-h-dvh">
      <header className="relative flex items-center border-b border-[#1a1a1a] px-4 py-3 md:px-6 md:py-5">
        <ButtonLink href={returnTo} variant="secondary">
          <ArrowLeft size={14} /> Back
        </ButtonLink>
        <h1 className="absolute left-1/2 -translate-x-1/2">Edit food</h1>
      </header>

      <div className="mx-auto max-w-2xl px-6 py-8">
        <FoodForm food={food} returnTo={returnTo} />
      </div>
    </main>
  )
}
