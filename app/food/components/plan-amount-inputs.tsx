"use client"

import { Check } from "lucide-react"

import { Button } from "../../components/ui/button"
import { FormattedNumberInput } from "../../components/ui/formatted-number-input"
import { markFullyConsumed, setConsumedAmount, setPlannedAmount } from "../actions"
import { usePlan } from "./plan-provider"

type Props = {
  amount: number
  consumedAmount: number
  itemId: string
  unit: string
}

export function PlanAmountInputs({ amount, consumedAmount, itemId, unit }: Props) {
  const { trackSave, updateAmounts } = usePlan()
  const displayUnit = unit !== "unit" ? unit : undefined
  const isPending = itemId.startsWith("pending-")

  const done = consumedAmount >= amount

  return (
    <div className="flex items-center gap-2">
      <FormattedNumberInput
        className="w-16"
        inputMode="decimal"
        min="1"
        onCommit={(value) => {
          if (value <= 0) return
          updateAmounts(itemId, value, Math.min(consumedAmount, value))
          if (!isPending) trackSave(() => setPlannedAmount(itemId, value))
        }}
        unit={displayUnit}
        value={amount}
      />
      <FormattedNumberInput
        className="w-16"
        inputMode="decimal"
        max={amount}
        min="0"
        onCommit={(value) => {
          if (value < 0) return
          const clamped = Math.min(value, amount)
          updateAmounts(itemId, amount, clamped)
          if (!isPending) trackSave(() => setConsumedAmount(itemId, amount, value))
        }}
        unit={displayUnit}
        value={consumedAmount}
      />
      <Button
        className="disabled:opacity-[1]"
        disabled={done}
        iconOnly
        onClick={() => {
          if (done) return
          updateAmounts(itemId, amount, amount)
          if (!isPending) trackSave(() => markFullyConsumed(itemId, amount))
        }}
        type="button"
      >
        <Check size={14} />
      </Button>
    </div>
  )
}
