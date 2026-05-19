"use client"

import { useMemo } from "react"

import type { DailyTarget } from "@/db/schema"

import { formatNumber } from "../utils"
import { usePlan } from "./plan-provider"

type Props = {
  target: DailyTarget | undefined
}

export function MacroBar({ target }: Props) {
  const { amounts, baseItems, pendingItems, removedIds } = usePlan()

  const allItems = useMemo(
    () => [...baseItems.filter((i) => !removedIds.has(i.id)), ...pendingItems],
    [baseItems, removedIds, pendingItems]
  )

  const totals = useMemo(
    () =>
      allItems.reduce(
        (acc, item) => {
          const override = amounts[item.id]
          const amount = override?.amount ?? item.amount
          const ratio = item.food.baseAmount > 0 ? amount / item.food.baseAmount : 0
          return {
            calories: acc.calories + ratio * item.food.calories,
            carbohydrates: acc.carbohydrates + ratio * item.food.carbohydrates,
            fat: acc.fat + ratio * item.food.fat,
            protein: acc.protein + ratio * item.food.protein
          }
        },
        { calories: 0, carbohydrates: 0, fat: 0, protein: 0 }
      ),
    [allItems, amounts]
  )

  const macros = [
    { label: "Calories", target: target?.calories, value: totals.calories },
    { label: "Protein", target: target?.protein, value: totals.protein },
    { label: "Fat", target: target?.fat, value: totals.fat },
    { label: "Carbs", target: target?.carbohydrates, value: totals.carbohydrates }
  ]

  return (
    <dl className="grid grid-cols-2 md:grid-cols-4 *:border-[#1a1a1a] [&>*:nth-child(odd)]:border-r [&>*:nth-child(-n+2)]:border-b md:[&>*:nth-child(odd)]:border-r-0 md:[&>*:nth-child(-n+2)]:border-b-0 md:divide-x md:divide-[#1a1a1a]">
      {macros.map(({ label, target: t, value }) => {
        const percentage = t != null && t > 0 ? Math.min((value / t) * 100, 100) : null

        return (
          <div className="flex flex-col px-4 py-3 md:justify-between md:px-7 md:py-6" key={label}>
            <dt className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#888] md:mb-4 md:text-[12px]">
              {label}
            </dt>
            <dd>
              <div className="flex items-baseline justify-between gap-2 whitespace-nowrap md:items-end">
                <div className="flex items-baseline gap-1.5 md:block md:gap-0">
                  <span className="text-[22px] font-semibold leading-none tracking-tight md:text-[35px]">
                    {formatNumber(value)}
                  </span>
                  {t != null && t > 0 && (
                    <span className="text-[13px] font-medium text-[#888] md:ml-2 md:text-xl">
                      / {formatNumber(t)}
                    </span>
                  )}
                </div>
                {percentage !== null && (
                  <span className="shrink-0 text-[13px] font-semibold md:text-xl">
                    {Math.round(percentage)}%
                  </span>
                )}
              </div>
              {percentage !== null && (
                <div className="mt-2 h-px w-full bg-[#1a1a1a] md:mt-4 md:h-0.5">
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
