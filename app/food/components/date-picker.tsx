"use client"

import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"
import { createContext, useContext, useState } from "react"
import { type DayButtonProps, DayPicker, useDayPicker } from "react-day-picker"

import { useMobileNavClose } from "../../components/mobile-nav"
import { useNavContext } from "../../components/nav-provider"
import { Button } from "../../components/ui/button"
import { Float, FloatContent, FloatTrigger } from "../../components/ui/float"

type Props = {
  date: string
  today: string
}

export function DatePicker({ date, today }: Props) {
  const { navigate } = useNavContext()
  const [open, setOpen] = useState(false)

  const selectDate = (date: string) => {
    navigate(date === today ? "/food" : `/food?date=${date}`)
    setOpen(false)
  }

  const selected = parseLocalDate(date)

  return (
    <div className="flex items-center">
      <Button
        className="-mr-px z-20"
        iconOnly
        onClick={() => selectDate(shiftDate(date, -1))}
        size="md"
        variant="secondary"
      >
        <ArrowLeft size={15} />
      </Button>

      <Float onOpenChange={setOpen} open={open}>
        <FloatTrigger>
          <Button
            className="z-10 hover:z-40 w-24 font-normal md:w-30"
            size="md"
            variant="secondary"
          >
            <span className="md:hidden">
              {selected.toLocaleDateString("en-US", { day: "numeric", month: "short" })}
            </span>
            <span className="hidden md:inline">
              {selected.toLocaleDateString("en-US", {
                day: "numeric",
                month: "short",
                year: "numeric"
              })}
            </span>
          </Button>
        </FloatTrigger>
        <FloatContent align="center" estimatedWidth={250}>
          <div className="calendar" style={{ width: 250 }}>
            <DayPicker
              classNames={{
                day: "p-0 border-0",
                footer: "hidden",
                month_grid: "w-full table-fixed border-0",
                root: "w-full select-none p-3",
                week: "border-0",
                weekday: "!px-0 py-1 text-center text-[11px] uppercase tracking-wide text-[#555]",
                weekdays: "mb-1 border-0",
                weeks: "border-0 [&>tr:first-child>td]:pt-3"
              }}
              components={{
                DayButton: ({ modifiers, ...props }: DayButtonProps) => (
                  <button
                    {...props}
                    className={[
                      "m-0 flex h-7 w-full cursor-pointer appearance-none items-center justify-center border-0 p-0 text-[13px]",
                      modifiers.selected
                        ? "bg-[#ededed] hover:bg-[#e5e5e5] text-black"
                        : modifiers.outside
                          ? "text-[#333]"
                          : modifiers.today
                            ? "bg-[#222] hover:bg-[#2a2a2a]"
                            : "hover:bg-[#111]"
                    ].join(" ")}
                  />
                ),
                MonthCaption: CalendarCaption,
                Nav: () => <></>
              }}
              defaultMonth={selected}
              mode="single"
              onSelect={(date) => date && selectDate(toISODate(date))}
              selected={selected}
            />
          </div>
        </FloatContent>
      </Float>

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
        <Button
          className="ml-3 hidden md:inline-flex"
          onClick={() => selectDate(today)}
          size="md"
          variant="secondary"
        >
          Today
        </Button>
      )}
    </div>
  )
}

const SidebarCalendarCloseContext = createContext<() => void>(() => {})

