import { integer, pgTable, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { matches } from "./matches";
import { players } from "./players";

export const matchAppearances = pgTable(
    "match_appearances",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        matchId: uuid("match_id").references(() => matches.id, { onDelete: "cascade" }).notNull(),
        playerId: uuid("player_id").references(() => players.id, { onDelete: "cascade" }).notNull(),
        minutesPlayed: integer("minutes_played"),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at").defaultNow().notNull(),
    },
    (table) => ({
        matchPlayerUniqueIdx: uniqueIndex("match_appearances_match_player_idx").on(table.matchId, table.playerId),
    }),
);

export const matchAppearancesRelations = relations(matchAppearances, ({ one }) => ({
    match: one(matches, {
        fields: [matchAppearances.matchId],
        references: [matches.id],
    }),
    player: one(players, {
        fields: [matchAppearances.playerId],
        references: [players.id],
    }),
}));
