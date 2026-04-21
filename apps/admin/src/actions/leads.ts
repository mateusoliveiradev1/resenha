"use server";

import { db } from "@resenha/db";
import { monetizationLeads } from "@resenha/db/schema";
import { UpdateLeadStatusSchema, type LeadStatus } from "@resenha/validators";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

const getErrorMessage = (error: unknown, fallbackMessage: string) => {
    if (error instanceof Error && error.message) {
        return error.message;
    }

    return fallbackMessage;
};

export async function updateLeadStatus(id: string, status: LeadStatus) {
    try {
        const parsed = UpdateLeadStatusSchema.parse({ status });

        await db.update(monetizationLeads).set({
            status: parsed.status,
            updatedAt: new Date()
        }).where(eq(monetizationLeads.id, id));

        revalidatePath("/leads");
        return { success: true };
    } catch (error: unknown) {
        return { success: false, error: getErrorMessage(error, "Nao foi possivel atualizar o lead.") };
    }
}
