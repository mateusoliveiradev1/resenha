import { pgTable, text, timestamp, uuid, boolean, integer } from "drizzle-orm/pg-core";

export const sponsors = pgTable("sponsors", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    logoUrl: text("logo_url"),
    websiteUrl: text("website_url"),
    description: text("description"),
    tier: text("tier", { enum: ["MASTER", "OURO", "PRATA", "APOIO"] }).default("APOIO").notNull(),
    relationshipType: text("relationship_type", { enum: ["CLUB_SPONSOR", "SITE_PARTNER", "SUPPORTER", "BOTH"] }).default("CLUB_SPONSOR").notNull(),
    displayOrder: integer("display_order").default(0).notNull(),
    featuredOnHome: boolean("featured_on_home").default(true).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
