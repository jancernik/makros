"use server"

import { redirect } from "next/navigation"
import { z } from "zod"

import {
  areCredentialsValid,
  clearSessionCookie,
  createSessionToken,
  isAuthEnabled,
  setSessionCookie
} from "./lib"
import { loginSchema } from "./schemas"

export type LoginActionState = {
  errors: Record<string, string[] | undefined>
  message: null | string
  success: boolean
}

export async function login(
  _prevState: LoginActionState,
  formData: FormData
): Promise<LoginActionState> {
  if (!isAuthEnabled()) {
    return {
      errors: {},
      message: "Authentication is disabled.",
      success: false
    }
  }

  const parsed = loginSchema.safeParse({
    password: formData.get("password"),
    username: formData.get("username")
  })

  if (!parsed.success) {
    return {
      errors: z.flattenError(parsed.error).fieldErrors,
      message: "Invalid request.",
      success: false
    }
  }

  const { password, username } = parsed.data

  if (!areCredentialsValid(username, password)) {
    return {
      errors: {
        password: ["Invalid username or password."],
        username: ["Invalid username or password."]
      },
      message: "Invalid username or password.",
      success: false
    }
  }

  const token = await createSessionToken()
  await setSessionCookie(token)

  redirect("/food")
}

export async function logout() {
  await clearSessionCookie()
  redirect("/login")
}
