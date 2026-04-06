import { db } from "./src/index";
import { players } from "./src/schema";
import { eq } from "drizzle-orm";

const roster = [
    { shirtNumber: 1, name: "Jefete", nickname: "Jefete", position: "GOL" },
    { shirtNumber: 2, name: "Romilson", nickname: "Romilson", position: "DEF" },
    { shirtNumber: 3, name: "Pedro", nickname: "Gari", position: "DEF" },
    { shirtNumber: 4, name: "Vanderson", nickname: "Vandão", position: "DEF", goals: 2 },
    { shirtNumber: 5, name: "Miguel", nickname: "Miguel", position: "MEI" },
    { shirtNumber: 6, name: "Lucas", nickname: "TioFay", position: "DEF" },
    { shirtNumber: 7, name: "Mateus", nickname: "Mineiro", position: "ATA", goals: 1 },
    { shirtNumber: 8, name: "Du", nickname: "Du", position: "MEI" },
    { shirtNumber: 9, name: "Diemes", nickname: "Bolt", position: "ATA", goals: 5 },
    { shirtNumber: 10, name: "Dani", nickname: "Peba", position: "ATA", goals: 3 },
    { shirtNumber: 11, name: "Juninho", nickname: "Juninho", position: "MEI", goals: 2 },
    { shirtNumber: 13, name: "Gabriel", nickname: "Gabriel", position: "MEI" },
    { shirtNumber: 14, name: "Wiliam", nickname: "Wiliam", position: "DEF" },
    { shirtNumber: 15, name: "Gabriel Eugênio", nickname: "Eugênio", position: "MEI" },
    { shirtNumber: 16, name: "Robert", nickname: "Morumbi", position: "MEI" },
    { shirtNumber: 17, name: "Reizinho", nickname: "Reizinho", position: "MEI" },
    { shirtNumber: 18, name: "Ismael", nickname: "Banana", position: "MEI" },
    { shirtNumber: 19, name: "Victor Athaide", nickname: "Victor", position: "MEI" },
    { shirtNumber: 30, name: "Pablo", nickname: "Pablo", position: "DEF" },
    { shirtNumber: 77, name: "Viny Ferreira", nickname: "Viny", position: "MEI", goals: 1 },
    { shirtNumber: 80, name: "Lucas Gomes", nickname: "Gomes", position: "DEF" },
    { shirtNumber: 99, name: "Matheus", nickname: "Maloka", position: "ATA", goals: 1 },
];

async function seed() {
    console.log("Seeding players...");

    for (const p of roster) {
        const existing = await db.query.players.findFirst({
            where: eq(players.shirtNumber, p.shirtNumber)
        });

        if (!existing) {
            await db.insert(players).values({
                name: p.name,
                nickname: p.nickname,
                shirtNumber: p.shirtNumber,
                position: p.position as any,
                goals: p.goals || 0,
            });
            console.log(`+ Inserted ${p.nickname} (#${p.shirtNumber})`);
        } else {
            await db.update(players).set({
                goals: p.goals || 0,
                nickname: p.nickname,
            }).where(eq(players.id, existing.id));
            console.log(`~ Updated ${p.nickname} (#${p.shirtNumber})`);
        }
    }

    console.log("Done seeding players!");
    process.exit(0);
}

seed().catch(err => {
    console.error(err);
    process.exit(1);
});
