import { ArrowLeft } from "lucide-react"

import type { DayMacros } from "./history-client"

import { ButtonLink } from "../../components/ui/button"
import { getRecentDayPlans } from "../queries"
import { HistoryWrapper } from "./history-wrapper"

export const dynamic = "force-dynamic"

export default async function HistoryPage() {
  const today = new Date().toISOString().split("T")[0]
  const plans = await getRecentDayPlans(today, 90)

  const data: DayMacros[] = plans.map((p) => ({
    consumed: p.items.reduce(
      (acc, item) => {
        const ratio = item.food.baseAmount > 0 ? item.amount / item.food.baseAmount : 0
        return {
          calories: acc.calories + ratio * item.food.calories,
          carbohydrates: acc.carbohydrates + ratio * item.food.carbohydrates,
          fat: acc.fat + ratio * item.food.fat,
          protein: acc.protein + ratio * item.food.protein
        }
      },
      { calories: 0, carbohydrates: 0, fat: 0, protein: 0 }
    ),
    date: p.date,
    note: p.note,
    target: p.target
      ? {
          calories: p.target.calories,
          carbohydrates: p.target.carbohydrates,
          fat: p.target.fat,
          protein: p.target.protein
        }
      : null
  }))

  return (
    <main className="min-h-dvh">
      <header className="relative flex items-center border-b border-[#1a1a1a] px-4 py-3 md:px-6 md:py-5">
        <ButtonLink href="/food" variant="secondary">
          <ArrowLeft size={14} /> Back
        </ButtonLink>
        <div className="absolute left-1/2 -translate-x-1/2 text-center">
          <h1>History</h1>
        </div>
      </header>

      <HistoryWrapper data={data} />
    </main>
  )
}
