"use server";

import { db } from "@resenha/db";
import { clubs } from "@resenha/db/schema";
import { CreateClubSchema, type CreateClubInput, UpdateClubSchema, type UpdateClubInput } from "@resenha/validators";
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
        .slice(0, 80);

async function ensureUniqueClubSlug(baseValue: string, excludeId?: string) {
    const baseSlug = slugify(baseValue) || `clube-${Date.now()}`;
    let attempt = baseSlug;
    let counter = 1;

    while (true) {
        const existing = await db.query.clubs.findFirst({
            where: excludeId
                ? (club, { and }) => and(eq(club.slug, attempt), ne(club.id, excludeId))
                : (club) => eq(club.slug, attempt),
        });

        if (!existing) {
            return attempt;
        }

        counter += 1;
        attempt = `${baseSlug}-${counter}`;
    }
}

async function syncResenhaFlag(isResenha: boolean, currentId?: string) {
    if (!isResenha) {
        return;
    }

    if (currentId) {
        await db
            .update(clubs)
            .set({
                isResenha: false,
                updatedAt: new Date(),
            })
            .where(ne(clubs.id, currentId));
        return;
    }

    await db.update(clubs).set({
        isResenha: false,
        updatedAt: new Date(),
    });
}

function revalidateClubPages(id?: string) {
    revalidatePath("/");
    revalidatePath("/jogos");
    revalidatePath("/campeonatos");
    revalidatePath("/clubs");

    if (id) {
        revalidatePath(`/clubs/${id}`);
    }
}

export async function createClub(data: CreateClubInput) {
    try {
        const parsed = CreateClubSchema.parse(data);
        const slug = await ensureUniqueClubSlug(parsed.slug?.trim() || parsed.name);

        await syncResenhaFlag(parsed.isResenha);

        await db.insert(clubs).values({
            name: parsed.name.trim(),
            shortName: parsed.shortName.trim(),
            slug,
            logoUrl: normalizeText(parsed.logoUrl),
            city: normalizeText(parsed.city),
            isResenha: parsed.isResenha,
            isActive: parsed.isActive,
        });

        revalidateClubPages();
        return { success: true };
    } catch (error: unknown) {
        return { success: false, error: getErrorMessage(error, "Nao foi possivel criar o clube.") };
    }
}

export async function updateClub(id: string, data: UpdateClubInput) {
    try {
        const parsed = UpdateClubSchema.parse(data);
        const updatePayload: Record<string, unknown> = {
            updatedAt: new Date(),
        };

        if (parsed.name !== undefined) updatePayload.name = parsed.name.trim();
        if (parsed.shortName !== undefined) updatePayload.shortName = parsed.shortName.trim();
        if (parsed.logoUrl !== undefined) updatePayload.logoUrl = normalizeText(parsed.logoUrl);
        if (parsed.city !== undefined) updatePayload.city = normalizeText(parsed.city);
        if (parsed.isResenha !== undefined) {
            await syncResenhaFlag(parsed.isResenha, id);
            updatePayload.isResenha = parsed.isResenha;
        }
        if (parsed.isActive !== undefined) updatePayload.isActive = parsed.isActive;

        if (parsed.slug !== undefined || parsed.name !== undefined) {
            const nextSlugBase = parsed.slug?.trim() || parsed.name?.trim();

            if (nextSlugBase) {
                updatePayload.slug = await ensureUniqueClubSlug(nextSlugBase, id);
            }
        }

        await db.update(clubs).set(updatePayload).where(eq(clubs.id, id));

        revalidateClubPages(id);
        return { success: true };
    } catch (error: unknown) {
        return { success: false, error: getErrorMessage(error, "Nao foi possivel atualizar o clube.") };
    }
}

export async function deleteClub(id: string) {
    try {
        await db.delete(clubs).where(eq(clubs.id, id));

        revalidateClubPages(id);
        revalidatePath("/partidas");
        return { success: true };
    } catch (error: unknown) {
        return { success: false, error: getErrorMessage(error, "Nao foi possivel excluir o clube.") };
    }
}
