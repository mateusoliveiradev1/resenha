import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").unique().notNull(),
    passwordHash: text("password_hash").notNull(),
    name: text("name").notNull(),
    role: text("role", { enum: ["ADMIN", "EDITOR"] }).default("EDITOR").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});
