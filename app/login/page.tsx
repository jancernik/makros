import { redirect } from "next/navigation"

import { areSignupsEnabled, getSessionUserId } from "../auth/lib"
import { LoginForm } from "./login-form"

export default async function LoginPage() {
  if (await getSessionUserId()) {
    redirect("/food")
  }

  return (
    <main className="flex min-h-dvh items-center justify-center px-4">
      <div className="w-full max-w-sm border border-[#1a1a1a] p-8">
        <LoginForm />
        {areSignupsEnabled() && (
          <p className="mt-6 text-center text-sm">
            <a className="text-[#ededed] underline underline-offset-4" href="/signup">
              Sign up
            </a>
          </p>
        )}
      </div>
    </main>
  )
}
