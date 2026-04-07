ALTER TABLE "staff" ADD COLUMN "photo_url" text;
--> statement-breakpoint
ALTER TABLE "staff" ADD COLUMN "display_order" integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
ALTER TABLE "staff" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;
