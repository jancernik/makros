CREATE TYPE "public"."weight_target_type" AS ENUM('rate', 'fixed');--> statement-breakpoint
CREATE TABLE "weight_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"date" date NOT NULL,
	"weight" numeric(5, 2) NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "weight_entries_weight_positive" CHECK ("weight_entries"."weight" > 0)
);
--> statement-breakpoint
CREATE TABLE "weight_targets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "weight_target_type" DEFAULT 'fixed' NOT NULL,
	"start_date" date,
	"end_date" date,
	"start_weight" numeric(5, 2),
	"min_target_rate" numeric(5, 3),
	"max_target_rate" numeric(5, 3),
	"target_weight" numeric(5, 2),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "weight_entries_date_unique" ON "weight_entries" USING btree ("date");