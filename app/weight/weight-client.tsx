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
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { useEffect, useMemo, useRef, useState, useTransition } from "react"
import { Line } from "react-chartjs-2"

import type { WeightEntry, WeightTarget } from "@/db/schema"

import {
  darkThemeScales,
  darkTooltip,
  formatTickValue,
  timeXScale,
  zoomPanPlugin
} from "../components/chart-config"
import { ChartControls } from "../components/chart-controls"
import { Button } from "../components/ui/button"
import { Float, FloatContent, FloatItem, FloatLink, FloatTrigger } from "../components/ui/float"
import { ResizablePanels } from "../food/components/resizable-panels"
import { deleteWeightEntryByDate, deleteWeightTargetById } from "./actions"
import { today } from "./utils"

ChartJS.register(TimeScale, LinearScale, PointElement, LineElement, Tooltip, Filler, ZoomPlugin)

export type WeightClientProps = {
  defaultLeftPct?: number
  entries: WeightEntry[]
  targets: WeightTarget[]
}

export function WeightClient({ defaultLeftPct = 50, entries, targets }: WeightClientProps) {
  const chartRef = useRef<ChartJS<"line">>(null)
  const resetBtnRef = useRef<HTMLButtonElement>(null)
  const [range, setRange] = useState<null | number>(30)
  const [showTarget, setShowTarget] = useState(true)
  const [highlightedDate, setHighlightedDate] = useState<null | string>(null)

  const todayStr = today()

  const sliced = useMemo(() => {
    if (range === null) return entries
    const cutoff = new Date(`${todayStr}T12:00:00`)
    cutoff.setDate(cutoff.getDate() - range + 1)
    const cutoffStr = cutoff.toISOString().split("T")[0]
    return entries.filter((e) => e.date >= cutoffStr)
  }, [entries, range, todayStr])

  const rangeStart = useMemo(() => {
    if (range === null) return entries[0]?.date ?? todayStr
    const d = new Date(`${todayStr}T12:00:00`)
    d.setDate(d.getDate() - range + 1)
    return d.toISOString().split("T")[0]
  }, [entries, range, todayStr])

  const targetDatasets = useMemo(() => {
    if (!showTarget) return []
    const datasets: object[] = []

    for (const t of targets) {
      const bandStart = t.startDate
        ? t.startDate > rangeStart
          ? t.startDate
          : rangeStart
        : rangeStart
      const bandEnd = t.endDate ? (t.endDate < todayStr ? t.endDate : todayStr) : todayStr

      if (bandStart > bandEnd) continue

      if (t.type === "rate" && t.startDate && t.startWeight != null) {
        const minRate = t.minTargetRate ?? 0.25
        const maxRate = t.maxTargetRate ?? 0.5
        const dates = dailyDates(bandStart, bandEnd)
        datasets.push(
          {
            backgroundColor: "rgba(255,255,255,0.05)",
            borderColor: "rgba(255,255,255,0.18)",
            borderDash: [4, 4],
            borderWidth: 1,
            data: dates.map((d) => ({
              x: d,
              y: projectRate(d, t.startDate!, t.startWeight!, maxRate)
            })),
            fill: "+1" as const,
            label: "Upper target",
            pointHitRadius: 0,
            pointHoverRadius: 0,
            pointRadius: 0,
            tension: 0
          },
          {
            backgroundColor: "transparent",
            borderColor: "rgba(255,255,255,0.18)",
            borderDash: [4, 4],
            borderWidth: 1,
            data: dates.map((d) => ({
              x: d,
              y: projectRate(d, t.startDate!, t.startWeight!, minRate)
            })),
            fill: false as const,
            label: "Lower target",
            pointHitRadius: 0,
            pointHoverRadius: 0,
            pointRadius: 0,
            tension: 0
          }
        )
      } else if (t.type === "fixed" && t.targetWeight != null) {
        datasets.push({
          backgroundColor: "transparent",
          borderColor: "rgba(255,255,255,0.3)",
          borderDash: [5, 4],
          borderWidth: 1,
          data: dailyDates(bandStart, bandEnd).map((d) => ({ x: d, y: t.targetWeight! })),
          fill: false as const,
          label: "Target",
          pointHitRadius: 0,
          pointHoverRadius: 0,
          pointRadius: 0,
          tension: 0
        })
      }
    }

    return datasets
  }, [showTarget, targets, rangeStart, todayStr])

  const basePointRadius = sliced.length <= 14 ? 3 : 2

  const entryByDate = useMemo(() => new Map(sliced.map((e) => [e.date, e])), [sliced])

  const allDatesInRange = useMemo(() => dailyDates(rangeStart, todayStr), [rangeStart, todayStr])

  const weightDataset = useMemo(
    () => ({
      borderColor: "rgba(255,176,107,1)",
      borderWidth: 1.5,
      data: allDatesInRange.map((d) => ({ x: d, y: entryByDate.get(d)?.weight ?? null })),
      fill: false as const,
      label: "Weight",
      pointBackgroundColor: "rgba(255,176,107,1)",
      pointBorderColor: "rgba(255,176,107,1)",
      pointHoverRadius: 5,
      pointRadius: allDatesInRange.map((d) => {
        const e = entryByDate.get(d)
        if (!e) return 0
        return e.note ? basePointRadius + 2 : basePointRadius
      }),
      spanGaps: true,
      tension: 0.3
    }),
    [allDatesInRange, entryByDate, basePointRadius]
  )

  const trendDataset = useMemo(() => {
    const fn = linearRegression(entries)
    if (!fn || entries.length < 2) return null
    const first = rangeStart
    const last = todayStr
    return {
      backgroundColor: "transparent",
      borderColor: "rgba(255,176,107,0.4)",
      borderWidth: 1.5,
      data: [
        { x: first, y: fn(first) },
        { x: last, y: fn(last) }
      ],
      fill: false as const,
      label: "Trend",
      pointHoverRadius: 0,
      pointRadius: 0,
      tension: 0
    }
  }, [entries, rangeStart, todayStr])

  const datasets = useMemo(
    () => [...targetDatasets, weightDataset, ...(trendDataset ? [trendDataset] : [])],
    [targetDatasets, weightDataset, trendDataset]
  )

  const chartData = useMemo(
    () => ({ datasets: datasets as unknown as ChartDataset<"line">[] }),
    [datasets]
  )

  const bandEndpoints = useMemo(() => {
    if (!showTarget) return []
    return targets.flatMap((t) => {
      const visStart = t.startDate
        ? t.startDate > rangeStart
          ? t.startDate
          : rangeStart
        : rangeStart
      const visEnd = t.endDate ? (t.endDate < todayStr ? t.endDate : todayStr) : todayStr
      if (visStart > visEnd || !t.startDate) return []
      if (t.type === "rate" && t.startWeight != null) {
        return [
          projectRate(visStart, t.startDate, t.startWeight, t.minTargetRate ?? 0.25),
          projectRate(visStart, t.startDate, t.startWeight, t.maxTargetRate ?? 0.5),
          projectRate(visEnd, t.startDate, t.startWeight, t.minTargetRate ?? 0.25),
          projectRate(visEnd, t.startDate, t.startWeight, t.maxTargetRate ?? 0.5)
        ]
      }
      if (t.type === "fixed" && t.targetWeight != null) return [t.targetWeight]
      return []
    })
  }, [showTarget, targets, rangeStart, todayStr])

  const weights = sliced.map((e) => e.weight)
  const { max: yMax, min: yMin } = yRange([...weights, ...bandEndpoints])

  const chartOptions = useMemo(
    () => ({
      animation: false as const,
      interaction: { axis: "x" as const, intersect: false, mode: "nearest" as const },
      maintainAspectRatio: false,
      onClick: (_: unknown, elements: { datasetIndex: number; index: number }[]) => {
        if (!elements.length) return
        const el = elements[0]
        const raw = chartRef.current?.data.datasets[el.datasetIndex]?.data[el.index] as
          | undefined
          | { x?: string }
        if (raw?.x) setHighlightedDate(raw.x)
      },
      onHover: (event: { native?: Event | null }, elements: unknown[]) => {
        const canvas = event.native?.target as HTMLCanvasElement | null
        if (canvas) canvas.style.cursor = elements.length > 0 ? "pointer" : "default"
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          ...darkTooltip,
          callbacks: {
            footer: (items: TooltipItem<"line">[]) => {
              const weightItem = items.find((i) => i.dataset.label === "Weight")
              const date = (weightItem?.raw as { x?: string })?.x
              if (!date) return []
              const entry = entries.find((e) => e.date === date)
              return entry?.note ? [entry.note] : []
            },
            label: (item: TooltipItem<"line">) => {
              const raw = item.raw as { y: null | number }
              if (item.dataset.label === "Upper target") return `  Upper: ${raw.y!.toFixed(2)} kg`
              if (item.dataset.label === "Lower target") return `  Lower: ${raw.y!.toFixed(2)} kg`
              if (item.dataset.label === "Target") return `  Target: ${raw.y!.toFixed(2)} kg`
              return `  Weight: ${item.formattedValue} kg`
            },
            labelColor: (item: TooltipItem<"line">) => {
              if (item.dataset.label === "Weight") {
                return {
                  backgroundColor: "rgba(255,176,107,1)",
                  borderColor: "rgba(255,176,107,1)"
                }
              }
              return {
                backgroundColor: "rgba(255,255,255,0.3)",
                borderColor: "rgba(255,255,255,0.3)"
              }
            }
          },
          filter: (item: TooltipItem<"line">) => {
            if (item.dataset.label === "Trend") return false
            if (item.dataset.label === "Weight")
              return (item.raw as { y: null | number }).y !== null
            return true
          },
          footerColor: "#999",
          position: "nearest" as const
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
    [yMin, yMax, entries]
  )

  const sortedEntries = useMemo(
    () => [...entries].sort((a, b) => b.date.localeCompare(a.date)),
    [entries]
  )

  return (
    <>
      <div className="flex shrink-0 items-center border-b border-[#1a1a1a]">
        <div className="mx-auto w-full max-w-4xl px-6 py-3">
          <ChartControls
            onRangeChange={setRange}
            onShowTargetChange={setShowTarget}
            range={range}
            showTarget={showTarget}
          />
        </div>
      </div>

      <div className="shrink-0 border-b border-[#1a1a1a]">
        {entries.length === 0 ? (
          <p className="py-8 text-center text-sm text-[#555]">
            No entries yet. Log your first weight to get started.
          </p>
        ) : (
          <div className="mx-auto max-w-4xl px-6 pb-6">
            <div className="flex items-center justify-between pb-2 pt-4">
              <p className="text-[12px] font-semibold uppercase tracking-wider text-[#888]">
                Weight
              </p>
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
            <div className="h-72">
              <Line data={chartData} options={chartOptions} ref={chartRef} />
            </div>
          </div>
        )}
      </div>

      <ResizablePanels
        className="mx-auto w-full max-w-4xl border-x border-[#1a1a1a]"
        cookieKey="weight-panels-layout"
        defaultLeftPct={defaultLeftPct}
        left={
          <LogsPanel
            entries={sortedEntries}
            highlightedDate={highlightedDate}
            onHighlightClear={() => setHighlightedDate(null)}
          />
        }
        right={<TargetsPanel targets={targets} />}
      />
    </>
  )
}

function dailyDates(first: string, last: string): string[] {
  if (first > last) return []
  const dates: string[] = []
  const cur = new Date(`${first}T12:00:00`)
  const end = new Date(`${last}T12:00:00`)
  while (cur <= end) {
    dates.push(cur.toISOString().split("T")[0])
    cur.setDate(cur.getDate() + 1)
  }
  return dates
}

function formatDateShort(dateStr: string) {
  return new Date(`${dateStr}T12:00:00`).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric"
  })
}

function linearRegression(entries: WeightEntry[]) {
  if (entries.length < 2) return null
  const xs = entries.map((e) => new Date(`${e.date}T12:00:00`).getTime())
  const ys = entries.map((e) => e.weight ?? 0)
  const n = xs.length
  const xMean = xs.reduce((a, b) => a + b, 0) / n
  const yMean = ys.reduce((a, b) => a + b, 0) / n
  const ssXY = xs.reduce((acc, x, i) => acc + (x - xMean) * (ys[i] - yMean), 0)
  const ssXX = xs.reduce((acc, x) => acc + (x - xMean) ** 2, 0)
  if (ssXX === 0) return null
  const slope = ssXY / ssXX
  const intercept = yMean - slope * xMean
  return (date: string) => slope * new Date(`${date}T12:00:00`).getTime() + intercept
}

function LogRow({
  entry,
  highlighted,
  onHighlightClear
}: {
  entry: WeightEntry
  highlighted: boolean
  onHighlightClear: () => void
}) {
  const rowRef = useRef<HTMLDivElement>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (highlighted) {
      rowRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
      const t = setTimeout(onHighlightClear, 1800)
      return () => clearTimeout(t)
    }
  }, [highlighted, onHighlightClear])

  function handleDelete() {
    startTransition(async () => {
      await deleteWeightEntryByDate(entry.date)
    })
  }

  return (
    <div
      className={[
        "group flex items-center justify-between gap-4 border-b pl-4 py-3 transition-colors duration-500 border-[#1a1a1a]",
        highlighted ? "bg-[#111]" : ""
      ].join(" ")}
      ref={rowRef}
    >
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-[#555]">
          {formatDateShort(entry.date)}
        </p>
        <p className="mt-0.5 text-sm text-[#ededed]">
          {entry.weight} kg
          {entry.note && <span className="ml-2 text-[#666]">· {entry.note}</span>}
        </p>
      </div>
      <div className="opacity-0 transition-opacity duration-100 group-hover:opacity-100 group-has-aria-expanded:opacity-100">
        <Float>
          <FloatTrigger>
            <Button
              aria-label="Open entry actions"
              className="text-[#666] hover:text-[#ededed]"
              disabled={isPending}
              iconOnly
              type="button"
              variant="ghost"
            >
              <MoreHorizontal size={15} />
            </Button>
          </FloatTrigger>
          <FloatContent align="center" className="min-w-28" estimatedWidth={112}>
            <FloatLink className="flex items-center gap-2" href={`/weight/log/${entry.date}`}>
              <Pencil size={13} /> Edit
            </FloatLink>
            <FloatItem
              className="flex items-center gap-2"
              danger
              disabled={isPending}
              onClick={handleDelete}
            >
              <Trash2 size={13} /> Delete
            </FloatItem>
          </FloatContent>
        </Float>
      </div>
    </div>
  )
}

