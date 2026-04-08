import { boolean, integer, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { clubs } from "./clubs";

export const championships = pgTable(
    "championships",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        name: text("name").notNull(),
        slug: text("slug").notNull(),
        description: text("description"),
        seasonLabel: text("season_label").notNull(),
        surface: text("surface", { enum: ["CAMPO", "FUTSAL", "MISTO"] }).default("CAMPO").notNull(),
        format: text("format", { enum: ["LEAGUE", "GROUP_STAGE", "KNOCKOUT", "HYBRID"] }).default("LEAGUE").notNull(),
        status: text("status", { enum: ["PLANNED", "LIVE", "FINISHED"] }).default("PLANNED").notNull(),
        pointsPerWin: integer("points_per_win").default(3).notNull(),
        pointsPerDraw: integer("points_per_draw").default(1).notNull(),
        pointsPerLoss: integer("points_per_loss").default(0).notNull(),
        showStandings: boolean("show_standings").default(true).notNull(),
        startsAt: timestamp("starts_at"),
        endsAt: timestamp("ends_at"),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at").defaultNow().notNull(),
    },
    (table) => ({
        championshipsSlugUnique: uniqueIndex("championships_slug_unique").on(table.slug),
    })
);

export const championshipGroups = pgTable("championship_groups", {
    id: uuid("id").primaryKey().defaultRandom(),
    championshipId: uuid("championship_id")
        .references(() => championships.id, { onDelete: "cascade" })
        .notNull(),
    name: text("name").notNull(),
    phaseLabel: text("phase_label").default("FASE UNICA").notNull(),
    displayOrder: integer("display_order").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const championshipParticipants = pgTable(
    "championship_participants",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        championshipId: uuid("championship_id")
            .references(() => championships.id, { onDelete: "cascade" })
            .notNull(),
        clubId: uuid("club_id")
            .references(() => clubs.id, { onDelete: "cascade" })
            .notNull(),
        championshipGroupId: uuid("championship_group_id").references(() => championshipGroups.id, { onDelete: "set null" }),
        displayOrder: integer("display_order").default(0).notNull(),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at").defaultNow().notNull(),
    },
    (table) => ({
        championshipParticipantUnique: uniqueIndex("championship_participants_unique").on(table.championshipId, table.clubId),
    })
);
