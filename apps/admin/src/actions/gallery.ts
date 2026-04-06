"use server";

import { revalidatePath } from "next/cache";
import { db } from "@resenha/db";
import { gallery } from "@resenha/db/schema";
import { eq } from "drizzle-orm";

type GalleryEntryInput = {
    url: string;
    caption?: string | null;
    matchId?: string | null;
};

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

function revalidateGalleryPages() {
    revalidatePath("/galeria");
    revalidatePath("/");
}

export async function createGalleryPhotos(entries: GalleryEntryInput[]) {
    try {
        const cleanedEntries = entries
            .map((entry) => ({
                url: entry.url?.trim(),
                caption: normalizeText(entry.caption) ?? "Registro Resenha RFC",
                matchId: entry.matchId ?? null
            }))
            .filter((entry) => entry.url);

        if (cleanedEntries.length === 0) {
            throw new Error("Nenhuma imagem valida foi enviada.");
        }

        await db.insert(gallery).values(
            cleanedEntries.map((entry) => ({
                url: entry.url,
                caption: entry.caption,
                matchId: entry.matchId
            }))
        );

        revalidateGalleryPages();
        return { success: true };
    } catch (error: unknown) {
        return { success: false, error: getErrorMessage(error, "Nao foi possivel salvar as fotos da galeria.") };
    }
}

export async function deletePhoto(id: string) {
    try {
        await db.delete(gallery).where(eq(gallery.id, id));
        revalidateGalleryPages();
        return { success: true };
    } catch (error: unknown) {
        return { success: false, error: getErrorMessage(error, "Nao foi possivel excluir a foto.") };
    }
}
