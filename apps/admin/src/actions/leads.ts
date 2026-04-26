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
        const parsed = UpdateLeadStatusSchema.safeParse({ id, status });

        if (!parsed.success) {
            return {
                success: false,
                error: parsed.error.issues[0]?.message ?? "Dados invalidos para atualizar o lead."
            };
        }

        const [updatedLead] = await db.update(monetizationLeads).set({
            status: parsed.data.status,
            updatedAt: new Date()
        }).where(eq(monetizationLeads.id, parsed.data.id)).returning({
            id: monetizationLeads.id,
            status: monetizationLeads.status
        });

        if (!updatedLead) {
            return { success: false, error: "Lead nao encontrado." };
        }

        revalidatePath("/leads");
        return { success: true, lead: updatedLead };
    } catch (error: unknown) {
        return { success: false, error: getErrorMessage(error, "Nao foi possivel atualizar o lead.") };
    }
}
