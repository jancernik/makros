"use client"

import { useActionState, useState } from "react"

import { type AuthActionState, signup } from "../auth/actions"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"

const initialState: AuthActionState = {
  errors: {},
  message: null,
  success: false
}

export function SignupForm() {
  const [state, formAction, pending] = useActionState(signup, initialState)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Input
        autoComplete="username"
        error={state.errors.username?.[0]}
        id="username"
        label="Username"
        name="username"
        onChange={(e) => setUsername(e.target.value)}
        type="text"
        value={username}
      />

      <Input
        autoComplete="new-password"
        error={state.errors.password?.[0]}
        id="password"
        label="Password"
        name="password"
        onChange={(e) => setPassword(e.target.value)}
        type="password"
        value={password}
      />

      <Input
        autoComplete="new-password"
        error={state.errors.confirmPassword?.[0]}
        id="confirmPassword"
        label="Confirm password"
        name="confirmPassword"
        onChange={(e) => setConfirmPassword(e.target.value)}
        type="password"
        value={confirmPassword}
      />

      {state.message && !state.success && !Object.values(state.errors).some((e) => e?.length) ? (
        <p className="text-sm text-red-400">{state.message}</p>
      ) : null}

      <div className="mt-2">
        <Button className="w-full" disabled={pending} type="submit" variant="primary">
          {pending ? "Creating account…" : "Create account"}
        </Button>
      </div>
    </form>
  )
}
