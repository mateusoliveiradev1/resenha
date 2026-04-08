import {
    buildStandings,
    type ChampionshipParticipantRecord,
    type ChampionshipRecord,
    type ClubRecord,
    type MatchRecord,
    presentMatches,
} from "./football";

const now = new Date("2026-05-30T12:00:00.000Z");

function assert(condition: unknown, message: string): asserts condition {
    if (!condition) {
        throw new Error(message);
    }
}

function assertEqual<T>(actual: T, expected: T, message?: string) {
    if (actual !== expected) {
        throw new Error(message ?? `Expected ${String(expected)}, received ${String(actual)}`);
    }
}

function assertDeepEqual(actual: unknown, expected: unknown, message?: string) {
    const actualJson = JSON.stringify(actual);
    const expectedJson = JSON.stringify(expected);

    if (actualJson !== expectedJson) {
        throw new Error(message ?? `Expected ${expectedJson}, received ${actualJson}`);
    }
}

function createClub(id: string, name: string, isResenha = false): ClubRecord {
    return {
        id,
        name,
        shortName: name,
        slug: id,
        logoUrl: null,
        city: null,
        isResenha,
        isActive: true,
        createdAt: now,
        updatedAt: now,
    };
}

function createParticipant(id: string, championshipId: string, clubId: string, displayOrder: number): ChampionshipParticipantRecord {
    return {
        id,
        championshipId,
        clubId,
        championshipGroupId: null,
        displayOrder,
        createdAt: now,
        updatedAt: now,
    };
}

function createMatch(overrides: Partial<MatchRecord> & Pick<MatchRecord, "id" | "date" | "type" | "location" | "season">): MatchRecord {
    return {
        id: overrides.id,
        date: overrides.date,
        opponent: overrides.opponent ?? "Adversario",
        opponentLogo: overrides.opponentLogo ?? null,
        matchCategory: overrides.matchCategory ?? "CHAMPIONSHIP",
        homeClubId: overrides.homeClubId ?? null,
        awayClubId: overrides.awayClubId ?? null,
        homeLabel: overrides.homeLabel ?? null,
        awayLabel: overrides.awayLabel ?? null,
        homeSourceType: overrides.homeSourceType ?? null,
        awaySourceType: overrides.awaySourceType ?? null,
        homeSourcePosition: overrides.homeSourcePosition ?? null,
        awaySourcePosition: overrides.awaySourcePosition ?? null,
        homeSourceMatchId: overrides.homeSourceMatchId ?? null,
        awaySourceMatchId: overrides.awaySourceMatchId ?? null,
        homeSourceGroupId: overrides.homeSourceGroupId ?? null,
        awaySourceGroupId: overrides.awaySourceGroupId ?? null,
        championshipId: overrides.championshipId ?? null,
        championshipGroupId: overrides.championshipGroupId ?? null,
        phaseLabel: overrides.phaseLabel ?? null,
        roundLabel: overrides.roundLabel ?? null,
        matchday: overrides.matchday ?? null,
        type: overrides.type,
        location: overrides.location,
        scoreHome: overrides.scoreHome ?? null,
        scoreAway: overrides.scoreAway ?? null,
        tiebreakHome: overrides.tiebreakHome ?? null,
        tiebreakAway: overrides.tiebreakAway ?? null,
        status: overrides.status ?? "SCHEDULED",
        autoStatus: overrides.autoStatus ?? true,
        durationMinutes: overrides.durationMinutes ?? null,
        season: overrides.season,
        summary: overrides.summary ?? null,
        createdAt: overrides.createdAt ?? now,
        updatedAt: overrides.updatedAt ?? now,
    };
}

const championship: ChampionshipRecord = {
    id: "championship-1",
    name: "Municipal",
    slug: "municipal",
    description: null,
    seasonLabel: "2026",
    surface: "FUTSAL",
    format: "HYBRID",
    status: "LIVE",
    pointsPerWin: 3,
    pointsPerDraw: 1,
    pointsPerLoss: 0,
    showStandings: true,
    startsAt: null,
    endsAt: null,
    createdAt: now,
    updatedAt: now,
};