export function SidebarDatePicker({ date, today }: Props) {
  const { navigate } = useNavContext()
  const closeNav = useMobileNavClose()
  const selected = parseLocalDate(date)
  const [month, setMonth] = useState(selected)
  const [calOpen, setCalOpen] = useState(false)

  const selectDate = (d: string) => {
    setMonth(parseLocalDate(d))
    closeNav()
    navigate(d === today ? "/food" : `/food?date=${d}`)
  }

  return (
    <SidebarCalendarCloseContext.Provider value={() => setCalOpen(false)}>
      <div className="border-b border-[#1a1a1a]">
        <div
          className={`grid transition-[grid-template-rows] duration-200 ${calOpen ? "grid-rows-[0fr]" : "grid-rows-[1fr]"}`}
        >
          <div className="overflow-hidden">
            <div className="flex items-center px-3 pt-3 pb-2">
              <Button
                className="-mr-px z-20"
                iconOnly
                onClick={() => selectDate(shiftDate(date, -1))}
                size="md"
                variant="secondary"
              >
                <ArrowLeft size={14} />
              </Button>
              <Button
                className="z-10 flex-1 font-normal hover:z-20"
                onClick={() => setCalOpen(true)}
                size="md"
                variant="secondary"
              >
                {selected.toLocaleDateString("en-US", {
                  day: "numeric",
                  month: "short",
                  year: "numeric"
                })}
              </Button>
              <Button
                className="-ml-px z-20"
                iconOnly
                onClick={() => selectDate(shiftDate(date, 1))}
                size="md"
                variant="secondary"
              >
                <ArrowRight size={14} />
              </Button>
            </div>
            {date !== today && (
              <div className="px-3 pb-2">
                <Button
                  className="w-full"
                  onClick={() => selectDate(today)}
                  size="sm"
                  variant="secondary"
                >
                  Today
                </Button>
              </div>
            )}
          </div>
        </div>
        <div
          className={`grid transition-[grid-template-rows] duration-200 ${calOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
        >
          <div className="overflow-hidden">
            <div className="calendar">
              <DayPicker
                classNames={{
                  day: "p-0 border-0",
                  footer: "hidden",
                  month_grid: "w-full table-fixed border-0",
                  root: "w-full select-none px-3 pb-3 pt-3",
                  week: "border-0",
                  weekday: "!px-0 py-1 text-center text-[11px] uppercase tracking-wide text-[#555]",
                  weekdays: "mb-1 border-0",
                  weeks: "border-0 [&>tr:first-child>td]:pt-3"
                }}
                components={{
                  DayButton: ({ modifiers, ...props }: DayButtonProps) => (
                    <button
                      {...props}
                      className={[
                        "m-0 flex h-7 w-full cursor-pointer appearance-none items-center justify-center border-0 p-0 text-[13px]",
                        modifiers.selected
                          ? "bg-[#ededed] hover:bg-[#e5e5e5] text-black"
                          : modifiers.outside
                            ? "text-[#333]"
                            : modifiers.today
                              ? "bg-[#222] hover:bg-[#2a2a2a]"
                              : "hover:bg-[#111]"
                      ].join(" ")}
                    />
                  ),
                  MonthCaption: SidebarCalendarCaption,
                  Nav: () => <></>
                }}
                mode="single"
                month={month}
                onMonthChange={setMonth}
                onSelect={(d) => d && selectDate(toISODate(d))}
                selected={selected}
              />
            </div>
          </div>
        </div>
      </div>
    </SidebarCalendarCloseContext.Provider>
  )
}

function CalendarCaption({ calendarMonth }: { calendarMonth: { date: Date } }) {
  const { goToMonth, nextMonth, previousMonth } = useDayPicker()
  return (
    <div className="mb-2 flex items-center justify-between">
      <button
        className="flex h-6 w-6 cursor-pointer items-center justify-center text-[#888] hover:bg-[#111] hover:text-[#ededed] disabled:opacity-30"
        disabled={!previousMonth}
        onClick={() => previousMonth && goToMonth(previousMonth)}
        type="button"
      >
        <ChevronLeft size={14} />
      </button>
      <span className="text-[14px] font-medium">
        {calendarMonth.date.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
      </span>
      <button
        className="flex h-6 w-6 cursor-pointer items-center justify-center text-[#888] hover:bg-[#111] hover:text-[#ededed] disabled:opacity-30"
        disabled={!nextMonth}
        onClick={() => nextMonth && goToMonth(nextMonth)}
        type="button"
      >
        <ChevronRight size={14} />
      </button>
    </div>
  )
}

function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number)
  return new Date(y, m - 1, d)
}

function shiftDate(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split("-").map(Number)
  return toISODate(new Date(y, m - 1, d + days))
}

function SidebarCalendarCaption({ calendarMonth }: { calendarMonth: { date: Date } }) {
  const close = useContext(SidebarCalendarCloseContext)
  const { goToMonth, nextMonth, previousMonth } = useDayPicker()
  return (
    <div className="mb-2 flex items-center justify-between">
      <button
        className="flex h-6 w-6 cursor-pointer items-center justify-center text-[#888] hover:bg-[#111] hover:text-[#ededed] disabled:opacity-30"
        disabled={!previousMonth}
        onClick={() => previousMonth && goToMonth(previousMonth)}
        type="button"
      >
        <ChevronLeft size={14} />
      </button>
      <button
        className="text-[14px] font-medium transition-colors duration-100 hover:text-white"
        onClick={close}
        type="button"
      >
        {calendarMonth.date.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
      </button>
      <button
        className="flex h-6 w-6 cursor-pointer items-center justify-center text-[#888] hover:bg-[#111] hover:text-[#ededed] disabled:opacity-30"
        disabled={!nextMonth}
        onClick={() => nextMonth && goToMonth(nextMonth)}
        type="button"
      >
        <ChevronRight size={14} />
      </button>
    </div>
  )
}

function toISODate(date: Date): string {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0")
  ].join("-")
}
