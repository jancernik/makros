import { cookies } from "next/headers"

import { isAuthEnabled } from "../auth/lib"
import { parsePanelsLayoutCookie } from "../food/cookies"
import { getWeightEntries, getWeightTargets } from "../food/queries"
import { WeightContent } from "./weight-content"

export default async function WeightPage() {
  const [entries, targets, cookieStore] = await Promise.all([
    getWeightEntries(365),
    getWeightTargets(),
    cookies()
  ])
  const panelsLayout = parsePanelsLayoutCookie(cookieStore.get("weight-panels-layout")?.value)
  const authEnabled = isAuthEnabled()

  return (
    <WeightContent
      authEnabled={authEnabled}
      defaultLeftPct={panelsLayout.leftPct}
      entries={entries}
      targets={targets}
    />
  )
}
