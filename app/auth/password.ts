import { randomBytes, scrypt, timingSafeEqual } from "node:crypto"
import { promisify } from "node:util"

const scryptAsync = promisify(scrypt)

const KEY_LENGTH = 64
const SALT_BYTES = 16

export const TIMING_DECOY_HASH = `${"0".repeat(32)}:${"0".repeat(KEY_LENGTH * 2)}`

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_BYTES).toString("hex")
  const derived = (await scryptAsync(password, salt, KEY_LENGTH)) as Buffer
  return `${salt}:${derived.toString("hex")}`
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [salt, hash] = stored.split(":")
  if (!salt || !hash) return false

  const expected = Buffer.from(hash, "hex")
  if (expected.length !== KEY_LENGTH) return false

  const derived = (await scryptAsync(password, salt, KEY_LENGTH)) as Buffer
  return timingSafeEqual(derived, expected)
}
