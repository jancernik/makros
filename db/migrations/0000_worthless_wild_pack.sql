CREATE TYPE "public"."food_unit" AS ENUM('g', 'ml', 'unit');--> statement-breakpoint
CREATE TABLE "daily_targets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"day_plan_id" uuid NOT NULL,
	"calories" numeric(10, 2) DEFAULT 0 NOT NULL,
	"protein" numeric(10, 2) DEFAULT 0 NOT NULL,
	"carbohydrates" numeric(10, 2) DEFAULT 0 NOT NULL,
	"fat" numeric(10, 2) DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "daily_targets_day_plan_id_unique" UNIQUE("day_plan_id"),
	CONSTRAINT "daily_targets_calories_nonnegative" CHECK ("daily_targets"."calories" >= 0),
	CONSTRAINT "daily_targets_protein_nonnegative" CHECK ("daily_targets"."protein" >= 0),
	CONSTRAINT "daily_targets_carbohydrates_nonnegative" CHECK ("daily_targets"."carbohydrates" >= 0),
	CONSTRAINT "daily_targets_fat_nonnegative" CHECK ("daily_targets"."fat" >= 0)
);
--> statement-breakpoint
CREATE TABLE "day_plan_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"day_plan_id" uuid NOT NULL,
	"food_id" uuid NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"consumed_amount" numeric(10, 2) DEFAULT 0 NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "day_plan_items_amount_positive" CHECK ("day_plan_items"."amount" > 0),
	CONSTRAINT "day_plan_items_consumed_amount_nonnegative" CHECK ("day_plan_items"."consumed_amount" >= 0),
	CONSTRAINT "day_plan_items_consumed_amount_lte_amount" CHECK ("day_plan_items"."consumed_amount" <= "day_plan_items"."amount"),
	CONSTRAINT "day_plan_items_position_nonnegative" CHECK ("day_plan_items"."position" >= 0)
);
--> statement-breakpoint
CREATE TABLE "day_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"date" date NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "foods" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"unit" "food_unit" NOT NULL,
	"base_amount" numeric(10, 2) NOT NULL,
	"calories" numeric(10, 2) DEFAULT 0 NOT NULL,
	"protein" numeric(10, 2) DEFAULT 0 NOT NULL,
	"carbohydrates" numeric(10, 2) DEFAULT 0 NOT NULL,
	"fat" numeric(10, 2) DEFAULT 0 NOT NULL,
	"notes" text,
	"hidden" boolean DEFAULT false NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "foods_base_amount_positive" CHECK ("foods"."base_amount" > 0),
	CONSTRAINT "foods_calories_nonnegative" CHECK ("foods"."calories" >= 0),
	CONSTRAINT "foods_protein_nonnegative" CHECK ("foods"."protein" >= 0),
	CONSTRAINT "foods_carbohydrates_nonnegative" CHECK ("foods"."carbohydrates" >= 0),
	CONSTRAINT "foods_fat_nonnegative" CHECK ("foods"."fat" >= 0),
	CONSTRAINT "foods_position_nonnegative" CHECK ("foods"."position" >= 0)
);
--> statement-breakpoint
ALTER TABLE "daily_targets" ADD CONSTRAINT "daily_targets_day_plan_id_day_plans_id_fk" FOREIGN KEY ("day_plan_id") REFERENCES "public"."day_plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "day_plan_items" ADD CONSTRAINT "day_plan_items_day_plan_id_day_plans_id_fk" FOREIGN KEY ("day_plan_id") REFERENCES "public"."day_plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "day_plan_items" ADD CONSTRAINT "day_plan_items_food_id_foods_id_fk" FOREIGN KEY ("food_id") REFERENCES "public"."foods"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "day_plan_items_day_plan_id_idx" ON "day_plan_items" USING btree ("day_plan_id");--> statement-breakpoint
CREATE INDEX "day_plan_items_food_id_idx" ON "day_plan_items" USING btree ("food_id");--> statement-breakpoint
CREATE INDEX "day_plan_items_position_idx" ON "day_plan_items" USING btree ("position");--> statement-breakpoint
CREATE UNIQUE INDEX "day_plans_date_unique" ON "day_plans" USING btree ("date");--> statement-breakpoint
CREATE UNIQUE INDEX "foods_name_unique" ON "foods" USING btree ("name");--> statement-breakpoint
CREATE INDEX "foods_name_idx" ON "foods" USING btree ("name");--> statement-breakpoint
CREATE INDEX "foods_position_idx" ON "foods" USING btree ("position");