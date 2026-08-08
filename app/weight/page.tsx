import { cookies } from "next/headers"

import { requireUserIdOrRedirect } from "../auth/lib"
import { parsePanelsLayoutCookie } from "../food/cookies"
import { getWeightEntries, getWeightTargets } from "../food/queries"
import { WeightContent } from "./weight-content"

export default async function WeightPage() {
  const userId = await requireUserIdOrRedirect()
  const [entries, targets, cookieStore] = await Promise.all([
    getWeightEntries(userId, 365),
    getWeightTargets(userId),
    cookies()
  ])
  const panelsLayout = parsePanelsLayoutCookie(cookieStore.get("weight-panels-layout")?.value)

  return <WeightContent defaultLeftPct={panelsLayout.leftPct} entries={entries} targets={targets} />
}
