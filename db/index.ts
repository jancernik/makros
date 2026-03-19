import { drizzle } from "drizzle-orm/node-postgres"
import { dbEnv } from "./env"
import * as schema from "./schema"

export const db = drizzle(dbEnv.url, { schema })
