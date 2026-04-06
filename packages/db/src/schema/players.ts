import { pgTable, text, timestamp, uuid, boolean, integer, date } from "drizzle-orm/pg-core";

export const players = pgTable("players", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  nickname: text("nickname").notNull(),
  position: text("position", { enum: ["GOL", "DEF", "MEI", "ATA"] }).notNull(),
  shirtNumber: integer("shirt_number").notNull(),
  photoUrl: text("photo_url"),
  bio: text("bio"),
  heightCm: integer("height_cm"),
  weightKg: integer("weight_kg"),
  birthDate: date("birth_date"),
  preferredFoot: text("preferred_foot", { enum: ["DIREITO", "ESQUERDO", "AMBIDESTRO"] }),
  goals: integer("goals").default(0).notNull(),
  assists: integer("assists").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
