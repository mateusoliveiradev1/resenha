"use server";

import { db } from "@resenha/db";
import { sponsors } from "@resenha/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import {
    CreateSponsorSchema,
    type CreateSponsorInput,
    UpdateSponsorSchema,
    type UpdateSponsorInput
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

function revalidateSponsorPages(id?: string) {
    revalidatePath("/");
    revalidatePath("/patrocinadores");
    revalidatePath("/contato");

    if (id) {
        revalidatePath(`/patrocinadores/${id}`);
    }
}

export async function createSponsor(data: CreateSponsorInput) {
    try {
        const parsed = CreateSponsorSchema.parse(data);

        await db.insert(sponsors).values({
            name: parsed.name.trim(),
            logoUrl: normalizeText(parsed.logoUrl),
            websiteUrl: normalizeText(parsed.websiteUrl),
            description: normalizeText(parsed.description),
            tier: parsed.tier,
            displayOrder: parsed.displayOrder,
            featuredOnHome: parsed.featuredOnHome,
            isActive: parsed.isActive,
        });

        revalidateSponsorPages();
        return { success: true };
    } catch (error: unknown) {
        return { success: false, error: getErrorMessage(error, "Nao foi possivel criar o patrocinador.") };
    }
}

export async function updateSponsor(id: string, data: UpdateSponsorInput) {
    try {
        const parsed = UpdateSponsorSchema.parse(data);
        const updatePayload: Record<string, unknown> = {
            updatedAt: new Date()
        };

        if (parsed.name !== undefined) updatePayload.name = parsed.name.trim();
        if (parsed.logoUrl !== undefined) updatePayload.logoUrl = normalizeText(parsed.logoUrl);
        if (parsed.websiteUrl !== undefined) updatePayload.websiteUrl = normalizeText(parsed.websiteUrl);
        if (parsed.description !== undefined) updatePayload.description = normalizeText(parsed.description);
        if (parsed.tier !== undefined) updatePayload.tier = parsed.tier;
        if (parsed.displayOrder !== undefined) updatePayload.displayOrder = parsed.displayOrder;
        if (parsed.featuredOnHome !== undefined) updatePayload.featuredOnHome = parsed.featuredOnHome;
        if (parsed.isActive !== undefined) updatePayload.isActive = parsed.isActive;

        await db.update(sponsors).set(updatePayload).where(eq(sponsors.id, id));

        revalidateSponsorPages(id);
        return { success: true };
    } catch (error: unknown) {
        return { success: false, error: getErrorMessage(error, "Nao foi possivel atualizar o patrocinador.") };
    }
}

export async function deleteSponsor(id: string) {
    try {
        await db.delete(sponsors).where(eq(sponsors.id, id));

        revalidateSponsorPages(id);

        return { success: true };
    } catch (error: unknown) {
        return { success: false, error: getErrorMessage(error, "Nao foi possivel excluir o patrocinador.") };
    }
}