const clubs: ClubRecord[] = [
    createClub("club-a", "Alfa"),
    createClub("club-b", "Beta"),
    createClub("club-c", "Gama", true),
    createClub("club-d", "Delta"),
];

const participants: ChampionshipParticipantRecord[] = [
    createParticipant("participant-a", championship.id, "club-a", 1),
    createParticipant("participant-b", championship.id, "club-b", 2),
    createParticipant("participant-c", championship.id, "club-c", 3),
    createParticipant("participant-d", championship.id, "club-d", 4),
];

const matches: MatchRecord[] = [
    createMatch({
        id: "match-1",
        championshipId: championship.id,
        championshipGroupId: "group-1",
        matchday: 1,
        date: new Date("2026-05-01T22:00:00.000Z"),
        type: "FUTSAL",
        location: "Quadra",
        season: championship.name,
        homeClubId: "club-a",
        awayClubId: "club-b",
        scoreHome: 3,
        scoreAway: 1,
        status: "FINISHED",
        phaseLabel: "Grupo Unico",
    }),
    createMatch({
        id: "match-2",
        championshipId: championship.id,
        championshipGroupId: "group-1",
        matchday: 2,
        date: new Date("2026-05-02T22:00:00.000Z"),
        type: "FUTSAL",
        location: "Quadra",
        season: championship.name,
        homeClubId: "club-c",
        awayClubId: "club-d",
        scoreHome: 2,
        scoreAway: 0,
        status: "FINISHED",
        phaseLabel: "Grupo Unico",
    }),
    createMatch({
        id: "match-3",
        championshipId: championship.id,
        championshipGroupId: "group-1",
        matchday: 3,
        date: new Date("2026-05-03T22:00:00.000Z"),
        type: "FUTSAL",
        location: "Quadra",
        season: championship.name,
        homeClubId: "club-a",
        awayClubId: "club-c",
        scoreHome: 0,
        scoreAway: 1,
        status: "FINISHED",
        phaseLabel: "Grupo Unico",
    }),
    createMatch({
        id: "match-4",
        championshipId: championship.id,
        championshipGroupId: "group-1",
        matchday: 4,
        date: new Date("2026-05-04T22:00:00.000Z"),
        type: "FUTSAL",
        location: "Quadra",
        season: championship.name,
        homeClubId: "club-b",
        awayClubId: "club-d",
        scoreHome: 4,
        scoreAway: 0,
        status: "FINISHED",
        phaseLabel: "Grupo Unico",
    }),
    createMatch({
        id: "match-37",
        championshipId: championship.id,
        matchday: 37,
        date: new Date("2026-05-26T22:30:00.000Z"),
        type: "FUTSAL",
        location: "Quadra",
        season: championship.name,
        homeLabel: "2o colocado",
        awayLabel: "3o colocado",
        homeSourceType: "GROUP_POSITION",
        awaySourceType: "GROUP_POSITION",
        homeSourcePosition: 2,
        awaySourcePosition: 3,
        scoreHome: 5,
        scoreAway: 2,
        status: "FINISHED",
        phaseLabel: "Semifinal",
    }),
    createMatch({
        id: "match-38",
        championshipId: championship.id,
        matchday: 38,
        date: new Date("2026-05-26T23:15:00.000Z"),
        type: "FUTSAL",
        location: "Quadra",
        season: championship.name,
        homeLabel: "1o colocado",
        awayLabel: "4o colocado",
        homeSourceType: "GROUP_POSITION",
        awaySourceType: "GROUP_POSITION",
        homeSourcePosition: 1,
        awaySourcePosition: 4,
        scoreHome: 1,
        scoreAway: 0,
        status: "FINISHED",
        phaseLabel: "Semifinal",
    }),
    createMatch({
        id: "match-40",
        championshipId: championship.id,
        matchday: 40,
        date: new Date("2026-05-28T23:15:00.000Z"),
        type: "FUTSAL",
        location: "Quadra",
        season: championship.name,
        homeLabel: "VENC JOGO 37",
        awayLabel: "VENC JOGO 38",
        homeSourceType: "MATCH_WINNER",
        awaySourceType: "MATCH_WINNER",
        homeSourceMatchId: "match-37",
        awaySourceMatchId: "match-38",
        status: "SCHEDULED",
        phaseLabel: "Final",
    }),
];

