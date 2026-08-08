import "dotenv/config"
import { Client } from "pg"

import { adminUrl, databaseName } from "./env"

async function createDatabase() {
  const name = databaseName()
  const adminClient = new Client({ connectionString: adminUrl() })
  await adminClient.connect()

  try {
    const result = await adminClient.query("SELECT 1 FROM pg_database WHERE datname = $1", [name])

    if (result.rowCount === 0) {
      await adminClient.query(`CREATE DATABASE "${name}"`)
      console.log(`✓ Database ${name} created`)
    } else {
      console.log(`✓ Database ${name} already exists`)
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
