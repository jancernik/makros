/* eslint-disable perfectionist/sort-objects */
import { relations, sql } from "drizzle-orm"
import {
  boolean,
  check,
  date,
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

export const foods = pgTable(
  "foods",
  {
    id: uuid("id").defaultRandom().primaryKey(),
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
    uniqueIndex("foods_name_unique").on(table.name),
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
    date: date("date", { mode: "string" }).notNull(),
    note: text("note"),
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }).defaultNow().notNull()
  },
  (table) => [uniqueIndex("day_plans_date_unique").on(table.date)]
)

export const dailyTargets = pgTable(
  "daily_targets",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    dayPlanId: uuid("day_plan_id")
      .notNull()
      .unique()
      .references(() => dayPlans.id, { onDelete: "cascade" }),
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
    dayPlanId: uuid("day_plan_id")
      .notNull()
      .references(() => dayPlans.id, { onDelete: "cascade" }),
    foodId: uuid("food_id")
      .notNull()
      .references(() => foods.id, { onDelete: "restrict" }),
    amount: numeric("amount", { mode: "number", precision: 10, scale: 2 }).notNull(),
    consumedAmount: numeric("consumed_amount", { mode: "number", precision: 10, scale: 2 })
      .notNull()
      .default(0),
    position: integer("position").notNull().default(0),
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }).defaultNow().notNull()
  },
  (table) => [
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

export const foodsRelations = relations(foods, ({ many }) => ({
  dayPlanItems: many(dayPlanItems)
}))

export const dayPlansRelations = relations(dayPlans, ({ many, one }) => ({
  items: many(dayPlanItems),
  target: one(dailyTargets, {
    fields: [dayPlans.id],
    references: [dailyTargets.dayPlanId]
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
