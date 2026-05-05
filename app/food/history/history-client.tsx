"use client"

import type { ChartDataset, TooltipItem } from "chart.js"

import {
  Chart as ChartJS,
  Filler,
  LinearScale,
  LineElement,
  PointElement,
  TimeScale,
  Tooltip
} from "chart.js"
import "chartjs-adapter-date-fns"
import ZoomPlugin from "chartjs-plugin-zoom"
import { useRouter } from "nextjs-toploader/app"
import { useCallback, useMemo, useRef, useState } from "react"
import { Line } from "react-chartjs-2"

import {
  darkThemeScales,
  darkTooltip,
  formatTickValue,
  timeXScale,
  zoomPanPlugin
} from "../../components/chart-config"
import { ChartControls } from "../../components/chart-controls"
import { Button } from "../../components/ui/button"

ChartJS.register(TimeScale, LinearScale, PointElement, LineElement, Tooltip, Filler, ZoomPlugin)

export type DayMacros = {
  consumed: { calories: number; carbohydrates: number; fat: number; protein: number }
  date: string
  note: null | string
  target: null | { calories: number; carbohydrates: number; fat: number; protein: number }
}

const CHART_COLOR = "rgba(255,176,107,1)"

const MACROS = [
  { key: "calories", label: "Calories", unit: "kcal" },
  { key: "protein", label: "Protein", unit: "g" },
  { key: "fat", label: "Fat", unit: "g" },
  { key: "carbohydrates", label: "Carbs", unit: "g" }
] as const

type MacroChartProps = {
  align?: "left" | "right"
  className?: string
  datasets: ChartDataset<"line">[]
  label: string
  onTooltipFooter: (items: TooltipItem<"line">[]) => string[]
  unit: string
  yMax: number | undefined
  yMin: number | undefined
}

type MacroKey = (typeof MACROS)[number]["key"]

type Props = { data: DayMacros[] }

export function HistoryClient({ data }: Props) {
  const [range, setRange] = useState<null | number>(30)
  const [showTarget, setShowTarget] = useState(true)

  const lastDate = useMemo(
    () => data[data.length - 1]?.date ?? new Date().toISOString().split("T")[0],
    [data]
  )

  const sliced = useMemo(() => {
    if (range === null) return data
    const cutoff = new Date(`${lastDate}T12:00:00`)
    cutoff.setDate(cutoff.getDate() - range + 1)
    const cutoffStr = cutoff.toISOString().split("T")[0]
    return data.filter((d) => d.date >= cutoffStr)
  }, [data, range, lastDate])

  const handleTooltipFooter = useCallback(
    (items: TooltipItem<"line">[]) => {
      const raw = items[0]?.raw as undefined | { x?: string }
      if (!raw?.x) return []
      const day = sliced.find((d) => d.date === raw.x)
      return day?.note ? [`${day.note}`] : []
    },
    [sliced]
  )

  if (data.length === 0) {
    return <div className="px-6 py-16 text-center text-sm text-[#555]">No data yet.</div>
  }

  const pointRadius = sliced.length <= 14 ? 3 : 2

  return (
    <>
      <div className="flex items-center border-b border-[#1a1a1a]">
        <div className="mx-auto w-full max-w-440 px-6 py-3">
          <ChartControls
            onRangeChange={setRange}
            onShowTargetChange={setShowTarget}
            range={range}
            showTarget={showTarget}
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2">
        {MACROS.map(({ key, label, unit }, i) => {
          const consumed = sliced.map((d) => ({
            x: d.date,
            y: Math.round(d.consumed[key as MacroKey] * 10) / 10
          }))
          const targets = showTarget
            ? sliced.map((d) => ({ x: d.date, y: d.target ? d.target[key as MacroKey] : null }))
            : []
          const { max, min } = yRange([
            ...sliced.map((d) => d.consumed[key as MacroKey]),
            ...(showTarget ? sliced.map((d) => d.target?.[key as MacroKey] ?? null) : [])
          ])

          const datasets = [
            {
              backgroundColor: "rgba(255,176,107,0.06)",
              borderColor: CHART_COLOR,
              borderWidth: 1.5,
              data: consumed,
              fill: true,
              label: "Consumed",
              pointBackgroundColor: CHART_COLOR,
              pointBorderColor: CHART_COLOR,
              pointHoverRadius: 5,
              pointRadius: sliced.map((d) => (d.note ? pointRadius + 2 : pointRadius)),
              tension: 0.3
            },
            ...(showTarget
              ? [
                  {
                    backgroundColor: "transparent",
                    borderColor: "rgba(255,176,107,0.3)",
                    borderDash: [5, 4],
                    borderWidth: 1,
                    data: targets,
                    label: "Target",
                    pointHoverRadius: 0,
                    pointRadius: 0,
                    tension: 0
                  }
                ]
              : [])
          ]

          const cls = ["border-b border-[#1a1a1a]", i % 2 === 0 && "sm:border-r"]
            .filter(Boolean)
            .join(" ")

          return (
            <MacroChart
              align={i % 2 === 0 ? "right" : "left"}
              className={cls}
              datasets={datasets as unknown as ChartDataset<"line">[]}
              key={key}
              label={label}
              onTooltipFooter={handleTooltipFooter}
              unit={unit}
              yMax={max}
              yMin={min}
            />
          )
        })}
      </div>
    </>
  )
}

