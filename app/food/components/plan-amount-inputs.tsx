"use client"

import { Check } from "lucide-react"
import { useOptimistic, useTransition } from "react"

import { Button } from "../../components/ui/button"
import { FormattedNumberInput } from "../../components/ui/formatted-number-input"
import { markFullyConsumed, setConsumedAmount, setPlannedAmount } from "../actions"

type Props = {
  amount: number
  consumedAmount: number
  itemId: string
  unit: string
}

export function PlanAmountInputs({ amount, consumedAmount, itemId, unit }: Props) {
  const [, startPlannedTransition] = useTransition()
  const [optimisticAmount, setOptimisticAmount] = useOptimistic(amount)

  const [, startConsumedTransition] = useTransition()
  const [optimisticConsumed, setOptimisticConsumed] = useOptimistic(consumedAmount)

  const done = optimisticConsumed >= optimisticAmount
  const displayUnit = unit !== "unit" ? unit : undefined

  return (
    <div className="flex items-center gap-2">
      <FormattedNumberInput
        className="w-16"
        inputMode="decimal"
        min="1"
        onCommit={(value) => {
          if (value <= 0) return
          startPlannedTransition(async () => {
            setOptimisticAmount(value)
            await setPlannedAmount(itemId, value)
          })
        }}
        unit={displayUnit}
        value={optimisticAmount}
      />
      <FormattedNumberInput
        className="w-16"
        inputMode="decimal"
        max={optimisticAmount}
        min="0"
        onCommit={(value) => {
          if (value < 0) return
          const clamped = Math.min(value, optimisticAmount)
          startConsumedTransition(async () => {
            setOptimisticConsumed(clamped)
            await setConsumedAmount(itemId, optimisticAmount, value)
          })
        }}
        unit={displayUnit}
        value={optimisticConsumed}
      />
      <form action={markFullyConsumed.bind(null, itemId, optimisticAmount)}>
        <Button className="disabled:opacity-[1]" disabled={done} iconOnly type="submit">
          <Check size={14} />
        </Button>
      </form>
    </div>
  )
}
