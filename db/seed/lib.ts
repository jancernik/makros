import { getTableName, is, sql, Table } from "drizzle-orm"

import { db } from "../index"
import * as schema from "../schema"
import { seedEntries } from "./data"

export type SeedEntry<TTable extends Table = Table> = {
  rows: Array<TTable["$inferInsert"]>
  table: TTable
}

export function defineSeed<TTable extends Table>(
  table: TTable,
  rows: Array<TTable["$inferInsert"]>
): SeedEntry<TTable> {
  return { rows, table }
}

export async function seedDatabase() {
  for (const entry of seedEntries) {
    if (entry.rows.length === 0) continue

    const tableName = getTableName(entry.table)
    const result = await db.execute(sql.raw(`SELECT COUNT(*)::int AS count FROM "${tableName}"`))
    const count = (result.rows[0] as { count: number }).count

    if (count > 0) {
      console.log(`  ~ ${tableName}: skipped (${count} existing rows)`)
      continue
    }

    await db.insert(entry.table as never).values(entry.rows as never)
    console.log(`  ✓ ${tableName}: seeded ${entry.rows.length} rows`)
  }
}

export async function truncateAllTables() {
  const tables = (Object.values(schema) as unknown[]).filter((v): v is Table => is(v, Table))

  if (tables.length === 0) return

  const tableNames = tables.map((t) => `"${getTableName(t)}"`).join(", ")
  await db.execute(sql.raw(`TRUNCATE TABLE ${tableNames} RESTART IDENTITY CASCADE`))
}
