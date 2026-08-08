UPDATE "foods" SET "user_id" = (SELECT "id" FROM "users" ORDER BY "created_at" LIMIT 1) WHERE "user_id" IS NULL;--> statement-breakpoint
UPDATE "day_plans" SET "user_id" = (SELECT "id" FROM "users" ORDER BY "created_at" LIMIT 1) WHERE "user_id" IS NULL;--> statement-breakpoint
UPDATE "daily_targets" SET "user_id" = (SELECT "id" FROM "users" ORDER BY "created_at" LIMIT 1) WHERE "user_id" IS NULL;--> statement-breakpoint
UPDATE "day_plan_items" SET "user_id" = (SELECT "id" FROM "users" ORDER BY "created_at" LIMIT 1) WHERE "user_id" IS NULL;--> statement-breakpoint
UPDATE "weight_entries" SET "user_id" = (SELECT "id" FROM "users" ORDER BY "created_at" LIMIT 1) WHERE "user_id" IS NULL;--> statement-breakpoint
UPDATE "weight_targets" SET "user_id" = (SELECT "id" FROM "users" ORDER BY "created_at" LIMIT 1) WHERE "user_id" IS NULL;--> statement-breakpoint
ALTER TABLE "daily_targets" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "day_plan_items" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "day_plans" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "foods" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "weight_entries" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "weight_targets" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "daily_targets" DROP CONSTRAINT "daily_targets_day_plan_id_day_plans_id_fk";--> statement-breakpoint
ALTER TABLE "day_plan_items" DROP CONSTRAINT "day_plan_items_day_plan_id_day_plans_id_fk";--> statement-breakpoint
ALTER TABLE "day_plan_items" DROP CONSTRAINT "day_plan_items_food_id_foods_id_fk";--> statement-breakpoint
CREATE UNIQUE INDEX "foods_user_id_name_unique" ON "foods" USING btree ("user_id","name");--> statement-breakpoint
CREATE UNIQUE INDEX "foods_id_user_id_unique" ON "foods" USING btree ("id","user_id");--> statement-breakpoint
CREATE INDEX "foods_user_id_idx" ON "foods" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "day_plans_user_id_date_unique" ON "day_plans" USING btree ("user_id","date");--> statement-breakpoint
CREATE UNIQUE INDEX "day_plans_id_user_id_unique" ON "day_plans" USING btree ("id","user_id");--> statement-breakpoint
CREATE INDEX "day_plans_user_id_idx" ON "day_plans" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "daily_targets_user_id_idx" ON "daily_targets" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "day_plan_items_user_id_idx" ON "day_plan_items" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "weight_entries_user_id_date_unique" ON "weight_entries" USING btree ("user_id","date");--> statement-breakpoint
CREATE INDEX "weight_entries_user_id_idx" ON "weight_entries" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "weight_targets_user_id_idx" ON "weight_targets" USING btree ("user_id");--> statement-breakpoint
ALTER TABLE "foods" ADD CONSTRAINT "foods_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "day_plans" ADD CONSTRAINT "day_plans_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_targets" ADD CONSTRAINT "daily_targets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_targets" ADD CONSTRAINT "daily_targets_day_plan_id_user_id_fk" FOREIGN KEY ("day_plan_id","user_id") REFERENCES "public"."day_plans"("id","user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "day_plan_items" ADD CONSTRAINT "day_plan_items_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "day_plan_items" ADD CONSTRAINT "day_plan_items_day_plan_id_user_id_fk" FOREIGN KEY ("day_plan_id","user_id") REFERENCES "public"."day_plans"("id","user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "day_plan_items" ADD CONSTRAINT "day_plan_items_food_id_user_id_fk" FOREIGN KEY ("food_id","user_id") REFERENCES "public"."foods"("id","user_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "weight_entries" ADD CONSTRAINT "weight_entries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "weight_targets" ADD CONSTRAINT "weight_targets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
DROP INDEX "foods_name_unique";--> statement-breakpoint
DROP INDEX "day_plans_date_unique";--> statement-breakpoint
DROP INDEX "weight_entries_date_unique";
