import { getTableName, is, sql, Table } from "drizzle-orm"

import { db } from "../index"
import * as schema from "../schema"

export async function truncateAllTables() {
  const tables = (Object.values(schema) as unknown[]).filter((v): v is Table => is(v, Table))

  if (tables.length === 0) return

  const tableNames = tables.map((t) => `"${getTableName(t)}"`).join(", ")
  await db.execute(sql.raw(`TRUNCATE TABLE ${tableNames} RESTART IDENTITY CASCADE`))
}
