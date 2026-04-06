"use server";

import { db } from "@resenha/db";
import { matchStats, matches, players } from "@resenha/db/schema";
import {
    CreateMatchSchema,
    type CreateMatchInput,
    UpdateMatchSchema,
    type UpdateMatchInput,
    UpsertMatchStatsSchema,
    type UpsertMatchStatsInput
} from "@resenha/validators";
import { and, desc, eq, isNotNull, ne, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

const normalizeText = (value?: string | null) => {
    const trimmed = value?.trim();
    return trimmed ? trimmed : null;
};

const getErrorMessage = (error: unknown, fallbackMessage: string) => {
    if (error instanceof Error && error.message) {
        return error.message;
    }

    return fallbackMessage;
};

async function findReusableOpponentLogo(opponentName: string, excludeMatchId?: string) {
    const normalizedOpponentName = opponentName.trim().toLowerCase();

    if (!normalizedOpponentName) {
        return null;
    }

    const filters = [
        sql`lower(trim(${matches.opponent})) = ${normalizedOpponentName}`,
        isNotNull(matches.opponentLogo)
    ];

    if (excludeMatchId) {
        filters.push(ne(matches.id, excludeMatchId));
    }

    const [existingMatch] = await db
        .select({
            opponentLogo: matches.opponentLogo
        })
        .from(matches)
        .where(and(...filters))
        .orderBy(desc(matches.date))
        .limit(1);

    return normalizeText(existingMatch?.opponentLogo);
}

async function syncPlayerTotals() {
    const aggregatedStats = await db
        .select({
            playerId: matchStats.playerId,
            goals: sql<number>`coalesce(sum(${matchStats.goals}), 0)`,
            assists: sql<number>`coalesce(sum(${matchStats.assists}), 0)`
        })
        .from(matchStats)
        .groupBy(matchStats.playerId);

    await db.update(players).set({ goals: 0, assists: 0 });

    await Promise.all(
        aggregatedStats.map((item) =>
            db
                .update(players)
                .set({
                    goals: Number(item.goals) || 0,
                    assists: Number(item.assists) || 0
                })
                .where(eq(players.id, item.playerId))
        )
    );
}

export async function createMatchAction(data: CreateMatchInput) {
    try {
        const parsed = CreateMatchSchema.parse(data);
        const opponentLogo = normalizeText(parsed.opponentLogo) ?? await findReusableOpponentLogo(parsed.opponent);

        await db.insert(matches).values({
            date: new Date(parsed.date),
            opponent: parsed.opponent.trim(),
            opponentLogo,
            type: parsed.type,
            location: parsed.location.trim(),
            scoreHome: parsed.scoreHome ?? null,
            scoreAway: parsed.scoreAway ?? null,
            status: parsed.status,
            season: parsed.season.trim(),
            summary: normalizeText(parsed.summary)
        });

        revalidatePath("/partidas");
        revalidatePath("/");
        revalidatePath("/jogos");

        return { success: true };
    } catch (error: unknown) {
        return { success: false, error: getErrorMessage(error, "Nao foi possivel criar a partida.") };
    }
}

export async function updateMatchAction(id: string, data: UpdateMatchInput) {
    try {
        const parsed = UpdateMatchSchema.parse(data);

        const updatePayload: Record<string, unknown> = {};

        if (parsed.date) updatePayload.date = new Date(parsed.date);
        if (parsed.opponent !== undefined) updatePayload.opponent = parsed.opponent.trim();
        if (parsed.opponentLogo !== undefined) updatePayload.opponentLogo = normalizeText(parsed.opponentLogo);
        if (parsed.type !== undefined) updatePayload.type = parsed.type;
        if (parsed.location !== undefined) updatePayload.location = parsed.location.trim();
        if (parsed.scoreHome !== undefined) updatePayload.scoreHome = parsed.scoreHome ?? null;
        if (parsed.scoreAway !== undefined) updatePayload.scoreAway = parsed.scoreAway ?? null;
        if (parsed.status !== undefined) updatePayload.status = parsed.status;
        if (parsed.season !== undefined) updatePayload.season = parsed.season.trim();
        if (parsed.summary !== undefined) updatePayload.summary = normalizeText(parsed.summary);

        await db.update(matches).set(updatePayload).where(eq(matches.id, id));

        revalidatePath("/partidas");
        revalidatePath(`/partidas/${id}`);
        revalidatePath("/");
        revalidatePath("/jogos");

        return { success: true };
    } catch (error: unknown) {
        return { success: false, error: getErrorMessage(error, "Nao foi possivel atualizar a partida.") };
    }
}

export async function upsertMatchStatsAction(data: UpsertMatchStatsInput) {
    try {
        const cleanedPayload = {
            ...data,
            stats: data.stats.filter((item) => item.playerId)
        };

        const parsed = UpsertMatchStatsSchema.parse(cleanedPayload);

        await db.delete(matchStats).where(eq(matchStats.matchId, parsed.matchId));

        if (parsed.stats.length > 0) {
            await db.insert(matchStats).values(
                parsed.stats.map((item) => ({
                    matchId: parsed.matchId,
                    playerId: item.playerId,
                    goals: item.goals,
                    assists: item.assists,
                    yellowCards: item.yellowCards,
                    redCards: item.redCards,
                    minutesPlayed: item.minutesPlayed ?? null
                }))
            );
        }

        await syncPlayerTotals();

        revalidatePath("/partidas");
        revalidatePath(`/partidas/${parsed.matchId}`);
        revalidatePath("/elenco");
        revalidatePath("/estatisticas");
        revalidatePath("/");

        return { success: true };
    } catch (error: unknown) {
        return { success: false, error: getErrorMessage(error, "Nao foi possivel salvar as estatisticas da partida.") };
    }
}

export {
    createMatchAction as createMatch,
    updateMatchAction as updateMatch,
    upsertMatchStatsAction as upsertMatchStats
};
