import "server-only"
import { sql } from "drizzle-orm"

import { db } from "@/db"
import { seedDatabase, truncateAllTables } from "@/db/seed/lib"

export async function resetAndSeedDemoDatabase() {
  await assertSafeTarget()
  await truncateAllTables()
  await seedDatabase()
}

async function assertSafeTarget() {
  if (process.env.APP_ENV !== "demo") {
    throw new Error("Refusing to reset: APP_ENV is not 'demo'")
  }

  const expectedDb = process.env.DEMO_DB_NAME
  if (expectedDb) {
    const result = await db.execute(sql`SELECT current_database() AS name`)
    const actual = (result.rows[0] as { name: string }).name
    if (actual !== expectedDb) {
      throw new Error(`Refusing to reset: connected to '${actual}', expected '${expectedDb}'`)
    }
  }
}
