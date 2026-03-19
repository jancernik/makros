import "dotenv/config"
import { Client } from "pg"
import readline from "readline"
import { dbEnv } from "./env"

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
  const confirmed = await askConfirmation(
    `Are you sure you want to drop the database "${dbEnv.name}"? (y/N): `
  )

  if (!confirmed) {
    console.log("✓ Database drop cancelled.")
    return
  }

  const adminClient = new Client({
    user: dbEnv.user,
    host: dbEnv.host,
    port: dbEnv.port,
    password: dbEnv.password,
    database: "postgres"
  })
  await adminClient.connect()

  try {
    const result = await adminClient.query("SELECT 1 FROM pg_database WHERE datname = $1", [
      dbEnv.name
    ])

    if (result.rowCount === 0) {
      console.error(`✗ Database ${dbEnv.name} does not exist`)
    } else {
      await adminClient.query(`DROP DATABASE "${dbEnv.name}"`)
      console.log(`✓ Database ${dbEnv.name} dropped`)
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
