import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const staff = pgTable("staff", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    role: text("role").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
