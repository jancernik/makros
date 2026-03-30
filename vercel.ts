import type { VercelConfig } from "@vercel/config/v1"

const config: VercelConfig = {
  crons: process.env.APP_ENV === "demo" ? [{ path: "/cron/reseed", schedule: "0 4 * * *" }] : []
}

export default config
