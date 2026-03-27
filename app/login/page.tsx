import { redirect } from "next/navigation"

import { getSessionFromCookies, isAuthEnabled } from "../auth/lib"
import { LoginForm } from "./login-form"

export default async function LoginPage() {
  if (!isAuthEnabled()) {
    redirect("/food")
  }

  const session = await getSessionFromCookies()

  if (session.authenticated) {
    redirect("/food")
  }

  return (
    <main className="flex min-h-dvh items-center justify-center px-4">
      <div className="w-full max-w-sm border border-[#1a1a1a] p-8">
        <LoginForm />
      </div>
    </main>
  )
}
