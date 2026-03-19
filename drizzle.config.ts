import "dotenv/config"
import { defineConfig } from "drizzle-kit"
import { dbEnv } from "./db/env"

export default defineConfig({
  dbCredentials: {
    url: dbEnv.url
  },
  dialect: "postgresql",
  out: "./db/migrations",
  schema: "./db/schema.ts",
  strict: true,
  verbose: true
})
