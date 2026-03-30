import "dotenv/config"
import readline from "readline"

import { truncateAllTables } from "./seed/lib"

function askConfirmation(question: string): Promise<boolean> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
    rl.question(question, (answer) => {
      rl.close()
      resolve(answer.toLowerCase() === "y" || answer.toLowerCase() === "yes")
    })
  })
}

const force = process.argv.includes("--force") || process.argv.includes("-y")

if (!force) {
  const confirmed = await askConfirmation(
    "Are you sure you want to truncate all app tables? (y/N): "
  )

  if (!confirmed) {
    console.log("✓ Reset cancelled.")
    process.exit(0)
  }
}

try {
  console.log("Truncating all tables...")
  await truncateAllTables()
  console.log("\x1b[32m✓ All tables truncated\x1b[0m")
  process.exit(0)
} catch (error) {
  console.error("✗ Reset failed:", (error as Error).message)
  process.exit(1)
}
