"use client"

import { ArrowLeft, ArrowRight } from "lucide-react"

import { useNavContext } from "../../components/nav-provider"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"

type Props = {
  date: string
  today: string
}

export function DatePicker({ date, today }: Props) {
  const { navigate } = useNavContext()

  const selectDate = (date: string) => {
    navigate(date === today ? "/food" : `/food?date=${date}`)
  }

  return (
    <div className="grid grid-flow-col">
      <Button
        className="-mr-px z-20"
        iconOnly
        onClick={() => selectDate(shiftDate(date, -1))}
        size="md"
        variant="secondary"
      >
        <ArrowLeft size={15} />
      </Button>
      <Input
        className="text-[15px] w-32"
        onChange={(e) => selectDate(e.target.value)}
        size="md"
        type="date"
        value={date}
      />
      <Button
        className="-ml-px z-20"
        iconOnly
        onClick={() => selectDate(shiftDate(date, 1))}
        size="md"
        variant="secondary"
      >
        <ArrowRight size={15} />
      </Button>
      {date !== today && (
        <Button className="ml-3" onClick={() => selectDate(today)} size="md" variant="primary">
          Today
        </Button>
      )}
    </div>
  )
}

function shiftDate(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split("-").map(Number)
  const result = new Date(y, m - 1, d + days)
  return [
    result.getFullYear(),
    String(result.getMonth() + 1).padStart(2, "0"),
    String(result.getDate()).padStart(2, "0")
  ].join("-")
}
