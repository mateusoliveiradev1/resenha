CREATE TABLE "commercial_offer_contents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"offer_key" text NOT NULL,
	"slot" text DEFAULT 'addon' NOT NULL,
	"title" text NOT NULL,
	"badge" text,
	"audience" text,
	"description" text NOT NULL,
	"inclusions" jsonb,
	"note" text,
	"cta_label" text,
	"display_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "editorial_offerings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"label" text DEFAULT 'Oferecimento' NOT NULL,
	"partner_name" text NOT NULL,
	"title" text,
	"description" text,
	"href" text,
	"link_label" text DEFAULT 'Conhecer parceiro' NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "monetization_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_name" text NOT NULL,
	"source" text,
	"journey" text,
	"label" text,
	"destination" text,
	"partner_name" text,
	"url" text,
	"plan_name" text,
	"offer_name" text,
	"page" text,
	"question" text,
	"raw_payload" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "monetization_leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"journey" text NOT NULL,
	"source" text DEFAULT 'lead_form' NOT NULL,
	"status" text DEFAULT 'NEW' NOT NULL,
	"name" text NOT NULL,
	"company" text,
	"whatsapp" text NOT NULL,
	"email" text,
	"city" text,
	"support_type" text,
	"support_description" text,
	"advertising_option" text,
	"business_type" text,
	"instagram_or_site" text,
	"message" text,
	"raw_payload" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "editorial_offering_id" uuid;--> statement-breakpoint
ALTER TABLE "sponsors" ADD COLUMN "relationship_type" text DEFAULT 'CLUB_SPONSOR' NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "commercial_offer_contents_offer_key_unique" ON "commercial_offer_contents" USING btree ("offer_key");--> statement-breakpoint
CREATE INDEX "commercial_offer_contents_active_order_idx" ON "commercial_offer_contents" USING btree ("is_active","display_order");--> statement-breakpoint
CREATE INDEX "editorial_offerings_active_order_idx" ON "editorial_offerings" USING btree ("is_active","display_order");--> statement-breakpoint
CREATE INDEX "monetization_events_event_source_idx" ON "monetization_events" USING btree ("event_name","source");--> statement-breakpoint
CREATE INDEX "monetization_events_created_at_idx" ON "monetization_events" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "monetization_leads_journey_idx" ON "monetization_leads" USING btree ("journey");--> statement-breakpoint
CREATE INDEX "monetization_leads_status_idx" ON "monetization_leads" USING btree ("status");--> statement-breakpoint
CREATE INDEX "monetization_leads_created_at_idx" ON "monetization_leads" USING btree ("created_at");--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_editorial_offering_id_editorial_offerings_id_fk" FOREIGN KEY ("editorial_offering_id") REFERENCES "public"."editorial_offerings"("id") ON DELETE set null ON UPDATE no action;