import "dotenv/config"
import { Client } from "pg"
import readline from "readline"

import { adminUrl, databaseName } from "./env"

function askConfirmation(question: string): Promise<boolean> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
    rl.question(question, (answer) => {
      rl.close()
      resolve(answer.toLowerCase() === "y" || answer.toLowerCase() === "yes")
    })
  })
}

async function dropDatabase() {
  const name = databaseName()
  const force = process.argv.includes("--force") || process.argv.includes("-y")

  if (!force) {
    const confirmed = await askConfirmation(
      `Are you sure you want to drop the database "${name}"? (y/N): `
    )

    if (!confirmed) {
      console.log("✓ Database drop cancelled.")
      return
    }
  }

  const adminClient = new Client({ connectionString: adminUrl() })
  await adminClient.connect()

  try {
    const result = await adminClient.query("SELECT 1 FROM pg_database WHERE datname = $1", [name])

    if (result.rowCount === 0) {
      console.error(`✗ Database ${name} does not exist`)
    } else {
      await adminClient.query(`DROP DATABASE "${name}"`)
      console.log(`✓ Database ${name} dropped`)
    }
  } catch (error) {
    console.error(`✗ Error dropping database: ${(error as Error).message}`)
    process.exit(1)
  } finally {
    await adminClient.end()
  }

  console.log(`\x1b[32m✓ Database drop completed\x1b[0m`)
}

await dropDatabase()
