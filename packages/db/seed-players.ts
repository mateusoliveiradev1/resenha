import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./src/schema";

const DATABASE_URL = process.env.DATABASE_URL!;

async function seed() {
    const sql = neon(DATABASE_URL);
    const db = drizzle(sql, { schema });

    console.log("🧹 Clearing old data...");
    await sql`TRUNCATE TABLE players, staff, matches, match_stats, posts, gallery CASCADE`;

    console.log("🌱 Seeding real players...");
    const playersData = [
        { name: "Jefete", nickname: "Jefete", position: "GOL" as const, shirtNumber: 1 },
        { name: "Romilson", nickname: "Romilson", position: "DEF" as const, shirtNumber: 2 },
        { name: "Pedro", nickname: "Gari", position: "DEF" as const, shirtNumber: 3 },
        { name: "Vanderson", nickname: "Vandão", position: "DEF" as const, shirtNumber: 4 },
        { name: "Miguel", nickname: "Miguel", position: "MEI" as const, shirtNumber: 5 },
        { name: "Lucas", nickname: "TioFay", position: "DEF" as const, shirtNumber: 6 },
        { name: "Mateus", nickname: "Mineiro", position: "ATA" as const, shirtNumber: 7 },
        { name: "Du", nickname: "Du", position: "MEI" as const, shirtNumber: 8 },
        { name: "Diemes", nickname: "Bolt", position: "ATA" as const, shirtNumber: 9 },
        { name: "Dani", nickname: "Peba", position: "ATA" as const, shirtNumber: 10 },
        { name: "Juninho", nickname: "Juninho", position: "MEI" as const, shirtNumber: 11 },
        { name: "Gabriel", nickname: "Gabriel", position: "DEF" as const, shirtNumber: 13 },
        { name: "Wiliam", nickname: "Wiliam", position: "DEF" as const, shirtNumber: 14 },
        { name: "Gabriel Eugênio", nickname: "Gabriel E.", position: "MEI" as const, shirtNumber: 15 },
        { name: "Robert", nickname: "Morumbi", position: "MEI" as const, shirtNumber: 16 },
        { name: "Reizinho", nickname: "Reizinho", position: "MEI" as const, shirtNumber: 17 },
        { name: "Ismael", nickname: "Banana", position: "MEI" as const, shirtNumber: 18 },
        { name: "Victor Athaide", nickname: "Victor", position: "MEI" as const, shirtNumber: 19 },
        { name: "Pablo", nickname: "Pablo", position: "DEF" as const, shirtNumber: 30 },
        { name: "Viny", nickname: "Viny", position: "MEI" as const, shirtNumber: 77 },
        { name: "Lucas Gomes", nickname: "Lucas", position: "DEF" as const, shirtNumber: 80 },
        { name: "Matheus", nickname: "Maloka", position: "ATA" as const, shirtNumber: 99 },
    ];

    await db.insert(schema.players).values(playersData);

    console.log("🌱 Seeding technical staff...");
    const staffData = [
        { name: "Viny Ferreira", role: "Técnico" },
        { name: "Eduardo Souza", role: "Auxiliar" },
        { name: "Luiz Otávio", role: "Roupeiro" },
        { name: "Jéssica", role: "Marketing" },
        { name: "Matheus", role: "Marketing" },
        { name: "Eduardo Souza", role: "Diretoria" },
        { name: "Vanderson Santana", role: "Diretoria" },
        { name: "Lucas Gomes", role: "Presidência" },
        { name: "Vinícius Ferreira", role: "Presidência" },
    ];

    await db.insert(schema.staff).values(staffData);

    console.log("✅ Seed completed successfully! All mocks cleared and real players/staff inserted.");
}

seed().catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
});
