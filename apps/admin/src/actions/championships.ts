"use server";

import { db } from "@resenha/db";
import { championships, championshipGroups, championshipParticipants } from "@resenha/db/schema";
import {
    CreateChampionshipSchema,
    type CreateChampionshipInput,
    SaveChampionshipParticipantsSchema,
    type SaveChampionshipParticipantsInput,
    UpdateChampionshipSchema,
    type UpdateChampionshipInput
} from "@resenha/validators";
import { eq, ne } from "drizzle-orm";
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

const slugify = (value: string) =>
    value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 90);

async function ensureUniqueChampionshipSlug(baseValue: string, excludeId?: string) {
    const baseSlug = slugify(baseValue) || `campeonato-${Date.now()}`;
    let attempt = baseSlug;
    let counter = 1;

    while (true) {
        const existing = await db.query.championships.findFirst({
            where: excludeId
                ? (championship, { and }) => and(eq(championship.slug, attempt), ne(championship.id, excludeId))
                : (championship) => eq(championship.slug, attempt),
        });

        if (!existing) {
            return attempt;
        }

        counter += 1;
        attempt = `${baseSlug}-${counter}`;
    }
}

async function revalidateChampionshipPages(id?: string) {
    revalidatePath("/");
    revalidatePath("/jogos");
    revalidatePath("/estatisticas");
    revalidatePath("/campeonatos");

    if (id) {
        const championship = await db.query.championships.findFirst({
            where: eq(championships.id, id),
            columns: {
                slug: true,
            },
        });

        if (championship?.slug) {
            revalidatePath(`/campeonatos/${championship.slug}`);
        }
    }
}

export async function createChampionship(data: CreateChampionshipInput) {
    try {
        const parsed = CreateChampionshipSchema.parse(data);
        const slug = await ensureUniqueChampionshipSlug(parsed.slug?.trim() || `${parsed.name} ${parsed.seasonLabel}`);

        await db.insert(championships).values({
            name: parsed.name.trim(),
            slug,
            description: normalizeText(parsed.description),
            seasonLabel: parsed.seasonLabel.trim(),
            surface: parsed.surface,
            format: parsed.format,
            status: parsed.status,
            pointsPerWin: parsed.pointsPerWin,
            pointsPerDraw: parsed.pointsPerDraw,
            pointsPerLoss: parsed.pointsPerLoss,
            showStandings: parsed.showStandings,
            startsAt: parsed.startsAt ? new Date(parsed.startsAt) : null,
            endsAt: parsed.endsAt ? new Date(parsed.endsAt) : null,
        });

        await revalidateChampionshipPages();
        return { success: true };
    } catch (error: unknown) {
        return { success: false, error: getErrorMessage(error, "Nao foi possivel criar o campeonato.") };
    }
}

export async function updateChampionship(id: string, data: UpdateChampionshipInput) {
    try {
        const parsed = UpdateChampionshipSchema.parse(data);
        const updatePayload: Record<string, unknown> = {
            updatedAt: new Date(),
        };

        if (parsed.name !== undefined) updatePayload.name = parsed.name.trim();
        if (parsed.description !== undefined) updatePayload.description = normalizeText(parsed.description);
        if (parsed.seasonLabel !== undefined) updatePayload.seasonLabel = parsed.seasonLabel.trim();
        if (parsed.surface !== undefined) updatePayload.surface = parsed.surface;
        if (parsed.format !== undefined) updatePayload.format = parsed.format;
        if (parsed.status !== undefined) updatePayload.status = parsed.status;
        if (parsed.pointsPerWin !== undefined) updatePayload.pointsPerWin = parsed.pointsPerWin;
        if (parsed.pointsPerDraw !== undefined) updatePayload.pointsPerDraw = parsed.pointsPerDraw;
        if (parsed.pointsPerLoss !== undefined) updatePayload.pointsPerLoss = parsed.pointsPerLoss;
        if (parsed.showStandings !== undefined) updatePayload.showStandings = parsed.showStandings;
        if (parsed.startsAt !== undefined) updatePayload.startsAt = parsed.startsAt ? new Date(parsed.startsAt) : null;
        if (parsed.endsAt !== undefined) updatePayload.endsAt = parsed.endsAt ? new Date(parsed.endsAt) : null;

        if (parsed.slug !== undefined || parsed.name !== undefined || parsed.seasonLabel !== undefined) {
            const [currentRecord] = await db.select().from(championships).where(eq(championships.id, id)).limit(1);
            const slugBase =
                parsed.slug?.trim() ||
                `${parsed.name?.trim() || currentRecord?.name || "campeonato"} ${parsed.seasonLabel?.trim() || currentRecord?.seasonLabel || ""}`;

            updatePayload.slug = await ensureUniqueChampionshipSlug(slugBase, id);
        }

        await db.update(championships).set(updatePayload).where(eq(championships.id, id));

        await revalidateChampionshipPages(id);
        return { success: true };
    } catch (error: unknown) {
        return { success: false, error: getErrorMessage(error, "Nao foi possivel atualizar o campeonato.") };
    }
}

export async function saveChampionshipParticipants(data: SaveChampionshipParticipantsInput) {
    try {
        const parsed = SaveChampionshipParticipantsSchema.parse(data);

        await db.transaction(async (tx) => {
            await tx.delete(championshipParticipants).where(eq(championshipParticipants.championshipId, parsed.championshipId));
            await tx.delete(championshipGroups).where(eq(championshipGroups.championshipId, parsed.championshipId));

            const clubGroupAssignments = new Map<string, string>();

            if (parsed.groups.length > 0) {
                const insertedGroups = await tx
                    .insert(championshipGroups)
                    .values(
                        parsed.groups.map((group, index) => ({
                            championshipId: parsed.championshipId,
                            name: group.name.trim(),
                            phaseLabel: group.phaseLabel?.trim() || "FASE DE GRUPOS",
                            displayOrder: index,
                        }))
                    )
                    .returning({
                        id: championshipGroups.id,
                    });

                insertedGroups.forEach((group, index) => {
                    parsed.groups[index]?.clubIds.forEach((clubId) => {
                        clubGroupAssignments.set(clubId, group.id);
                    });
                });
            }

            if (parsed.clubIds.length > 0) {
                await tx.insert(championshipParticipants).values(
                    parsed.clubIds.map((clubId, index) => ({
                        championshipId: parsed.championshipId,
                        clubId,
                        championshipGroupId: clubGroupAssignments.get(clubId) ?? null,
                        displayOrder: index,
                    }))
                );
            }
        });

        await revalidateChampionshipPages(parsed.championshipId);
        revalidatePath("/partidas");
        return { success: true };
    } catch (error: unknown) {
        return { success: false, error: getErrorMessage(error, "Nao foi possivel salvar os participantes.") };
    }
}

export async function deleteChampionship(id: string) {
    try {
        const championship = await db.query.championships.findFirst({
            where: eq(championships.id, id),
            columns: {
                slug: true,
            },
        });

        await db.delete(championships).where(eq(championships.id, id));

        await revalidateChampionshipPages();
        if (championship?.slug) {
            revalidatePath(`/campeonatos/${championship.slug}`);
        }
        revalidatePath("/partidas");
        return { success: true };
    } catch (error: unknown) {
        return { success: false, error: getErrorMessage(error, "Nao foi possivel excluir o campeonato.") };
    }
}