function formatDateLong(dateStr: string) {
  return new Date(`${dateStr}T12:00:00`).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    weekday: "long"
  })
}

function MacroChart({
  align = "left",
  className,
  datasets,
  label,
  onTooltipFooter,
  unit,
  yMax,
  yMin
}: MacroChartProps) {
  const chartRef = useRef<ChartJS<"line">>(null)
  const resetBtnRef = useRef<HTMLButtonElement>(null)
  const router = useRouter()
  const chartData = useMemo(() => ({ datasets }), [datasets])

  const options = useMemo(
    () => ({
      animation: false as const,
      interaction: { intersect: false, mode: "index" as const },
      maintainAspectRatio: false,
      onClick: (_: unknown, elements: { index: number }[]) => {
        if (!elements.length) return
        const point = chartRef.current?.data.datasets[0]?.data[elements[0].index] as
          | undefined
          | { x?: string }
        if (point?.x) router.push(`/food?date=${point.x}`)
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          ...darkTooltip,
          callbacks: {
            footer: onTooltipFooter,
            label: (item: TooltipItem<"line">) => {
              const v = (item.raw as { y?: number })?.y
              if (v == null) return
              const prefix = item.dataset.label === "Target" ? "Target" : "Consumed"
              return `  ${prefix}: ${v} ${unit}`
            },
            labelColor: (item: TooltipItem<"line">) => {
              const c = item.dataset.label === "Target" ? "rgba(255,176,107,0.3)" : CHART_COLOR
              return { backgroundColor: c, borderColor: c }
            },
            title: (items: TooltipItem<"line">[]) => {
              const raw = items[0]?.raw as undefined | { x?: string }
              return raw?.x ? formatDateLong(raw.x) : ""
            }
          },
          footerColor: "#999",
          maxWidth: 220
        },
        zoom: {
          ...zoomPanPlugin,
          limits: { x: { max: "original" as const, min: "original" as const, minRange: 2 } },
          pan: {
            ...zoomPanPlugin.pan,
            onPanComplete: () => resetBtnRef.current?.classList.remove("invisible")
          },
          zoom: {
            ...zoomPanPlugin.zoom,
            onZoomComplete: () => resetBtnRef.current?.classList.remove("invisible")
          }
        }
      },
      responsive: true,
      scales: {
        x: timeXScale,
        y: {
          ...darkThemeScales,
          max: yMax,
          min: yMin,
          ticks: {
            ...darkThemeScales.ticks,
            callback: (v: number | string) => formatTickValue(v),
            maxTicksLimit: 8
          }
        }
      }
    }),
    [onTooltipFooter, yMin, yMax, unit, router]
  )

  return (
    <div className={className}>
      <div className={`max-w-220 ${align === "right" ? "ml-auto" : "mr-auto"}`}>
        <div className="flex items-center justify-between px-6 pb-2 pt-4">
          <p className="text-[12px] font-semibold uppercase tracking-wider text-[#888]">{label}</p>
          <Button
            className="invisible"
            onClick={() => {
              chartRef.current?.resetZoom()
              resetBtnRef.current?.classList.add("invisible")
            }}
            ref={resetBtnRef}
            size="sm"
            variant="secondary"
          >
            Reset zoom
          </Button>
        </div>
        <div className="h-72 px-6 pb-6">
          <Line data={chartData} options={options} ref={chartRef} />
        </div>
      </div>
    </div>
  )
}

function yRange(values: (null | number)[]) {
  const nums = values.filter((v): v is number => v != null && !isNaN(v))
  if (nums.length === 0) return { max: undefined, min: undefined }
  const lo = Math.min(...nums)
  const hi = Math.max(...nums)
  const spread = hi - lo || hi * 0.2 || 10
  const pad = spread * 0.12
  const step = Math.pow(10, Math.floor(Math.log10(spread / 3)))
  return {
    max: Math.ceil((hi + pad) / step) * step,
    min: Math.floor(Math.max(0, lo - pad) / step) * step
  }
}
