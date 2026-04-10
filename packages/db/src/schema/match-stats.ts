import { pgTable, timestamp, uuid, integer } from "drizzle-orm/pg-core";
import { players } from "./players";
import { matches } from "./matches";
import { relations } from "drizzle-orm";

export const matchStats = pgTable("match_stats", {
    id: uuid("id").primaryKey().defaultRandom(),
    matchId: uuid("match_id").references(() => matches.id, { onDelete: "cascade" }).notNull(),
    playerId: uuid("player_id").references(() => players.id, { onDelete: "cascade" }).notNull(),
    goals: integer("goals").default(0).notNull(),
    assists: integer("assists").default(0).notNull(),
    yellowCards: integer("yellow_cards").default(0).notNull(),
    redCards: integer("red_cards").default(0).notNull(),
    minutesPlayed: integer("minutes_played"),
});

export const matchStatsRelations = relations(matchStats, ({ one }) => ({
    match: one(matches, {
        fields: [matchStats.matchId],
        references: [matches.id],
    }),
    player: one(players, {
        fields: [matchStats.playerId],
        references: [players.id],
    }),
}));
