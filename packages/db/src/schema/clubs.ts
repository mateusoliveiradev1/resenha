import { boolean, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

export const clubs = pgTable(
    "clubs",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        name: text("name").notNull(),
        shortName: text("short_name").notNull(),
        slug: text("slug").notNull(),
        logoUrl: text("logo_url"),
        city: text("city"),
        isResenha: boolean("is_resenha").default(false).notNull(),
        isActive: boolean("is_active").default(true).notNull(),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at").defaultNow().notNull(),
    },
    (table) => ({
        clubsSlugUnique: uniqueIndex("clubs_slug_unique").on(table.slug),
    })
);
