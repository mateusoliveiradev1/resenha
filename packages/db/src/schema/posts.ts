import { pgTable, text, timestamp, uuid, boolean, integer } from "drizzle-orm/pg-core";
import { matches } from "./matches";
import { relations } from "drizzle-orm";

export const posts = pgTable("posts", {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    slug: text("slug").unique().notNull(),
    content: text("content").notNull(),
    excerpt: text("excerpt").notNull(),
    coverImage: text("cover_image"),
    author: text("author").notNull(),
    readingTimeMin: integer("reading_time_min").notNull(),
    category: text("category", { enum: ["NOTICIA", "RESULTADO", "CRONICA", "BASTIDORES"] }).notNull(),
    matchId: uuid("match_id").references(() => matches.id, { onDelete: "set null" }),
    isPublished: boolean("is_published").default(false).notNull(),
    publishedAt: timestamp("published_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const postsRelations = relations(posts, ({ one }) => ({
    match: one(matches, {
        fields: [posts.matchId],
        references: [matches.id],
    }),
}));
