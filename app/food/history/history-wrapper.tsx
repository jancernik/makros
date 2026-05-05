"use client"

import dynamic from "next/dynamic"

import type { DayMacros } from "./history-client"

const HistoryClient = dynamic(
  () => import("./history-client").then((m) => ({ default: m.HistoryClient })),
  { ssr: false }
)

export function HistoryWrapper({ data }: { data: DayMacros[] }) {
  return <HistoryClient data={data} />
}
