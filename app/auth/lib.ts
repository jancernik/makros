import "server-only"
import { eq, sql } from "drizzle-orm"
import { SignJWT } from "jose"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { db } from "@/db"
import { users } from "@/db/schema"

import { SESSION_COOKIE_NAME } from "./constants"
import { TIMING_DECOY_HASH, verifyPassword } from "./password"
import { getSecretKey, getUserIdFromSessionToken } from "./token"

const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 30 // 30 days

export function areSignupsEnabled() {
  return process.env.ALLOW_SIGNUPS === "true"
}

export async function clearSessionCookie() {
  const cookieStore = await cookies()

  cookieStore.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    maxAge: 0,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production"
  })
}

export async function createSessionToken(userId: string) {
  const secretKey = getSecretKey()

  return new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(secretKey)
}

export async function getSessionUserId(): Promise<null | string> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value
  if (!token) return null

  return getUserIdFromSessionToken(token)
}

export async function requireUserId(): Promise<string> {
  const userId = await getSessionUserId()
  if (!userId) throw new Error("Unauthorized")
  return userId
}

export async function requireUserIdOrRedirect(): Promise<string> {
  const userId = await getSessionUserId()
  if (!userId) redirect("/login")
  return userId
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies()

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    maxAge: SESSION_DURATION_SECONDS,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production"
  })
}

export async function verifyCredentials(username: string, password: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(sql`lower(${users.username})`, username.trim().toLowerCase()))
    .limit(1)

  const valid = await verifyPassword(password, user?.passwordHash ?? TIMING_DECOY_HASH)

  return valid && user ? user : null
}
