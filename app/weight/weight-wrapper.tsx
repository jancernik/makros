"use client"

import dynamic from "next/dynamic"

import type { WeightClientProps } from "./weight-client"

const WeightClient = dynamic(
  () => import("./weight-client").then((m) => ({ default: m.WeightClient })),
  { ssr: false }
)

export function WeightWrapper(props: WeightClientProps) {
  return <WeightClient {...props} />
}
