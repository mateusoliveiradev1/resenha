ALTER TABLE "matches" ADD COLUMN IF NOT EXISTS "home_source_type" text;
ALTER TABLE "matches" ADD COLUMN IF NOT EXISTS "away_source_type" text;
ALTER TABLE "matches" ADD COLUMN IF NOT EXISTS "home_source_position" integer;
ALTER TABLE "matches" ADD COLUMN IF NOT EXISTS "away_source_position" integer;
ALTER TABLE "matches" ADD COLUMN IF NOT EXISTS "home_source_match_id" uuid;
ALTER TABLE "matches" ADD COLUMN IF NOT EXISTS "away_source_match_id" uuid;
ALTER TABLE "matches" ADD COLUMN IF NOT EXISTS "home_source_group_id" uuid;
ALTER TABLE "matches" ADD COLUMN IF NOT EXISTS "away_source_group_id" uuid;
