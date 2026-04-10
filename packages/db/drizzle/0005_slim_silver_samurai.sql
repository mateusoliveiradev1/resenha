CREATE TABLE "match_appearances" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"match_id" uuid NOT NULL,
	"player_id" uuid NOT NULL,
	"minutes_played" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "match_appearances" ADD CONSTRAINT "match_appearances_match_id_matches_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match_appearances" ADD CONSTRAINT "match_appearances_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "match_appearances_match_player_idx" ON "match_appearances" USING btree ("match_id","player_id");
--> statement-breakpoint
INSERT INTO "match_appearances" ("match_id", "player_id", "minutes_played")
SELECT "match_id", "player_id", "minutes_played"
FROM "match_stats";
