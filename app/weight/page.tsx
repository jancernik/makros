import { PlusCircle, Target, Utensils } from "lucide-react"
import { cookies } from "next/headers"

import { ButtonLink } from "../components/ui/button"
import { parsePanelsLayoutCookie } from "../food/cookies"
import { getWeightEntries, getWeightTargets } from "../food/queries"
import { WeightWrapper } from "./weight-wrapper"

export default async function WeightPage() {
  const [entries, targets, cookieStore] = await Promise.all([
    getWeightEntries(365),
    getWeightTargets(),
    cookies()
  ])
  const panelsLayout = parsePanelsLayoutCookie(cookieStore.get("weight-panels-layout")?.value)

  return (
    <main className="flex min-h-dvh flex-col md:h-dvh md:overflow-hidden">
      <header className="flex items-center justify-between border-b border-[#1a1a1a] px-6 py-5">
        <h1>Makros</h1>
        <div className="flex items-center gap-3">
          <ButtonLink href="/weight/targets/new">
            <Target size={15} /> New target
          </ButtonLink>
          <ButtonLink href="/weight/log">
            <PlusCircle size={15} /> Log weight
          </ButtonLink>
          <ButtonLink href="/food" variant="primary">
            <Utensils size={15} /> Food
          </ButtonLink>
        </div>
      </header>

      <WeightWrapper defaultLeftPct={panelsLayout.leftPct} entries={entries} targets={targets} />
    </main>
  )
}
