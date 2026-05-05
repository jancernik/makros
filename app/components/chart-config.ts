export function formatTickValue(v: number | string): string {
  const n = typeof v === "string" ? parseFloat(v) : v
  if (!isFinite(n)) return String(v)
  return Number.isInteger(n) ? String(n) : n.toFixed(1)
}

export const darkThemeScales = {
  border: { color: "#2e2e2e" },
  grid: { color: "#2e2e2e" },
  ticks: {
    color: "#777",
    font: { family: "Roboto, sans-serif", size: 10 }
  }
} as const

export const timeXScale = {
  afterBuildTicks(scale: { max: number; min: number; ticks: { value: number }[] }) {
    const ANCHOR = new Date("2020-01-06T12:00:00").getTime()
    const STEP = 7 * 24 * 60 * 60 * 1000
    const offset = Math.floor((scale.min - ANCHOR) / STEP)
    let t = ANCHOR + offset * STEP
    const ticks: { value: number }[] = []
    while (t <= scale.max) {
      if (t >= scale.min) ticks.push({ value: t })
      t += STEP
    }
    scale.ticks = ticks
  },
  time: {
    displayFormats: { day: "MMM d" },
    tooltipFormat: "MMM d, yyyy",
    unit: "day" as const
  },
  type: "time" as const,
  ...darkThemeScales,
  ticks: {
    ...darkThemeScales.ticks,
    maxRotation: 0
  }
} as const

export const zoomPanPlugin = {
  limits: { x: { max: "original" as const, min: "original" as const } },
  pan: { enabled: true, mode: "x" as const, threshold: 0 },
  zoom: {
    mode: "x" as const,
    pinch: { enabled: true },
    wheel: { enabled: true, speed: 0.08 }
  }
} as const

export const darkTooltip = {
  backgroundColor: "#0d0d0d",
  bodyColor: "#ededed",
  borderColor: "#333",
  borderWidth: 1,
  padding: 10,
  titleColor: "#999"
} as const
