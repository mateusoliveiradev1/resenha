CREATE TABLE "clubs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"short_name" text NOT NULL,
	"slug" text NOT NULL,
	"logo_url" text,
	"city" text,
	"is_resenha" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "championship_groups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"championship_id" uuid NOT NULL,
	"name" text NOT NULL,
	"phase_label" text DEFAULT 'FASE UNICA' NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "championship_participants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"championship_id" uuid NOT NULL,
	"club_id" uuid NOT NULL,
	"championship_group_id" uuid,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "championships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"season_label" text NOT NULL,
	"surface" text DEFAULT 'CAMPO' NOT NULL,
	"format" text DEFAULT 'LEAGUE' NOT NULL,
	"status" text DEFAULT 'PLANNED' NOT NULL,
	"points_per_win" integer DEFAULT 3 NOT NULL,
	"points_per_draw" integer DEFAULT 1 NOT NULL,
	"points_per_loss" integer DEFAULT 0 NOT NULL,
	"show_standings" boolean DEFAULT true NOT NULL,
	"starts_at" timestamp,
	"ends_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "matches" ADD COLUMN "match_category" text DEFAULT 'FRIENDLY' NOT NULL;--> statement-breakpoint
ALTER TABLE "matches" ADD COLUMN "home_club_id" uuid;--> statement-breakpoint
ALTER TABLE "matches" ADD COLUMN "away_club_id" uuid;--> statement-breakpoint
ALTER TABLE "matches" ADD COLUMN "championship_id" uuid;--> statement-breakpoint
ALTER TABLE "matches" ADD COLUMN "championship_group_id" uuid;--> statement-breakpoint
ALTER TABLE "matches" ADD COLUMN "phase_label" text;--> statement-breakpoint
ALTER TABLE "matches" ADD COLUMN "round_label" text;--> statement-breakpoint
ALTER TABLE "matches" ADD COLUMN "matchday" integer;--> statement-breakpoint
ALTER TABLE "matches" ADD COLUMN "auto_status" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "matches" ADD COLUMN "duration_minutes" integer;--> statement-breakpoint
ALTER TABLE "matches" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "championship_groups" ADD CONSTRAINT "championship_groups_championship_id_championships_id_fk" FOREIGN KEY ("championship_id") REFERENCES "public"."championships"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "championship_participants" ADD CONSTRAINT "championship_participants_championship_id_championships_id_fk" FOREIGN KEY ("championship_id") REFERENCES "public"."championships"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "championship_participants" ADD CONSTRAINT "championship_participants_club_id_clubs_id_fk" FOREIGN KEY ("club_id") REFERENCES "public"."clubs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "championship_participants" ADD CONSTRAINT "championship_participants_championship_group_id_championship_groups_id_fk" FOREIGN KEY ("championship_group_id") REFERENCES "public"."championship_groups"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "clubs_slug_unique" ON "clubs" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "championship_participants_unique" ON "championship_participants" USING btree ("championship_id","club_id");--> statement-breakpoint
CREATE UNIQUE INDEX "championships_slug_unique" ON "championships" USING btree ("slug");--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_home_club_id_clubs_id_fk" FOREIGN KEY ("home_club_id") REFERENCES "public"."clubs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_away_club_id_clubs_id_fk" FOREIGN KEY ("away_club_id") REFERENCES "public"."clubs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_championship_id_championships_id_fk" FOREIGN KEY ("championship_id") REFERENCES "public"."championships"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_championship_group_id_championship_groups_id_fk" FOREIGN KEY ("championship_group_id") REFERENCES "public"."championship_groups"("id") ON DELETE set null ON UPDATE no action;