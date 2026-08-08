/* eslint-disable perfectionist/sort-objects */
import { relations, sql } from "drizzle-orm"
import {
  boolean,
  check,
  date,
  foreignKey,
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid
} from "drizzle-orm/pg-core"

export const foodUnitEnum = pgEnum("food_unit", ["g", "ml", "unit"])
export const weightTargetTypeEnum = pgEnum("weight_target_type", ["rate", "fixed"])

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    username: text("username").notNull(),
    passwordHash: text("password_hash").notNull(),
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }).defaultNow().notNull()
  },
  (table) => [uniqueIndex("users_username_unique").on(sql`lower(${table.username})`)]
)

export const foods = pgTable(
  "foods",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    unit: foodUnitEnum("unit").notNull(),
    baseAmount: numeric("base_amount", { mode: "number", precision: 10, scale: 2 }).notNull(),
    calories: numeric("calories", { mode: "number", precision: 10, scale: 2 }).notNull().default(0),
    protein: numeric("protein", { mode: "number", precision: 10, scale: 2 }).notNull().default(0),
    carbohydrates: numeric("carbohydrates", { mode: "number", precision: 10, scale: 2 })
      .notNull()
      .default(0),
    fat: numeric("fat", { mode: "number", precision: 10, scale: 2 }).notNull().default(0),
    notes: text("notes"),
    hidden: boolean("hidden").notNull().default(false),
    position: integer("position").notNull().default(0),
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }).defaultNow().notNull()
  },
  (table) => [
    uniqueIndex("foods_user_id_name_unique").on(table.userId, table.name),
    uniqueIndex("foods_id_user_id_unique").on(table.id, table.userId),
    index("foods_user_id_idx").on(table.userId),
    index("foods_name_idx").on(table.name),
    index("foods_position_idx").on(table.position),

    check("foods_base_amount_positive", sql`${table.baseAmount} > 0`),
    check("foods_calories_nonnegative", sql`${table.calories} >= 0`),
    check("foods_protein_nonnegative", sql`${table.protein} >= 0`),
    check("foods_carbohydrates_nonnegative", sql`${table.carbohydrates} >= 0`),
    check("foods_fat_nonnegative", sql`${table.fat} >= 0`),
    check("foods_position_nonnegative", sql`${table.position} >= 0`)
  ]
)

export const dayPlans = pgTable(
  "day_plans",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    date: date("date", { mode: "string" }).notNull(),
    note: text("note"),
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }).defaultNow().notNull()
  },
  (table) => [
    uniqueIndex("day_plans_user_id_date_unique").on(table.userId, table.date),
    uniqueIndex("day_plans_id_user_id_unique").on(table.id, table.userId),
    index("day_plans_user_id_idx").on(table.userId)
  ]
)

export const dailyTargets = pgTable(
  "daily_targets",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    dayPlanId: uuid("day_plan_id").notNull().unique(),
    calories: numeric("calories", { mode: "number", precision: 10, scale: 2 }).notNull().default(0),
    protein: numeric("protein", { mode: "number", precision: 10, scale: 2 }).notNull().default(0),
    carbohydrates: numeric("carbohydrates", { mode: "number", precision: 10, scale: 2 })
      .notNull()
      .default(0),
    fat: numeric("fat", { mode: "number", precision: 10, scale: 2 }).notNull().default(0),
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }).defaultNow().notNull()
  },
  (table) => [
    foreignKey({
      columns: [table.dayPlanId, table.userId],
      foreignColumns: [dayPlans.id, dayPlans.userId],
      name: "daily_targets_day_plan_id_user_id_fk"
    }).onDelete("cascade"),
    index("daily_targets_user_id_idx").on(table.userId),

    check("daily_targets_calories_nonnegative", sql`${table.calories} >= 0`),
    check("daily_targets_protein_nonnegative", sql`${table.protein} >= 0`),
    check("daily_targets_carbohydrates_nonnegative", sql`${table.carbohydrates} >= 0`),
    check("daily_targets_fat_nonnegative", sql`${table.fat} >= 0`)
  ]
)

