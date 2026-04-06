"use server";

import { db } from "@resenha/db";
import { players } from "@resenha/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import {
    CreatePlayerSchema,
    type CreatePlayerInput,
    UpdatePlayerSchema,
    type UpdatePlayerInput
} from "@resenha/validators";

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

function revalidatePlayerPages(id?: string) {
    revalidatePath("/");
    revalidatePath("/jogadores");

    if (id) {
        revalidatePath(`/jogadores/${id}`);
    }
}

export async function createPlayer(data: CreatePlayerInput) {
    try {
        const parsed = CreatePlayerSchema.parse(data);

        await db.insert(players).values({
            name: parsed.name.trim(),
            nickname: parsed.nickname.trim(),
            position: parsed.position,
            shirtNumber: parsed.shirtNumber,
            isActive: parsed.isActive,
            heightCm: parsed.heightCm ?? null,
            weightKg: parsed.weightKg ?? null,
            preferredFoot: parsed.preferredFoot ?? null,
            birthDate: parsed.birthDate ?? null,
            goals: parsed.goals,
            assists: parsed.assists,
            bio: normalizeText(parsed.bio),
            photoUrl: normalizeText(parsed.photoUrl),
        });

        revalidatePlayerPages();
        return { success: true };
    } catch (error: unknown) {
        return { success: false, error: getErrorMessage(error, "Nao foi possivel criar o jogador.") };
    }
}

export async function updatePlayer(id: string, data: UpdatePlayerInput) {
    try {
        const parsed = UpdatePlayerSchema.parse(data);
        const updatePayload: Record<string, unknown> = {
            updatedAt: new Date()
        };

        if (parsed.name !== undefined) updatePayload.name = parsed.name.trim();
        if (parsed.nickname !== undefined) updatePayload.nickname = parsed.nickname.trim();
        if (parsed.position !== undefined) updatePayload.position = parsed.position;
        if (parsed.shirtNumber !== undefined) updatePayload.shirtNumber = parsed.shirtNumber;
        if (parsed.isActive !== undefined) updatePayload.isActive = parsed.isActive;
        if (parsed.heightCm !== undefined) updatePayload.heightCm = parsed.heightCm ?? null;
        if (parsed.weightKg !== undefined) updatePayload.weightKg = parsed.weightKg ?? null;
        if (parsed.preferredFoot !== undefined) updatePayload.preferredFoot = parsed.preferredFoot ?? null;
        if (parsed.birthDate !== undefined) updatePayload.birthDate = parsed.birthDate ?? null;
        if (parsed.goals !== undefined) updatePayload.goals = parsed.goals;
        if (parsed.assists !== undefined) updatePayload.assists = parsed.assists;
        if (parsed.bio !== undefined) updatePayload.bio = normalizeText(parsed.bio);
        if (parsed.photoUrl !== undefined) updatePayload.photoUrl = normalizeText(parsed.photoUrl);

        await db.update(players).set(updatePayload).where(eq(players.id, id));

        revalidatePlayerPages(id);
        return { success: true };
    } catch (error: unknown) {
        return { success: false, error: getErrorMessage(error, "Nao foi possivel atualizar o jogador.") };
    }
}

export async function deletePlayer(id: string) {
    try {
        await db.delete(players).where(eq(players.id, id));

        revalidatePlayerPages(id);
        revalidatePath("/partidas");

        return { success: true };
    } catch (error: unknown) {
        return { success: false, error: getErrorMessage(error, "Nao foi possivel excluir o jogador.") };
    }
}

export const createPlayerAction = createPlayer;
export const updatePlayerAction = updatePlayer;
export const deletePlayerAction = deletePlayer;
