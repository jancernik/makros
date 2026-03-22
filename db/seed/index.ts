import "dotenv/config"

import { seedDatabase } from "./lib"

try {
  console.log("Seeding database...")
  await seedDatabase()
  console.log("\x1b[32m✓ Seed completed\x1b[0m")
  process.exit(0)
} catch (error) {
  console.error("✗ Seed failed:", (error as Error).message)
  process.exit(1)
}