function LogsPanel({
  entries,
  highlightedDate,
  onHighlightClear
}: {
  entries: WeightEntry[]
  highlightedDate: null | string
  onHighlightClear: () => void
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex h-12 shrink-0 items-center border-b border-[#1a1a1a] px-6">
        <span className="text-[12px] font-semibold uppercase tracking-wider text-[#888]">Logs</span>
      </div>
      {entries.length === 0 ? (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm text-[#555]">No entries yet.</p>
        </div>
      ) : (
        <div className="min-h-0 flex-1 overflow-auto">
          {entries.map((e) => (
            <LogRow
              entry={e}
              highlighted={highlightedDate === e.date}
              key={e.date}
              onHighlightClear={onHighlightClear}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function projectRate(date: string, startDate: string, startWeight: number, ratePerWeek: number) {
  const ms = new Date(`${date}T12:00:00`).getTime() - new Date(`${startDate}T12:00:00`).getTime()
  return startWeight + (ms / 86_400_000) * (ratePerWeek / 7)
}

function TargetRow({ target }: { target: WeightTarget }) {
  const [isPending, startTransition] = useTransition()

  const dateRange = target.endDate
    ? `${formatDateShort(target.startDate ?? today())} - ${formatDateShort(target.endDate)}`
    : formatDateShort(target.startDate ?? today())

  const detail =
    target.type === "rate"
      ? `${target.minTargetRate ?? 0.25} – ${target.maxTargetRate ?? 0.5} kg/wk from ${target.startWeight ?? "?"} kg`
      : `${target.targetWeight ?? "?"} kg`

  function handleDelete() {
    startTransition(async () => {
      await deleteWeightTargetById(target.id)
    })
  }

  return (
    <div className="group flex items-center justify-between gap-4 border-b border-[#1a1a1a] pl-4 py-3">
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-[#555]">
          {target.type === "rate" ? "Rate" : "Fixed"} · {dateRange}
        </p>
        <p className="mt-0.5 text-sm text-[#ededed]">{detail}</p>
      </div>
      <div className="opacity-0 transition-opacity duration-100 group-hover:opacity-100 group-has-aria-expanded:opacity-100">
        <Float>
          <FloatTrigger>
            <Button
              aria-label="Open target actions"
              className="text-[#666] hover:text-[#ededed]"
              disabled={isPending}
              iconOnly
              type="button"
              variant="ghost"
            >
              <MoreHorizontal size={15} />
            </Button>
          </FloatTrigger>
          <FloatContent align="center" className="min-w-28" estimatedWidth={112}>
            <FloatLink className="flex items-center gap-2" href={`/weight/targets/${target.id}`}>
              <Pencil size={13} /> Edit
            </FloatLink>
            <FloatItem
              className="flex items-center gap-2"
              danger
              disabled={isPending}
              onClick={handleDelete}
            >
              <Trash2 size={13} /> Delete
            </FloatItem>
          </FloatContent>
        </Float>
      </div>
    </div>
  )
}

function TargetsPanel({ targets }: { targets: WeightTarget[] }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex h-12 shrink-0 items-center border-b border-[#1a1a1a] px-6">
        <span className="text-[12px] font-semibold uppercase tracking-wider text-[#888]">
          Targets
        </span>
      </div>
      <div className="min-h-0 flex-1 overflow-auto">
        {targets.length === 0 ? (
          <div className="flex flex-1 items-center justify-center h-full">
            <p className="text-sm text-[#555]">No targets yet.</p>
          </div>
        ) : (
          targets.map((t) => <TargetRow key={t.id} target={t} />)
        )}
      </div>
    </div>
  )
}

function yRange(values: (null | number | undefined)[]) {
  const nums = values.filter((v): v is number => v != null && !isNaN(v))
  if (nums.length === 0) return { max: undefined, min: undefined }
  const lo = Math.min(...nums)
  const hi = Math.max(...nums)
  const spread = hi - lo || hi * 0.05 || 1
  const pad = spread * 0.2
  const step = Math.pow(10, Math.floor(Math.log10(spread / 3)))
  return {
    max: Math.ceil((hi + pad) / step) * step,
    min: Math.max(0, Math.floor((lo - pad) / step) * step)
  }
}
