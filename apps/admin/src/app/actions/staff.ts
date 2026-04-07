"use server";

import { db } from "@resenha/db";
import { staff } from "@resenha/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import {
    CreateStaffSchema,
    type CreateStaffInput,
    UpdateStaffSchema,
    type UpdateStaffInput
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

function revalidateStaffPages(id?: string) {
    revalidatePath("/");
    revalidatePath("/diretoria");
    revalidatePath("/comissao");

    if (id) {
        revalidatePath(`/comissao/${id}`);
    }
}

export async function createStaffMember(data: CreateStaffInput) {
    try {
        const parsed = CreateStaffSchema.parse(data);

        await db.insert(staff).values({
            name: parsed.name.trim(),
            role: parsed.role.trim(),
            photoUrl: normalizeText(parsed.photoUrl),
            displayOrder: parsed.displayOrder,
            isActive: parsed.isActive,
        });

        revalidateStaffPages();
        return { success: true };
    } catch (error: unknown) {
        return { success: false, error: getErrorMessage(error, "Nao foi possivel criar o membro da comissao.") };
    }
}

export async function updateStaffMember(id: string, data: UpdateStaffInput) {
    try {
        const parsed = UpdateStaffSchema.parse(data);
        const updatePayload: Record<string, unknown> = {
            updatedAt: new Date()
        };

        if (parsed.name !== undefined) updatePayload.name = parsed.name.trim();
        if (parsed.role !== undefined) updatePayload.role = parsed.role.trim();
        if (parsed.photoUrl !== undefined) updatePayload.photoUrl = normalizeText(parsed.photoUrl);
        if (parsed.displayOrder !== undefined) updatePayload.displayOrder = parsed.displayOrder;
        if (parsed.isActive !== undefined) updatePayload.isActive = parsed.isActive;

        await db.update(staff).set(updatePayload).where(eq(staff.id, id));

        revalidateStaffPages(id);
        return { success: true };
    } catch (error: unknown) {
        return { success: false, error: getErrorMessage(error, "Nao foi possivel atualizar o membro da comissao.") };
    }
}

export async function deleteStaffMember(id: string) {
    try {
        await db.delete(staff).where(eq(staff.id, id));

        revalidateStaffPages(id);
        return { success: true };
    } catch (error: unknown) {
        return { success: false, error: getErrorMessage(error, "Nao foi possivel excluir o membro da comissao.") };
    }
}
