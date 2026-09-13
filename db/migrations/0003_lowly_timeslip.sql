CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" text NOT NULL,
	"password_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "daily_targets" ADD COLUMN "user_id" uuid;--> statement-breakpoint
ALTER TABLE "day_plan_items" ADD COLUMN "user_id" uuid;--> statement-breakpoint
ALTER TABLE "day_plans" ADD COLUMN "user_id" uuid;--> statement-breakpoint
ALTER TABLE "foods" ADD COLUMN "user_id" uuid;--> statement-breakpoint
ALTER TABLE "weight_entries" ADD COLUMN "user_id" uuid;--> statement-breakpoint
ALTER TABLE "weight_targets" ADD COLUMN "user_id" uuid;--> statement-breakpoint
CREATE UNIQUE INDEX "users_username_unique" ON "users" USING btree (lower("username"));--> statement-breakpoint
INSERT INTO "users" ("id", "username", "password_hash")
SELECT '00000000-0000-0000-0000-000000000001', 'owner', '!'
WHERE EXISTS (
	SELECT 1 FROM "foods"
	UNION ALL SELECT 1 FROM "day_plans"
	UNION ALL SELECT 1 FROM "weight_entries"
	UNION ALL SELECT 1 FROM "weight_targets"
);
