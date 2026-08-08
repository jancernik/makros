import { NextRequest, NextResponse } from "next/server"

import { SESSION_COOKIE_NAME } from "./app/auth/constants"
import { getUserIdFromSessionToken } from "./app/auth/token"

// /cron carries a CRON_SECRET bearer token.
const PUBLIC_PREFIXES = ["/login", "/signup", "/cron", "/_next", "/favicon.ico"]

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isPublicPath = PUBLIC_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  )

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value
  const userId = token ? await getUserIdFromSessionToken(token) : null

  if (!userId && !isPublicPath) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (userId && (pathname === "/login" || pathname === "/signup")) {
    return NextResponse.redirect(new URL("/food", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"]
}
