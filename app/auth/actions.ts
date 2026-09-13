"use server"

import { redirect } from "next/navigation"
import { z } from "zod"

import { db } from "@/db"
import { isUniqueViolation } from "@/db/errors"
import { users } from "@/db/schema"

import {
  areSignupsEnabled,
  clearSessionCookie,
  createSessionToken,
  setSessionCookie,
  verifyCredentials
} from "./lib"
import { hashPassword } from "./password"
import { loginSchema, signupSchema } from "./schemas"

export type AuthActionState = {
  errors: Record<string, string[] | undefined>
  message: null | string
  success: boolean
}

export async function login(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
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
  const user = await verifyCredentials(username, password)

  if (!user) {
    return {
      errors: {
        password: ["Invalid username or password."],
        username: ["Invalid username or password."]
      },
      message: "Invalid username or password.",
      success: false
    }
  }

  await setSessionCookie(await createSessionToken(user.id))

  redirect("/food")
}

export async function logout() {
  await clearSessionCookie()
  redirect("/login")
}

export async function signup(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  if (!areSignupsEnabled()) {
    return { errors: {}, message: "Signups are disabled.", success: false }
  }

  const parsed = signupSchema.safeParse({
    confirmPassword: formData.get("confirmPassword"),
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

  let userId: string
  try {
    const [user] = await db
      .insert(users)
      .values({ passwordHash: await hashPassword(password), username })
      .returning({ id: users.id })
    userId = user.id
  } catch (error) {
    if (isUniqueViolation(error)) {
      return {
        errors: { username: ["That username is taken."] },
        message: "That username is taken.",
        success: false
      }
    }

    console.error("signup failed:", error)

    return {
      errors: {},
      message: "Something went wrong while creating the account.",
      success: false
    }
  }

  await setSessionCookie(await createSessionToken(userId))

  redirect("/food")
}
