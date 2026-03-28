import "server-only"
import { jwtVerify, SignJWT } from "jose"
import { cookies } from "next/headers"

import { SESSION_COOKIE_NAME } from "./constants"
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 30 // 30 days

export function areCredentialsValid(username: string, password: string) {
  const config = getAuthConfig()

  if (!config.enabled) {
    return true
  }

  return username === config.username && password === config.password
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

export async function createSessionToken() {
  const secretKey = getSecretKey()

  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(secretKey)
}

export async function getSessionFromCookies() {
  if (!isAuthEnabled()) {
    return { authEnabled: false as const, authenticated: false }
  }

  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (!token) {
    return { authEnabled: true as const, authenticated: false }
  }

  const payload = await verifySessionToken(token)

  if (!payload) {
    return { authEnabled: true as const, authenticated: false }
  }

  return {
    authEnabled: true as const,
    authenticated: true,
    payload
  }
}

export function isAuthEnabled() {
  return getAuthConfig().enabled
}

export async function requireAuth() {
  const session = await getSessionFromCookies()
  if (session.authEnabled && !session.authenticated) {
    throw new Error("Unauthorized")
  }
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

export async function verifySessionToken(token: string) {
  try {
    const secretKey = getSecretKey()
    const result = await jwtVerify(token, secretKey, {
      algorithms: ["HS256"]
    })

    return result.payload
  } catch {
    return null
  }
}

function getAuthConfig() {
  const username = process.env.AUTH_USERNAME
  const password = process.env.AUTH_PASSWORD
  const secret = process.env.AUTH_SECRET

  const enabled = Boolean(username && password)

  return {
    enabled,
    password,
    secret,
    username
  }
}

function getSecretKey() {
  const { secret } = getAuthConfig()

  if (!secret) {
    throw new Error("AUTH_SECRET is required when auth is enabled")
  }

  return new TextEncoder().encode(secret)
}
