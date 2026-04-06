import { pgTable, text, timestamp, uuid, integer } from "drizzle-orm/pg-core";

export const matches = pgTable("matches", {
    id: uuid("id").primaryKey().defaultRandom(),
    date: timestamp("date").notNull(),
    opponent: text("opponent").notNull(),
    opponentLogo: text("opponent_logo"),
    type: text("type", { enum: ["FUTSAL", "CAMPO"] }).notNull(),
    location: text("location").notNull(),
    scoreHome: integer("score_home"),
    scoreAway: integer("score_away"),
    status: text("status", { enum: ["SCHEDULED", "LIVE", "FINISHED"] }).default("SCHEDULED").notNull(),
    season: text("season").notNull(),
    summary: text("summary"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});
