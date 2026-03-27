import { jwtVerify } from "jose"
import { NextRequest, NextResponse } from "next/server"

import { SESSION_COOKIE_NAME } from "./app/auth/constants"

export async function proxy(request: NextRequest) {
  if (!isAuthEnabled()) {
    return NextResponse.next()
  }

  const { pathname } = request.nextUrl

  const isPublicPath =
    pathname === "/login" || pathname.startsWith("/_next") || pathname.startsWith("/favicon.ico")

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value
  const session = token ? await verifySessionToken(token) : null

  if (!session && !isPublicPath) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (session && pathname === "/login") {
    return NextResponse.redirect(new URL("/food", request.url))
  }

  return NextResponse.next()
}

function isAuthEnabled() {
  return Boolean(process.env.AUTH_USERNAME && process.env.AUTH_PASSWORD)
}

async function verifySessionToken(token: string) {
  const secret = process.env.AUTH_SECRET
  if (!secret) return null

  try {
    const result = await jwtVerify(token, new TextEncoder().encode(secret), {
      algorithms: ["HS256"]
    })
    return result.payload
  } catch {
    return null
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"]
}
