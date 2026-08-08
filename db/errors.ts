export function isUniqueViolation(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false
  if ("code" in error && (error as { code: unknown }).code === "23505") return true
  if ("cause" in error) return isUniqueViolation((error as { cause: unknown }).cause)
  return false
}
