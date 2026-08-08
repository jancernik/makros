import { jwtVerify } from "jose"

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function getSecretKey() {
  const secret = process.env.AUTH_SECRET

  if (!secret) {
    throw new Error("AUTH_SECRET is required")
  }

  return new TextEncoder().encode(secret)
}

export async function getUserIdFromSessionToken(token: string): Promise<null | string> {
  const subject = (await verifySessionToken(token))?.sub

  return typeof subject === "string" && UUID_PATTERN.test(subject) ? subject : null
}

async function verifySessionToken(token: string) {
  const secretKey = getSecretKey()

  try {
    const result = await jwtVerify(token, secretKey, { algorithms: ["HS256"] })

    return result.payload
  } catch {
    return null
  }
}
