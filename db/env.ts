function requireUrl() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error("DATABASE_URL is required")
  return url
}

export const dbEnv = {
  migrationUrl: process.env.DATABASE_URL_UNPOOLED ?? requireUrl(),
  url: requireUrl()
}

export function adminUrl() {
  const url = new URL(dbEnv.url)
  url.pathname = "/postgres"
  return url.toString()
}

export function databaseName() {
  return new URL(dbEnv.url).pathname.replace(/^\//, "")
}
