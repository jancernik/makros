"use client"

import { useActionState, useState } from "react"

import { login, type LoginActionState } from "../auth/actions"
import { Button } from "../components/button"
import { Input } from "../components/input"

const initialState: LoginActionState = {
  errors: {},
  message: null,
  success: false
}

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, initialState)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

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
        autoComplete="current-password"
        error={state.errors.password?.[0]}
        id="password"
        label="Password"
        name="password"
        onChange={(e) => setPassword(e.target.value)}
        type="password"
        value={password}
      />

      <div className="mt-2">
        <Button className="w-full" disabled={pending} type="submit" variant="primary">
          {pending ? "Signing in…" : "Sign in"}
        </Button>
      </div>
    </form>
  )
}
