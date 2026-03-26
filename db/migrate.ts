import "dotenv/config"
import { drizzle } from "drizzle-orm/node-postgres"
import { migrate } from "drizzle-orm/node-postgres/migrator"
import { Client } from "pg"

import { dbEnv } from "./env"

async function migrateDb() {
  const client = new Client({
    database: dbEnv.name,
    host: dbEnv.host,
    password: dbEnv.password,
    port: dbEnv.port,
    ssl: dbEnv.ssl,
    user: dbEnv.user
  })

  try {
    await client.connect()
    console.log("✓ Database connection established")

    await migrate(drizzle(client), { migrationsFolder: "./db/migrations" })
    console.log("\x1b[32m✓ Database migration completed\x1b[0m")

    await client.end()
    process.exit(0)
  } catch (error) {
    console.error("✗ Migration failed:", (error as Error).message)
    try {
      await client.end()
    } catch {
      /* ignore */
    }
    process.exit(1)
  }
}

await migrateDb()
