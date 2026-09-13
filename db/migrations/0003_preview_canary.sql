CREATE TABLE "_preview_canary" (
	"id" integer PRIMARY KEY NOT NULL,
	"note" text NOT NULL
);
--> statement-breakpoint
INSERT INTO "_preview_canary" ("id", "note")
VALUES (1, 'Throwaway. Proves preview deployments migrate their own branch.');
