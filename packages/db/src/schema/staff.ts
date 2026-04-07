import { boolean, integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const staff = pgTable("staff", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    role: text("role").notNull(),
    photoUrl: text("photo_url"),
    displayOrder: integer("display_order").default(0).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
