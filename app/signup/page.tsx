import { notFound, redirect } from "next/navigation"

import { areSignupsEnabled, getSessionUserId } from "../auth/lib"
import { SignupForm } from "./signup-form"

export default async function SignupPage() {
  if (!areSignupsEnabled()) {
    notFound()
  }

  if (await getSessionUserId()) {
    redirect("/food")
  }

  return (
    <main className="flex min-h-dvh items-center justify-center px-4">
      <div className="w-full max-w-sm border border-[#1a1a1a] p-8">
        <SignupForm />
        <p className="mt-6 text-center text-sm">
          <a className="text-[#ededed] underline underline-offset-4" href="/login">
            Sign in
          </a>
        </p>
      </div>
    </main>
  )
}
