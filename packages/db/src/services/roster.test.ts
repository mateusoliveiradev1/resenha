import { buildRosterSummaries } from "./roster";

const now = new Date("2026-04-10T12:00:00.000Z");

function assertEqual<T>(actual: T, expected: T, message?: string) {
    if (actual !== expected) {
        throw new Error(message ?? `Expected ${String(expected)}, received ${String(actual)}`);
    }
}

const players = [
    {
        id: "player-1",
        name: "Romilson Silva",
        nickname: "Romilson",
        position: "DEF" as const,
        shirtNumber: 2,
        photoUrl: null,
        birthDate: "2001-01-10",
        heightCm: 175,
        preferredFoot: "DIREITO" as const,
        goals: 0,
        assists: 0,
    },
    {
        id: "player-2",
        name: "Vandao Souza",
        nickname: "Vandao",
        position: "ATA" as const,
        shirtNumber: 4,
        photoUrl: null,
        birthDate: "2001-01-10",
        heightCm: 175,
        preferredFoot: "DIREITO" as const,
        goals: 0,
        assists: 0,
    },
];

const summaries = buildRosterSummaries({
    players,
    statTotals: [
        {
            playerId: "player-2",
            goals: 1,
            assists: 1,
        },
    ],
    appearanceTotals: [
        {
            playerId: "player-1",
            matchesPlayed: 2,
        },
        {
            playerId: "player-2",
            matchesPlayed: 2,
        },
    ],
    referenceDate: now,
});

const romilson = summaries.find((player) => player.id === "player-1");
const vandao = summaries.find((player) => player.id === "player-2");

if (!romilson || !vandao) {
    throw new Error("Expected roster summaries for both players");
}

assertEqual(romilson.stats.matchesPlayed, 2, "Player with no stat events must still count played matches");
assertEqual(romilson.stats.goals, 0);
assertEqual(vandao.stats.matchesPlayed, 2, "Player with one scoring game and two appearances must show two matches");
assertEqual(vandao.stats.goals, 1);
assertEqual(vandao.stats.assists, 1);

console.log("roster.test.ts passed");
