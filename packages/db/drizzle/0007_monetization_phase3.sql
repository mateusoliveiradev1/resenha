CREATE TABLE "commercial_campaign_packages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campaign_key" text NOT NULL,
	"title" text NOT NULL,
	"package_type" text DEFAULT 'round' NOT NULL,
	"status" text DEFAULT 'DRAFT' NOT NULL,
	"sponsor_id" uuid,
	"partner_name" text,
	"round_label" text,
	"season_label" text,
	"description" text NOT NULL,
	"placements" jsonb,
	"starts_at" timestamp,
	"ends_at" timestamp,
	"display_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "copy_cta_experiments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"experiment_key" text NOT NULL,
	"surface" text NOT NULL,
	"journey" text NOT NULL,
	"variant_label" text NOT NULL,
	"headline" text,
	"supporting_copy" text,
	"cta_label" text,
	"destination" text,
	"traffic_weight" integer DEFAULT 100 NOT NULL,
	"min_sample_size" integer DEFAULT 100 NOT NULL,
	"starts_at" timestamp,
	"ends_at" timestamp,
	"notes" text,
	"is_active" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lead_follow_up_automations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"channel" text DEFAULT 'whatsapp' NOT NULL,
	"journey" text,
	"trigger_status" text DEFAULT 'NEW' NOT NULL,
	"destination_hint" text,
	"message_template" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "premium_partner_pages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"sponsor_id" uuid,
	"partner_name" text NOT NULL,
	"title" text NOT NULL,
	"summary" text NOT NULL,
	"body" text,
	"hero_image_url" text,
	"cta_label" text DEFAULT 'Conhecer parceiro' NOT NULL,
	"cta_href" text,
	"display_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT false NOT NULL,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "commercial_campaign_packages" ADD CONSTRAINT "commercial_campaign_packages_sponsor_id_sponsors_id_fk" FOREIGN KEY ("sponsor_id") REFERENCES "public"."sponsors"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "premium_partner_pages" ADD CONSTRAINT "premium_partner_pages_sponsor_id_sponsors_id_fk" FOREIGN KEY ("sponsor_id") REFERENCES "public"."sponsors"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "commercial_campaign_packages_campaign_key_unique" ON "commercial_campaign_packages" USING btree ("campaign_key");--> statement-breakpoint
CREATE INDEX "commercial_campaign_packages_active_status_idx" ON "commercial_campaign_packages" USING btree ("is_active","status","display_order");--> statement-breakpoint
CREATE UNIQUE INDEX "copy_cta_experiments_experiment_key_unique" ON "copy_cta_experiments" USING btree ("experiment_key");--> statement-breakpoint
CREATE INDEX "copy_cta_experiments_active_surface_idx" ON "copy_cta_experiments" USING btree ("is_active","surface","journey");--> statement-breakpoint
CREATE INDEX "lead_follow_up_automations_active_trigger_idx" ON "lead_follow_up_automations" USING btree ("is_active","journey","trigger_status");--> statement-breakpoint
CREATE UNIQUE INDEX "premium_partner_pages_slug_unique" ON "premium_partner_pages" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "premium_partner_pages_active_order_idx" ON "premium_partner_pages" USING btree ("is_active","display_order");