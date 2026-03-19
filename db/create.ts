import "dotenv/config"
import { Client } from "pg"

import { dbEnv } from "./env"

async function createDatabase() {
  const adminClient = new Client({
    database: "postgres",
    host: dbEnv.host,
    password: dbEnv.password,
    port: dbEnv.port,
    user: dbEnv.user
  })
  await adminClient.connect()

  try {
    const result = await adminClient.query("SELECT 1 FROM pg_database WHERE datname = $1", [
      dbEnv.name
    ])

    if (result.rowCount === 0) {
      await adminClient.query(`CREATE DATABASE "${dbEnv.name}"`)
      console.log(`✓ Database ${dbEnv.name} created`)
    } else {
      console.log(`✓ Database ${dbEnv.name} already exists`)
    }
  } catch (error) {
    console.error(`✗ Error creating database: ${(error as Error).message}`)
    process.exit(1)
  } finally {
    await adminClient.end()
  }

  console.log(`\x1b[32m✓ Database creation completed\x1b[0m`)
}

await createDatabase()
