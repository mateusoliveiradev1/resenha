ALTER TABLE "matches" ADD COLUMN IF NOT EXISTS "tiebreak_home" integer;
ALTER TABLE "matches" ADD COLUMN IF NOT EXISTS "tiebreak_away" integer;
