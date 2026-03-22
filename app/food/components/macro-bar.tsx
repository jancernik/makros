import type { DailyTarget } from "@/db/schema"

import type { getDayPlanByDate } from "../queries"

import { formatNumber } from "../utils"

type Props = {
  plan: Awaited<ReturnType<typeof getDayPlanByDate>>
  target: DailyTarget | undefined
}

export function MacroBar({ plan, target }: Props) {
  const items = plan?.items ?? []

  const totals = items.reduce(
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
  )

  const macros = [
    { label: "Calories", target: target?.calories, value: totals.calories },
    { label: "Protein", target: target?.protein, value: totals.protein },
    { label: "Fat", target: target?.fat, value: totals.fat },
    { label: "Carbs", target: target?.carbohydrates, value: totals.carbohydrates }
  ]

  return (
    <dl className="grid grid-cols-2 divide-x divide-y divide-[#1a1a1a] md:grid-cols-4 md:divide-y-0">
      {macros.map(({ label, target: t, value }) => {
        const percentage = t != null && t > 0 ? Math.min((value / t) * 100, 100) : null

        return (
          <div className="flex flex-col justify-between px-7 py-6" key={label}>
            <dt className="mb-4 text-[12px] font-semibold uppercase tracking-wider text-[#888]">
              {label}
            </dt>
            <dd>
              <div className="flex items-end justify-between gap-2">
                <div>
                  <span className="text-[35px] font-semibold leading-none tracking-tight">
                    {formatNumber(value)}
                  </span>
                  {t != null && t > 0 && (
                    <span className="shrink-0 ml-2 text-xl font-medium text-[#888]">
                      / {formatNumber(t)}
                    </span>
                  )}
                </div>
                {percentage !== null && (
                  <span className="shrink-0 text-xl font-semibold">{Math.round(percentage)}%</span>
                )}
              </div>
              {percentage !== null && (
                <div className="mt-4 h-0.5 w-full bg-[#1a1a1a]">
                  <div
                    className="h-full bg-[#ededed] transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              )}
            </dd>
          </div>
        )
      })}
    </dl>
  )
}
