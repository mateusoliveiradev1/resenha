import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { matches } from "./matches";
import { relations } from "drizzle-orm";

export const gallery = pgTable("gallery", {
    id: uuid("id").primaryKey().defaultRandom(),
    url: text("url").notNull(),
    caption: text("caption").notNull(),
    matchId: uuid("match_id").references(() => matches.id, { onDelete: "set null" }),
    uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

export const galleryRelations = relations(gallery, ({ one }) => ({
    match: one(matches, {
        fields: [gallery.matchId],
        references: [matches.id],
    }),
}));