export const dayPlanItems = pgTable(
  "day_plan_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    dayPlanId: uuid("day_plan_id").notNull(),
    foodId: uuid("food_id").notNull(),
    amount: numeric("amount", { mode: "number", precision: 10, scale: 2 }).notNull(),
    consumedAmount: numeric("consumed_amount", { mode: "number", precision: 10, scale: 2 })
      .notNull()
      .default(0),
    position: integer("position").notNull().default(0),
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }).defaultNow().notNull()
  },
  (table) => [
    foreignKey({
      columns: [table.dayPlanId, table.userId],
      foreignColumns: [dayPlans.id, dayPlans.userId],
      name: "day_plan_items_day_plan_id_user_id_fk"
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.foodId, table.userId],
      foreignColumns: [foods.id, foods.userId],
      name: "day_plan_items_food_id_user_id_fk"
    }).onDelete("restrict"),

    index("day_plan_items_user_id_idx").on(table.userId),
    index("day_plan_items_day_plan_id_idx").on(table.dayPlanId),
    index("day_plan_items_food_id_idx").on(table.foodId),
    index("day_plan_items_position_idx").on(table.position),

    check("day_plan_items_amount_positive", sql`${table.amount} > 0`),
    check("day_plan_items_consumed_amount_nonnegative", sql`${table.consumedAmount} >= 0`),
    check(
      "day_plan_items_consumed_amount_lte_amount",
      sql`${table.consumedAmount} <= ${table.amount}`
    ),
    check("day_plan_items_position_nonnegative", sql`${table.position} >= 0`)
  ]
)

export const weightEntries = pgTable(
  "weight_entries",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    date: date("date", { mode: "string" }).notNull(),
    weight: numeric("weight", { mode: "number", precision: 5, scale: 2 }).notNull(),
    note: text("note"),
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }).defaultNow().notNull()
  },
  (table) => [
    uniqueIndex("weight_entries_user_id_date_unique").on(table.userId, table.date),
    index("weight_entries_user_id_idx").on(table.userId),
    check("weight_entries_weight_positive", sql`${table.weight} > 0`)
  ]
)

export const weightTargets = pgTable(
  "weight_targets",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: weightTargetTypeEnum("type").notNull().default("fixed"),
    startDate: date("start_date", { mode: "string" }),
    endDate: date("end_date", { mode: "string" }),
    startWeight: numeric("start_weight", { mode: "number", precision: 5, scale: 2 }),
    minTargetRate: numeric("min_target_rate", { mode: "number", precision: 5, scale: 3 }),
    maxTargetRate: numeric("max_target_rate", { mode: "number", precision: 5, scale: 3 }),
    targetWeight: numeric("target_weight", { mode: "number", precision: 5, scale: 2 }),
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }).defaultNow().notNull()
  },
  (table) => [index("weight_targets_user_id_idx").on(table.userId)]
)

export const usersRelations = relations(users, ({ many }) => ({
  dayPlans: many(dayPlans),
  foods: many(foods),
  weightEntries: many(weightEntries),
  weightTargets: many(weightTargets)
}))

export const foodsRelations = relations(foods, ({ many, one }) => ({
  dayPlanItems: many(dayPlanItems),
  user: one(users, {
    fields: [foods.userId],
    references: [users.id]
  })
}))

export const dayPlansRelations = relations(dayPlans, ({ many, one }) => ({
  items: many(dayPlanItems),
  target: one(dailyTargets, {
    fields: [dayPlans.id],
    references: [dailyTargets.dayPlanId]
  }),
  user: one(users, {
    fields: [dayPlans.userId],
    references: [users.id]
  })
}))

export const dailyTargetsRelations = relations(dailyTargets, ({ one }) => ({
  dayPlan: one(dayPlans, {
    fields: [dailyTargets.dayPlanId],
    references: [dayPlans.id]
  })
}))

export const dayPlanItemsRelations = relations(dayPlanItems, ({ one }) => ({
  dayPlan: one(dayPlans, {
    fields: [dayPlanItems.dayPlanId],
    references: [dayPlans.id]
  }),
  food: one(foods, {
    fields: [dayPlanItems.foodId],
    references: [foods.id]
  })
}))

export type DailyTarget = typeof dailyTargets.$inferSelect
export type DayPlan = typeof dayPlans.$inferSelect
export type DayPlanItem = typeof dayPlanItems.$inferSelect
export type Food = typeof foods.$inferSelect
export type NewDailyTarget = typeof dailyTargets.$inferInsert
export type NewDayPlan = typeof dayPlans.$inferInsert
export type NewDayPlanItem = typeof dayPlanItems.$inferInsert
export type NewFood = typeof foods.$inferInsert
export type NewUser = typeof users.$inferInsert
export type NewWeightEntry = typeof weightEntries.$inferInsert
export type NewWeightTarget = typeof weightTargets.$inferInsert
export type User = typeof users.$inferSelect
export type WeightEntry = typeof weightEntries.$inferSelect
export type WeightTarget = typeof weightTargets.$inferSelect
