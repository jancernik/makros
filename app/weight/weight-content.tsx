"use client"

import { LogOut, PlusCircle, Target, Utensils } from "lucide-react"

import type { WeightEntry, WeightTarget } from "@/db/schema"

import { logout } from "../auth/actions"
import {
  MobileNav,
  MobileNavButton,
  MobileNavLink,
  MobileNavSeparator
} from "../components/mobile-nav"
import { Button, ButtonLink } from "../components/ui/button"
import { WeightWrapper } from "./weight-wrapper"

type Props = {
  authEnabled: boolean
  defaultLeftPct: number
  entries: WeightEntry[]
  targets: WeightTarget[]
}

export function WeightContent({ authEnabled, defaultLeftPct, entries, targets }: Props) {
  return (
    <main className="flex h-dvh flex-col overflow-hidden">
      <header className="flex shrink-0 items-center justify-between border-b border-[#1a1a1a] px-4 py-3 md:px-6 md:py-5">
        <ButtonLink href="/food" variant="primary">
          <Utensils size={15} />
          Food
        </ButtonLink>
        <div className="flex items-center gap-1.5 md:gap-3">
          <div className="hidden md:flex md:items-center md:gap-3">
            <ButtonLink href="/weight/targets/new">
              <Target size={15} /> New Target
            </ButtonLink>
            <ButtonLink href="/weight/log">
              <PlusCircle size={15} /> Log weight
            </ButtonLink>
            {authEnabled && (
              <form action={logout}>
                <Button type="submit" variant="danger">
                  <LogOut size={15} /> Logout
                </Button>
              </form>
            )}
          </div>
          <MobileNav>
            <MobileNavLink href="/weight/targets/new">
              <Target size={14} /> New Target
            </MobileNavLink>
            <MobileNavLink href="/weight/log">
              <PlusCircle size={14} /> Log weight
            </MobileNavLink>
            {authEnabled && (
              <>
                <MobileNavSeparator />
                <form action={logout}>
                  <MobileNavButton className="text-red-400" type="submit">
                    <LogOut size={14} /> Logout
                  </MobileNavButton>
                </form>
              </>
            )}
          </MobileNav>
        </div>
      </header>
      <WeightWrapper defaultLeftPct={defaultLeftPct} entries={entries} targets={targets} />
    </main>
  )
}