const presentedMatches = presentMatches({
    matches,
    clubs,
    championships: [championship],
    participants,
    now,
});

const semifinal = presentedMatches.find((match) => match.id === "match-37");
const finalMatch = presentedMatches.find((match) => match.id === "match-40");

assert(semifinal, "A semifinal 37 precisa existir");
assertEqual(semifinal.homeTeam.name, "Beta");
assertEqual(semifinal.awayTeam.name, "Alfa");

assert(finalMatch, "A final precisa existir");
assertEqual(finalMatch.homeTeam.name, "Beta");
assertEqual(finalMatch.awayTeam.name, "Gama");
assertEqual(finalMatch.isResenhaMatch, true);

const shootoutMatches: MatchRecord[] = [
    ...matches.filter((match) => match.matchday != null && match.matchday <= 4),
    createMatch({
        id: "shootout-37",
        championshipId: championship.id,
        matchday: 37,
        date: new Date("2026-05-26T22:30:00.000Z"),
        type: "FUTSAL",
        location: "Quadra",
        season: championship.name,
        homeLabel: "2o colocado",
        awayLabel: "3o colocado",
        homeSourceType: "GROUP_POSITION",
        awaySourceType: "GROUP_POSITION",
        homeSourcePosition: 2,
        awaySourcePosition: 3,
        scoreHome: 1,
        scoreAway: 1,
        tiebreakHome: 4,
        tiebreakAway: 3,
        status: "FINISHED",
        phaseLabel: "Semifinal",
    }),
    createMatch({
        id: "shootout-38",
        championshipId: championship.id,
        matchday: 38,
        date: new Date("2026-05-26T23:15:00.000Z"),
        type: "FUTSAL",
        location: "Quadra",
        season: championship.name,
        homeLabel: "1o colocado",
        awayLabel: "4o colocado",
        homeSourceType: "GROUP_POSITION",
        awaySourceType: "GROUP_POSITION",
        homeSourcePosition: 1,
        awaySourcePosition: 4,
        scoreHome: 2,
        scoreAway: 0,
        status: "FINISHED",
        phaseLabel: "Semifinal",
    }),
    createMatch({
        id: "shootout-40",
        championshipId: championship.id,
        matchday: 40,
        date: new Date("2026-05-28T23:15:00.000Z"),
        type: "FUTSAL",
        location: "Quadra",
        season: championship.name,
        homeLabel: "VENC JOGO 37",
        awayLabel: "VENC JOGO 38",
        homeSourceType: "MATCH_WINNER",
        awaySourceType: "MATCH_WINNER",
        homeSourceMatchId: "shootout-37",
        awaySourceMatchId: "shootout-38",
        status: "SCHEDULED",
        phaseLabel: "Final",
    }),
];

const presentedShootoutMatches = presentMatches({
    matches: shootoutMatches,
    clubs,
    championships: [championship],
    participants,
    now,
});

const shootoutFinal = presentedShootoutMatches.find((match) => match.id === "shootout-40");

assert(shootoutFinal, "A final com desempate precisa existir");
assertEqual(shootoutFinal.homeTeam.name, "Beta", "O vencedor nos penaltis da semi 37 deve ir para a final");
assertEqual(shootoutFinal.awayTeam.name, "Gama");

const standings = buildStandings({
    championship,
    participants: participants.map((participant) => ({ clubId: participant.clubId })),
    matches: presentedMatches,
    clubs,
});

assertDeepEqual(
    standings.map((row) => ({
        clubName: row.clubName,
        points: row.points,
        played: row.played,
    })),
    [
        { clubName: "Gama", points: 6, played: 2 },
        { clubName: "Beta", points: 3, played: 2 },
        { clubName: "Alfa", points: 3, played: 2 },
        { clubName: "Delta", points: 0, played: 2 },
    ],
);

console.log("football.test.ts passed");
