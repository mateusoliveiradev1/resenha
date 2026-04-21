import {
    PIRANGI_FUTSAL_7_DE_MARCO_SOURCE,
    getOfficialPlacarsoftSource,
    normalizePlacarsoftGroupResponse,
} from "./placarsoft";
import { placarsoftGroup19Fixture } from "./placarsoft.fixture";

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

const normalized = normalizePlacarsoftGroupResponse(
    placarsoftGroup19Fixture,
    PIRANGI_FUTSAL_7_DE_MARCO_SOURCE,
    {
        fetchedAt: new Date("2026-04-21T21:40:00.000Z"),
    },
);

assertEqual(normalized.source.competitionId, "544099817090171200");
assertEqual(normalized.source.phaseId, "28");
assertEqual(normalized.source.groupId, "19");
assertEqual(
    getOfficialPlacarsoftSource("campeonato-municipal-de-futsal-7-de-marco-2026")?.groupId,
    "19",
    "The real local championship slug must resolve to the official Placarsoft source",
);
assertEqual(
    normalized.source.sourcePageUrl,
    "https://pirangi.portal.placarsoft.com.br/campeonatos/544099817090171200/futsal-7-de-marco-maciel-da-costa-da-conceicao/classificacao-e-jogos",
);
assertEqual(normalized.freshness.updatedAt, "21/04/2026 18:36:48");
assertEqual(normalized.freshness.updatedAtDate?.toISOString(), "2026-04-21T21:36:48.000Z");

assertDeepEqual(
    normalized.standings.slice(0, 3).map((row) => row.clubShortName),
    ["RCF", "VPA", "RAS"],
    "The official top-three order must be preserved from table[].index",
);

const resenha = normalized.standings.find((row) => row.clubName === "Resenha FC");

assert(resenha, "Resenha FC row must exist");
assertEqual(resenha.position, 7);
assertEqual(resenha.played, 3);
assertEqual(resenha.points, 3);
assertEqual(resenha.wins, 1);
assertEqual(resenha.draws, 0);
assertEqual(resenha.losses, 2);
assertEqual(resenha.goalsFor, 13);
assertEqual(resenha.goalsAgainst, 10);
assertEqual(resenha.goalDifference, 3);
assertDeepEqual(resenha.recentForm, ["W", "L", "L"]);

const finishedGame = normalized.games.find((game) => game.sourceGameId === "550722242598876789");

assert(finishedGame, "Fixture must include one finished duel");
assertEqual(finishedGame.status, "FINISHED");
assertEqual(finishedGame.matchday, 1);
assertEqual(finishedGame.roundName, "Rodada 1");
assertEqual(finishedGame.homeTeam.shortName, "RAS");
assertEqual(finishedGame.awayTeam.shortName, "BSL");
assertEqual(finishedGame.scoreHome, 6);
assertEqual(finishedGame.scoreAway, 0);
assertEqual(finishedGame.date.toISOString(), "2026-04-07T22:00:00.000Z");
assertEqual(finishedGame.location, "Ginasio Municipal de Esportes Alberto Covielo - Quadra");

const scheduledGame = normalized.games.find((game) => game.sourceGameId === "550724666659126927");

assert(scheduledGame, "Fixture must include one scheduled duel");
assertEqual(scheduledGame.status, "SCHEDULED");
assertEqual(scheduledGame.matchday, 4);
assertEqual(scheduledGame.homeTeam.shortName, "MBJ");
assertEqual(scheduledGame.awayTeam.shortName, "UVF");
assertEqual(scheduledGame.scoreHome, null);
assertEqual(scheduledGame.scoreAway, null);
assertEqual(scheduledGame.date.toISOString(), "2026-04-23T22:00:00.000Z");

console.log("placarsoft.test.ts passed");
