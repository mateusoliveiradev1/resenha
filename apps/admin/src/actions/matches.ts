"use server";

import { db, getDefaultDurationMinutes, presentMatch } from "@resenha/db";
import { championshipGroups, championships, clubs, matchAppearances, matchStats, matches } from "@resenha/db/schema";
import {
    CreateMatchSchema,
    type CreateMatchInput,
    UpsertMatchAppearancesSchema,
    type UpsertMatchAppearancesInput,
    UpdateMatchSchema,
    type UpdateMatchInput,
    UpsertMatchStatsSchema,
    type UpsertMatchStatsInput
} from "@resenha/validators";
import { and, desc, eq, isNotNull, ne, or, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

const normalizeText = (value?: string | null) => {
    const trimmed = value?.trim();
    return trimmed ? trimmed : null;
};

const normalizeSourcePattern = (value: string) =>
    value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toUpperCase()
        .replace(/\s+/g, " ")
        .trim();

type MatchSideSourcePayload = {
    sourceType: "STATIC" | "GROUP_POSITION" | "MATCH_WINNER" | "MATCH_LOSER" | null;
    sourcePosition: number | null;
    sourceMatchId: string | null;
    sourceGroupId: string | null;
};

function ensureTiebreakConsistency(args: {
    scoreHome?: number | null;
    scoreAway?: number | null;
    tiebreakHome?: number | null;
    tiebreakAway?: number | null;
}) {
    const hasAnyTiebreak = args.tiebreakHome != null || args.tiebreakAway != null;

    if (!hasAnyTiebreak) {
        return;
    }

    if (args.tiebreakHome == null || args.tiebreakAway == null) {
        throw new Error("Informe o desempate dos dois lados para definir o classificado automaticamente.");
    }

    if (args.scoreHome == null || args.scoreAway == null) {
        throw new Error("Salve primeiro o placar do tempo normal antes de registrar o desempate.");
    }

    if (args.scoreHome !== args.scoreAway) {
        throw new Error("O desempate so deve ser preenchido quando o tempo normal terminar empatado.");
    }

    if (args.tiebreakHome === args.tiebreakAway) {
        throw new Error("O desempate precisa indicar um vencedor.");
    }
}

function parseAutomaticSourceLabel(label: string) {
    const normalized = normalizeSourcePattern(label);
    const positionMatch = normalized.match(/^(\d+)(?:O|º|°)?\s*(?:COLOCADO|LUGAR)(?:\s+DO\s+GRUPO\s+(.+))?$/);

    if (positionMatch) {
        return {
            sourceType: "GROUP_POSITION" as const,
            sourcePosition: Number(positionMatch[1]),
            groupName: positionMatch[2]?.trim() ?? null,
            matchNumber: null,
        };
    }

    const winnerMatch = normalized.match(/^(VENC|VENCEDOR|PERD|PERDEDOR)\s+(?:DO\s+)?JOGO\s+(\d+)$/);

    if (winnerMatch) {
        const keyword = winnerMatch[1];

        return {
            sourceType: keyword.startsWith("VENC") ? "MATCH_WINNER" as const : "MATCH_LOSER" as const,
            sourcePosition: null,
            groupName: null,
            matchNumber: Number(winnerMatch[2]),
        };
    }

    return null;
}

async function deriveMatchSideSource(input: {
    championshipId?: string | null;
    label?: string | null;
    clubId?: string | null;
    sourceType?: CreateMatchInput["homeSourceType"];
    sourcePosition?: number | null;
    sourceMatchId?: string | null;
    sourceGroupId?: string | null;
    excludeMatchId?: string;
}) {
    const normalizedLabel = normalizeText(input.label);
    const hasExplicitSource =
        input.sourceType !== undefined ||
        input.sourcePosition !== undefined ||
        input.sourceMatchId !== undefined ||
        input.sourceGroupId !== undefined;

    if (hasExplicitSource) {
        return {
            sourceType: input.sourceType ?? (input.clubId || normalizedLabel ? "STATIC" : null),
            sourcePosition: input.sourcePosition ?? null,
            sourceMatchId: input.sourceMatchId ?? null,
            sourceGroupId: input.sourceGroupId ?? null,
        } satisfies MatchSideSourcePayload;
    }

    if (!normalizedLabel || !input.championshipId) {
        return {
            sourceType: input.clubId || normalizedLabel ? "STATIC" : null,
            sourcePosition: null,
            sourceMatchId: null,
            sourceGroupId: null,
        } satisfies MatchSideSourcePayload;
    }

    const parsed = parseAutomaticSourceLabel(normalizedLabel);

    if (!parsed) {
        return {
            sourceType: input.clubId || normalizedLabel ? "STATIC" : null,
            sourcePosition: null,
            sourceMatchId: null,
            sourceGroupId: null,
        } satisfies MatchSideSourcePayload;
    }

    if (parsed.sourceType === "GROUP_POSITION") {
        const group = parsed.groupName
            ? (await db.query.championshipGroups.findMany({
                where: eq(championshipGroups.championshipId, input.championshipId),
            })).find((item) => normalizeSourcePattern(item.name) === normalizeSourcePattern(parsed.groupName))
            : null;

        return {
            sourceType: "GROUP_POSITION",
            sourcePosition: parsed.sourcePosition,
            sourceMatchId: null,
            sourceGroupId: group?.id ?? null,
        } satisfies MatchSideSourcePayload;
    }

    const filters = [
        eq(matches.championshipId, input.championshipId),
        or(
            eq(matches.matchday, parsed.matchNumber ?? 0),
            eq(matches.roundLabel, `Jogo ${parsed.matchNumber ?? 0}`),
            eq(matches.roundLabel, `JOGO ${parsed.matchNumber ?? 0}`),
        ),
    ];

    if (input.excludeMatchId) {
        filters.push(ne(matches.id, input.excludeMatchId));
    }

    const sourceMatch = await db.query.matches.findFirst({
        where: and(...filters),
    });

    return {
        sourceType: parsed.sourceType,
        sourcePosition: null,
        sourceMatchId: sourceMatch?.id ?? null,
        sourceGroupId: null,
    } satisfies MatchSideSourcePayload;
}

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

async function getMatchRelatedEntities(input: {
    homeClubId?: string | null;
    awayClubId?: string | null;
    championshipId?: string | null;
}) {
    const [clubsData, championship] = await Promise.all([
        input.homeClubId || input.awayClubId
            ? db
                .select()
                .from(clubs)
                .where(
                    input.homeClubId && input.awayClubId
                        ? or(eq(clubs.id, input.homeClubId), eq(clubs.id, input.awayClubId))
                        : eq(clubs.id, input.homeClubId ?? input.awayClubId ?? "")
                )
            : Promise.resolve([]),
        input.championshipId
            ? db.query.championships.findFirst({
                where: eq(championships.id, input.championshipId),
            })
            : Promise.resolve(null),
    ]);

    return {
        clubsData,
        championship,
    };
}

function deriveLegacyOpponentData(args: {
    clubsData: typeof clubs.$inferSelect[];
    homeClubId?: string | null;
    awayClubId?: string | null;
    homeLabel?: string | null;
    awayLabel?: string | null;
}) {
    const clubsById = new Map(args.clubsData.map((club) => [club.id, club]));
    const homeClub = args.homeClubId ? clubsById.get(args.homeClubId) ?? null : null;
    const awayClub = args.awayClubId ? clubsById.get(args.awayClubId) ?? null : null;
    const explicitResenhaClub = args.clubsData.find((club) => club.isResenha) ?? null;

    if (explicitResenhaClub) {
        const opponentClub = homeClub?.id === explicitResenhaClub.id ? awayClub : homeClub;
        return {
            opponentName: opponentClub?.name ?? args.awayLabel ?? args.homeLabel ?? null,
            opponentLogo: opponentClub?.logoUrl ?? null,
        };
    }

    return {
        opponentName: awayClub?.name ?? args.awayLabel ?? homeClub?.name ?? args.homeLabel ?? null,
        opponentLogo: awayClub?.logoUrl ?? homeClub?.logoUrl ?? null,
    };
}

function revalidateMatchPages(id?: string) {
    revalidatePath("/partidas");
    revalidatePath("/");
    revalidatePath("/jogos");
    revalidatePath("/estatisticas");
    revalidatePath("/elenco");
    revalidatePath("/campeonatos");

    if (id) {
        revalidatePath(`/partidas/${id}`);
    }
}

export async function createMatchAction(data: CreateMatchInput) {
    try {
        const parsed = CreateMatchSchema.parse(data);
        ensureTiebreakConsistency({
            scoreHome: parsed.scoreHome,
            scoreAway: parsed.scoreAway,
            tiebreakHome: parsed.tiebreakHome,
            tiebreakAway: parsed.tiebreakAway,
        });
        const { clubsData, championship } = await getMatchRelatedEntities({
            homeClubId: parsed.homeClubId,
            awayClubId: parsed.awayClubId,
            championshipId: parsed.championshipId,
        });
        const derivedLegacy = deriveLegacyOpponentData({
            clubsData,
            homeClubId: parsed.homeClubId,
            awayClubId: parsed.awayClubId,
            homeLabel: parsed.homeLabel,
            awayLabel: parsed.awayLabel,
        });
        const opponentName = derivedLegacy.opponentName ?? parsed.opponent?.trim() ?? "Adversario";
        const opponentLogo =
            normalizeText(parsed.opponentLogo) ??
            normalizeText(derivedLegacy.opponentLogo) ??
            await findReusableOpponentLogo(opponentName);
        const seasonLabel = parsed.championshipId ? championship?.name ?? parsed.season?.trim() ?? "Campeonato" : parsed.season?.trim() ?? "Partida avulsa";
        const [homeSource, awaySource] = await Promise.all([
            deriveMatchSideSource({
                championshipId: parsed.championshipId,
                label: parsed.homeLabel,
                clubId: parsed.homeClubId,
                sourceType: parsed.homeSourceType,
                sourcePosition: parsed.homeSourcePosition,
                sourceMatchId: parsed.homeSourceMatchId,
                sourceGroupId: parsed.homeSourceGroupId,
            }),
            deriveMatchSideSource({
                championshipId: parsed.championshipId,
                label: parsed.awayLabel,
                clubId: parsed.awayClubId,
                sourceType: parsed.awaySourceType,
                sourcePosition: parsed.awaySourcePosition,
                sourceMatchId: parsed.awaySourceMatchId,
                sourceGroupId: parsed.awaySourceGroupId,
            }),
        ]);

        await db.insert(matches).values({
            date: new Date(parsed.date),
            opponent: opponentName,
            opponentLogo,
            matchCategory: parsed.matchCategory,
            homeClubId: parsed.homeClubId ?? null,
            awayClubId: parsed.awayClubId ?? null,
            homeLabel: normalizeText(parsed.homeLabel),
            awayLabel: normalizeText(parsed.awayLabel),
            homeSourceType: homeSource.sourceType,
            awaySourceType: awaySource.sourceType,
            homeSourcePosition: homeSource.sourcePosition,
            awaySourcePosition: awaySource.sourcePosition,
            homeSourceMatchId: homeSource.sourceMatchId,
            awaySourceMatchId: awaySource.sourceMatchId,
            homeSourceGroupId: homeSource.sourceGroupId,
            awaySourceGroupId: awaySource.sourceGroupId,
            championshipId: parsed.championshipId ?? null,
            championshipGroupId: parsed.championshipGroupId ?? null,
            phaseLabel: normalizeText(parsed.phaseLabel),
            roundLabel: normalizeText(parsed.roundLabel),
            matchday: parsed.matchday ?? null,
            type: parsed.type,
            location: parsed.location.trim(),
            scoreHome: parsed.scoreHome ?? null,
            scoreAway: parsed.scoreAway ?? null,
            tiebreakHome: parsed.tiebreakHome ?? null,
            tiebreakAway: parsed.tiebreakAway ?? null,
            status: parsed.status,
            autoStatus: parsed.autoStatus,
            durationMinutes: parsed.durationMinutes ?? getDefaultDurationMinutes(parsed.type),
            season: seasonLabel,
            summary: normalizeText(parsed.summary),
        });

        revalidateMatchPages();

        return { success: true };
    } catch (error: unknown) {
        return { success: false, error: getErrorMessage(error, "Nao foi possivel criar a partida.") };
    }
}

export async function updateMatchAction(id: string, data: UpdateMatchInput) {
    try {
        const parsed = UpdateMatchSchema.parse(data);
        const currentMatch = await db.query.matches.findFirst({
            where: eq(matches.id, id),
        });

        if (!currentMatch) {
            throw new Error("Partida nao encontrada.");
        }

        const nextHomeClubId = parsed.homeClubId !== undefined ? parsed.homeClubId : currentMatch.homeClubId;
        const nextAwayClubId = parsed.awayClubId !== undefined ? parsed.awayClubId : currentMatch.awayClubId;
        const nextHomeLabel = parsed.homeLabel !== undefined ? parsed.homeLabel : currentMatch.homeLabel;
        const nextAwayLabel = parsed.awayLabel !== undefined ? parsed.awayLabel : currentMatch.awayLabel;
        const nextChampionshipId = parsed.championshipId !== undefined ? parsed.championshipId : currentMatch.championshipId;
        const nextType = parsed.type ?? currentMatch.type;
        const { clubsData, championship } = await getMatchRelatedEntities({
            homeClubId: nextHomeClubId,
            awayClubId: nextAwayClubId,
            championshipId: nextChampionshipId,
        });
        const derivedLegacy = deriveLegacyOpponentData({
            clubsData,
            homeClubId: nextHomeClubId,
            awayClubId: nextAwayClubId,
            homeLabel: nextHomeLabel,
            awayLabel: nextAwayLabel,
        });
        const nextHomeSourceType = parsed.homeSourceType !== undefined ? parsed.homeSourceType : currentMatch.homeSourceType;
        const nextAwaySourceType = parsed.awaySourceType !== undefined ? parsed.awaySourceType : currentMatch.awaySourceType;
        const nextHomeSourcePosition = parsed.homeSourcePosition !== undefined ? parsed.homeSourcePosition : currentMatch.homeSourcePosition;
        const nextAwaySourcePosition = parsed.awaySourcePosition !== undefined ? parsed.awaySourcePosition : currentMatch.awaySourcePosition;
        const nextHomeSourceMatchId = parsed.homeSourceMatchId !== undefined ? parsed.homeSourceMatchId : currentMatch.homeSourceMatchId;
        const nextAwaySourceMatchId = parsed.awaySourceMatchId !== undefined ? parsed.awaySourceMatchId : currentMatch.awaySourceMatchId;
        const nextHomeSourceGroupId = parsed.homeSourceGroupId !== undefined ? parsed.homeSourceGroupId : currentMatch.homeSourceGroupId;
        const nextAwaySourceGroupId = parsed.awaySourceGroupId !== undefined ? parsed.awaySourceGroupId : currentMatch.awaySourceGroupId;
        const nextScoreHome = parsed.scoreHome !== undefined ? parsed.scoreHome : currentMatch.scoreHome;
        const nextScoreAway = parsed.scoreAway !== undefined ? parsed.scoreAway : currentMatch.scoreAway;
        const nextTiebreakHome = parsed.tiebreakHome !== undefined ? parsed.tiebreakHome : currentMatch.tiebreakHome;
        const nextTiebreakAway = parsed.tiebreakAway !== undefined ? parsed.tiebreakAway : currentMatch.tiebreakAway;
        ensureTiebreakConsistency({
            scoreHome: nextScoreHome,
            scoreAway: nextScoreAway,
            tiebreakHome: nextTiebreakHome,
            tiebreakAway: nextTiebreakAway,
        });
        const [homeSource, awaySource] = await Promise.all([
            deriveMatchSideSource({
                championshipId: nextChampionshipId,
                label: nextHomeLabel,
                clubId: nextHomeClubId,
                sourceType: nextHomeSourceType,
                sourcePosition: nextHomeSourcePosition,
                sourceMatchId: nextHomeSourceMatchId,
                sourceGroupId: nextHomeSourceGroupId,
                excludeMatchId: id,
            }),
            deriveMatchSideSource({
                championshipId: nextChampionshipId,
                label: nextAwayLabel,
                clubId: nextAwayClubId,
                sourceType: nextAwaySourceType,
                sourcePosition: nextAwaySourcePosition,
                sourceMatchId: nextAwaySourceMatchId,
                sourceGroupId: nextAwaySourceGroupId,
                excludeMatchId: id,
            }),
        ]);

        const updatePayload: Record<string, unknown> = {};

        if (parsed.date) updatePayload.date = new Date(parsed.date);
        if (parsed.opponent !== undefined || parsed.homeClubId !== undefined || parsed.awayClubId !== undefined) {
            updatePayload.opponent =
                derivedLegacy.opponentName ??
                parsed.opponent?.trim() ??
                currentMatch.opponent;
        }

        if (parsed.opponentLogo !== undefined || parsed.homeClubId !== undefined || parsed.awayClubId !== undefined) {
            const computedOpponentName = String(updatePayload.opponent ?? currentMatch.opponent);
            updatePayload.opponentLogo =
                normalizeText(parsed.opponentLogo) ??
                normalizeText(derivedLegacy.opponentLogo) ??
                await findReusableOpponentLogo(computedOpponentName, id);
        }

        if (parsed.matchCategory !== undefined) updatePayload.matchCategory = parsed.matchCategory;
        if (parsed.homeClubId !== undefined) updatePayload.homeClubId = parsed.homeClubId ?? null;
        if (parsed.awayClubId !== undefined) updatePayload.awayClubId = parsed.awayClubId ?? null;
        if (parsed.homeLabel !== undefined) updatePayload.homeLabel = normalizeText(parsed.homeLabel);
        if (parsed.awayLabel !== undefined) updatePayload.awayLabel = normalizeText(parsed.awayLabel);
        updatePayload.homeSourceType = homeSource.sourceType;
        updatePayload.awaySourceType = awaySource.sourceType;
        updatePayload.homeSourcePosition = homeSource.sourcePosition;
        updatePayload.awaySourcePosition = awaySource.sourcePosition;
        updatePayload.homeSourceMatchId = homeSource.sourceMatchId;
        updatePayload.awaySourceMatchId = awaySource.sourceMatchId;
        updatePayload.homeSourceGroupId = homeSource.sourceGroupId;
        updatePayload.awaySourceGroupId = awaySource.sourceGroupId;
        if (parsed.championshipId !== undefined) updatePayload.championshipId = parsed.championshipId ?? null;
        if (parsed.championshipGroupId !== undefined) updatePayload.championshipGroupId = parsed.championshipGroupId ?? null;
        if (parsed.phaseLabel !== undefined) updatePayload.phaseLabel = normalizeText(parsed.phaseLabel);
        if (parsed.roundLabel !== undefined) updatePayload.roundLabel = normalizeText(parsed.roundLabel);
        if (parsed.matchday !== undefined) updatePayload.matchday = parsed.matchday ?? null;
        if (parsed.type !== undefined) updatePayload.type = parsed.type;
        if (parsed.location !== undefined) updatePayload.location = parsed.location.trim();
        if (parsed.scoreHome !== undefined) updatePayload.scoreHome = parsed.scoreHome ?? null;
        if (parsed.scoreAway !== undefined) updatePayload.scoreAway = parsed.scoreAway ?? null;
        if (parsed.tiebreakHome !== undefined) updatePayload.tiebreakHome = parsed.tiebreakHome ?? null;
        if (parsed.tiebreakAway !== undefined) updatePayload.tiebreakAway = parsed.tiebreakAway ?? null;
        if (parsed.status !== undefined) updatePayload.status = parsed.status;
        if (parsed.autoStatus !== undefined) updatePayload.autoStatus = parsed.autoStatus;
        if (parsed.durationMinutes !== undefined) updatePayload.durationMinutes = parsed.durationMinutes ?? getDefaultDurationMinutes(nextType);
        if (
            parsed.season !== undefined ||
            parsed.championshipId !== undefined
        ) {
            updatePayload.season = nextChampionshipId
                ? championship?.name ?? parsed.season?.trim() ?? currentMatch.season
                : parsed.season?.trim() ?? currentMatch.season;
        }
        if (parsed.summary !== undefined) updatePayload.summary = normalizeText(parsed.summary);
        updatePayload.updatedAt = new Date();

        await db.update(matches).set(updatePayload).where(eq(matches.id, id));

        revalidateMatchPages(id);

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
        const [matchRecord, clubsData] = await Promise.all([
            db.query.matches.findFirst({
                where: eq(matches.id, parsed.matchId),
            }),
            db.query.clubs.findMany(),
        ]);

        if (!matchRecord) {
            throw new Error("Partida nao encontrada.");
        }

        if (!presentMatch(matchRecord, clubsData).isResenhaMatch) {
            throw new Error("Estatisticas de jogadores so podem ser salvas em partidas do Resenha.");
        }

        await db.transaction(async (tx) => {
            await tx.delete(matchStats).where(eq(matchStats.matchId, parsed.matchId));

            if (parsed.stats.length > 0) {
                await tx.insert(matchStats).values(
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

                await tx.insert(matchAppearances)
                    .values(
                        parsed.stats.map((item) => ({
                            matchId: parsed.matchId,
                            playerId: item.playerId,
                            minutesPlayed: item.minutesPlayed ?? null,
                        })),
                    )
                    .onConflictDoNothing({
                        target: [matchAppearances.matchId, matchAppearances.playerId],
                    });
            }
        });

        revalidateMatchPages(parsed.matchId);

        return { success: true };
    } catch (error: unknown) {
        return { success: false, error: getErrorMessage(error, "Nao foi possivel salvar as estatisticas da partida.") };
    }
}

export async function upsertMatchAppearancesAction(data: UpsertMatchAppearancesInput) {
    try {
        const cleanedPayload = {
            ...data,
            appearances: data.appearances.filter((item) => item.playerId),
        };

        const parsed = UpsertMatchAppearancesSchema.parse(cleanedPayload);
        const [matchRecord, clubsData] = await Promise.all([
            db.query.matches.findFirst({
                where: eq(matches.id, parsed.matchId),
            }),
            db.query.clubs.findMany(),
        ]);

        if (!matchRecord) {
            throw new Error("Partida nao encontrada.");
        }

        if (!presentMatch(matchRecord, clubsData).isResenhaMatch) {
            throw new Error("Participacao de jogadores so pode ser salva em partidas do Resenha.");
        }

        await db.delete(matchAppearances).where(eq(matchAppearances.matchId, parsed.matchId));

        if (parsed.appearances.length > 0) {
            const now = new Date();

            await db.insert(matchAppearances).values(
                parsed.appearances.map((item) => ({
                    matchId: parsed.matchId,
                    playerId: item.playerId,
                    minutesPlayed: item.minutesPlayed ?? null,
                    createdAt: now,
                    updatedAt: now,
                })),
            );
        }

        revalidateMatchPages(parsed.matchId);

        return { success: true };
    } catch (error: unknown) {
        return { success: false, error: getErrorMessage(error, "Nao foi possivel salvar as aparicoes da partida.") };
    }
}

export {
    createMatchAction as createMatch,
    updateMatchAction as updateMatch,
    upsertMatchAppearancesAction as upsertMatchAppearances,
    upsertMatchStatsAction as upsertMatchStats
};
