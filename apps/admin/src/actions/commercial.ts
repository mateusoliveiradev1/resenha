"use server";

import { db } from "@resenha/db";
import {
    commercialCampaignPackages,
    commercialOfferContents,
    copyCtaExperiments,
    editorialOfferings,
    leadFollowUpAutomations,
    premiumPartnerPages
} from "@resenha/db/schema";
import {
    SaveCommercialCampaignPackageSchema,
    SaveCommercialOfferContentSchema,
    SaveCopyCtaExperimentSchema,
    SaveEditorialOfferingSchema,
    SaveLeadFollowUpAutomationSchema,
    SavePremiumPartnerPageSchema,
    type SaveCommercialCampaignPackageInput,
    type SaveCommercialOfferContentInput,
    type SaveCopyCtaExperimentInput,
    type SaveEditorialOfferingInput,
    type SaveLeadFollowUpAutomationInput,
    type SavePremiumPartnerPageInput
} from "@resenha/validators";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { ZodError } from "zod";

export type CommercialActionState = {
    status: "idle" | "success" | "error";
    message: string;
    fieldErrors?: Record<string, string>;
    values?: Record<string, string>;
};

const getString = (formData: FormData, key: string) => {
    const value = formData.get(key);

    return typeof value === "string" ? value : "";
};

const getBoolean = (formData: FormData, key: string) => (
    formData.getAll(key).some((value) => value === "on")
);

const normalizeId = (value: string) => {
    const trimmed = value.trim();

    return trimmed ? trimmed : null;
};

const getErrorMessage = (error: unknown, fallbackMessage: string) => {
    if (error instanceof Error && error.message) {
        return error.message;
    }

    return fallbackMessage;
};

const getFormValues = (formData: FormData) => {
    const values: Record<string, string> = {};

    formData.forEach((value, key) => {
        if (typeof value === "string") {
            values[key] = value;
        }
    });

    return values;
};

const getFieldErrors = (error: ZodError) => {
    const fieldErrors: Record<string, string> = {};

    Object.entries(error.flatten().fieldErrors).forEach(([field, messages]) => {
        const message = messages?.[0];

        if (message) {
            fieldErrors[field] = message;
        }
    });

    return fieldErrors;
};

const createSuccessState = (message: string): CommercialActionState => ({
    status: "success",
    message
});

const createErrorState = (
    error: unknown,
    fallbackMessage: string,
    formData: FormData
): CommercialActionState => {
    if (error instanceof ZodError) {
        return {
            status: "error",
            message: error.issues[0]?.message ?? fallbackMessage,
            fieldErrors: getFieldErrors(error),
            values: getFormValues(formData)
        };
    }

    return {
        status: "error",
        message: getErrorMessage(error, fallbackMessage),
        values: getFormValues(formData)
    };
};

function revalidateCommercialSurfaces() {
    revalidatePath("/comercial");
    revalidatePath("/leads");
    revalidatePath("/seja-parceiro");
    revalidatePath("/patrocinadores");
    revalidatePath("/parceiros");
    revalidatePath("/blog");
}

function revalidatePremiumPartnerPage(slug: string | null | undefined) {
    if (slug) {
        revalidatePath(`/parceiros/${slug}`);
    }
}

function readCommercialOffer(formData: FormData): SaveCommercialOfferContentInput {
    return SaveCommercialOfferContentSchema.parse({
        id: normalizeId(getString(formData, "id")),
        offerKey: getString(formData, "offerKey"),
        slot: getString(formData, "slot"),
        title: getString(formData, "title"),
        badge: getString(formData, "badge"),
        audience: getString(formData, "audience"),
        description: getString(formData, "description"),
        inclusions: getString(formData, "inclusions"),
        note: getString(formData, "note"),
        ctaLabel: getString(formData, "ctaLabel"),
        displayOrder: getString(formData, "displayOrder"),
        isActive: getBoolean(formData, "isActive"),
    });
}

function readEditorialOffering(formData: FormData): SaveEditorialOfferingInput {
    return SaveEditorialOfferingSchema.parse({
        id: normalizeId(getString(formData, "id")),
        label: getString(formData, "label") || "Oferecimento",
        partnerName: getString(formData, "partnerName"),
        title: getString(formData, "title"),
        description: getString(formData, "description"),
        href: getString(formData, "href"),
        linkLabel: getString(formData, "linkLabel") || "Conhecer parceiro",
        displayOrder: getString(formData, "displayOrder"),
        isActive: getBoolean(formData, "isActive"),
    });
}

function readLeadFollowUpAutomation(formData: FormData): SaveLeadFollowUpAutomationInput {
    return SaveLeadFollowUpAutomationSchema.parse({
        id: normalizeId(getString(formData, "id")),
        name: getString(formData, "name"),
        channel: getString(formData, "channel") || "whatsapp",
        journey: getString(formData, "journey") || null,
        triggerStatus: getString(formData, "triggerStatus") || "NEW",
        destinationHint: getString(formData, "destinationHint"),
        messageTemplate: getString(formData, "messageTemplate"),
        isActive: getBoolean(formData, "isActive"),
    });
}

function readCommercialCampaignPackage(formData: FormData): SaveCommercialCampaignPackageInput {
    return SaveCommercialCampaignPackageSchema.parse({
        id: normalizeId(getString(formData, "id")),
        campaignKey: getString(formData, "campaignKey"),
        title: getString(formData, "title"),
        packageType: getString(formData, "packageType") || "round",
        status: getString(formData, "status") || "DRAFT",
        sponsorId: normalizeId(getString(formData, "sponsorId")),
        partnerName: getString(formData, "partnerName"),
        roundLabel: getString(formData, "roundLabel"),
        seasonLabel: getString(formData, "seasonLabel"),
        description: getString(formData, "description"),
        placements: getString(formData, "placements"),
        startsAt: getString(formData, "startsAt"),
        endsAt: getString(formData, "endsAt"),
        displayOrder: getString(formData, "displayOrder"),
        isActive: getBoolean(formData, "isActive"),
    });
}

function readPremiumPartnerPage(formData: FormData): SavePremiumPartnerPageInput {
    return SavePremiumPartnerPageSchema.parse({
        id: normalizeId(getString(formData, "id")),
        slug: getString(formData, "slug"),
        sponsorId: normalizeId(getString(formData, "sponsorId")),
        partnerName: getString(formData, "partnerName"),
        title: getString(formData, "title"),
        summary: getString(formData, "summary"),
        body: getString(formData, "body"),
        heroImageUrl: getString(formData, "heroImageUrl"),
        ctaLabel: getString(formData, "ctaLabel") || "Conhecer parceiro",
        ctaHref: getString(formData, "ctaHref"),
        displayOrder: getString(formData, "displayOrder"),
        isActive: getBoolean(formData, "isActive"),
        publishedAt: getString(formData, "publishedAt"),
    });
}

function readCopyCtaExperiment(formData: FormData): SaveCopyCtaExperimentInput {
    return SaveCopyCtaExperimentSchema.parse({
        id: normalizeId(getString(formData, "id")),
        experimentKey: getString(formData, "experimentKey"),
        surface: getString(formData, "surface"),
        journey: getString(formData, "journey") || "commercial",
        variantLabel: getString(formData, "variantLabel"),
        headline: getString(formData, "headline"),
        supportingCopy: getString(formData, "supportingCopy"),
        ctaLabel: getString(formData, "ctaLabel"),
        destination: getString(formData, "destination"),
        trafficWeight: getString(formData, "trafficWeight"),
        minSampleSize: getString(formData, "minSampleSize"),
        startsAt: getString(formData, "startsAt"),
        endsAt: getString(formData, "endsAt"),
        notes: getString(formData, "notes"),
        isActive: getBoolean(formData, "isActive"),
    });
}

export async function saveCommercialOfferContent(
    _previousState: CommercialActionState,
    formData: FormData
): Promise<CommercialActionState> {
    try {
        const parsed = readCommercialOffer(formData);
        const payload = {
            offerKey: parsed.offerKey,
            slot: parsed.slot,
            title: parsed.title,
            badge: parsed.badge,
            audience: parsed.audience,
            description: parsed.description,
            inclusions: parsed.inclusions,
            note: parsed.note,
            ctaLabel: parsed.ctaLabel,
            displayOrder: parsed.displayOrder,
            isActive: parsed.isActive,
            updatedAt: new Date()
        };

        if (parsed.id) {
            await db.update(commercialOfferContents).set(payload).where(eq(commercialOfferContents.id, parsed.id));
        } else {
            await db.insert(commercialOfferContents).values(payload);
        }

        revalidateCommercialSurfaces();
        return createSuccessState("Formato comercial salvo. As superficies comerciais foram revalidadas.");
    } catch (error: unknown) {
        return createErrorState(error, "Nao foi possivel salvar o formato comercial.", formData);
    }
}

export async function deleteCommercialOfferContent(
    _previousState: CommercialActionState,
    formData: FormData
): Promise<CommercialActionState> {
    try {
        const id = normalizeId(getString(formData, "id"));

        if (!id) {
            throw new Error("Formato comercial nao encontrado.");
        }

        await db.delete(commercialOfferContents).where(eq(commercialOfferContents.id, id));
        revalidateCommercialSurfaces();
        return createSuccessState("Formato comercial removido. A pagina publica usara outro registro ativo ou fallback.");
    } catch (error: unknown) {
        return createErrorState(error, "Nao foi possivel remover o formato comercial.", formData);
    }
}

export async function saveEditorialOffering(
    _previousState: CommercialActionState,
    formData: FormData
): Promise<CommercialActionState> {
    try {
        const parsed = readEditorialOffering(formData);
        const payload = {
            label: parsed.label,
            partnerName: parsed.partnerName,
            title: parsed.title,
            description: parsed.description,
            href: parsed.href,
            linkLabel: parsed.linkLabel,
            displayOrder: parsed.displayOrder,
            isActive: parsed.isActive,
            updatedAt: new Date()
        };

        if (parsed.id) {
            await db.update(editorialOfferings).set(payload).where(eq(editorialOfferings.id, parsed.id));
        } else {
            await db.insert(editorialOfferings).values(payload);
        }

        revalidateCommercialSurfaces();
        return createSuccessState("Oferecimento editorial salvo e disponivel para uso em posts.");
    } catch (error: unknown) {
        return createErrorState(error, "Nao foi possivel salvar o oferecimento editorial.", formData);
    }
}

export async function deleteEditorialOffering(
    _previousState: CommercialActionState,
    formData: FormData
): Promise<CommercialActionState> {
    try {
        const id = normalizeId(getString(formData, "id"));

        if (!id) {
            throw new Error("Oferecimento nao encontrado.");
        }

        await db.delete(editorialOfferings).where(eq(editorialOfferings.id, id));
        revalidateCommercialSurfaces();
        return createSuccessState("Oferecimento editorial removido e paginas editoriais revalidadas.");
    } catch (error: unknown) {
        return createErrorState(error, "Nao foi possivel remover o oferecimento editorial.", formData);
    }
}

export async function saveLeadFollowUpAutomation(
    _previousState: CommercialActionState,
    formData: FormData
): Promise<CommercialActionState> {
    try {
        const parsed = readLeadFollowUpAutomation(formData);
        const payload = {
            name: parsed.name,
            channel: parsed.channel,
            journey: parsed.journey,
            triggerStatus: parsed.triggerStatus,
            destinationHint: parsed.destinationHint,
            messageTemplate: parsed.messageTemplate,
            isActive: parsed.isActive,
            updatedAt: new Date()
        };

        if (parsed.id) {
            await db.update(leadFollowUpAutomations).set(payload).where(eq(leadFollowUpAutomations.id, parsed.id));
        } else {
            await db.insert(leadFollowUpAutomations).values(payload);
        }

        revalidateCommercialSurfaces();
        return createSuccessState("Automacao salva. A selecao de template dos leads foi revalidada.");
    } catch (error: unknown) {
        return createErrorState(error, "Nao foi possivel salvar a automacao de follow-up.", formData);
    }
}

export async function deleteLeadFollowUpAutomation(
    _previousState: CommercialActionState,
    formData: FormData
): Promise<CommercialActionState> {
    try {
        const id = normalizeId(getString(formData, "id"));

        if (!id) {
            throw new Error("Automacao nao encontrada.");
        }

        await db.delete(leadFollowUpAutomations).where(eq(leadFollowUpAutomations.id, id));
        revalidateCommercialSurfaces();
        return createSuccessState("Automacao removida. O modulo de leads voltara ao proximo template valido ou fallback.");
    } catch (error: unknown) {
        return createErrorState(error, "Nao foi possivel remover a automacao de follow-up.", formData);
    }
}

export async function saveCommercialCampaignPackage(
    _previousState: CommercialActionState,
    formData: FormData
): Promise<CommercialActionState> {
    try {
        const parsed = readCommercialCampaignPackage(formData);
        const payload = {
            campaignKey: parsed.campaignKey,
            title: parsed.title,
            packageType: parsed.packageType,
            status: parsed.status,
            sponsorId: parsed.sponsorId,
            partnerName: parsed.partnerName,
            roundLabel: parsed.roundLabel,
            seasonLabel: parsed.seasonLabel,
            description: parsed.description,
            placements: parsed.placements,
            startsAt: parsed.startsAt,
            endsAt: parsed.endsAt,
            displayOrder: parsed.displayOrder,
            isActive: parsed.isActive,
            updatedAt: new Date()
        };

        if (parsed.id) {
            await db.update(commercialCampaignPackages).set(payload).where(eq(commercialCampaignPackages.id, parsed.id));
        } else {
            await db.insert(commercialCampaignPackages).values(payload);
        }

        revalidateCommercialSurfaces();
        return createSuccessState("Pacote comercial salvo. Placements e superficies relacionadas foram revalidados.");
    } catch (error: unknown) {
        return createErrorState(error, "Nao foi possivel salvar o pacote comercial.", formData);
    }
}

export async function deleteCommercialCampaignPackage(
    _previousState: CommercialActionState,
    formData: FormData
): Promise<CommercialActionState> {
    try {
        const id = normalizeId(getString(formData, "id"));

        if (!id) {
            throw new Error("Pacote comercial nao encontrado.");
        }

        await db.delete(commercialCampaignPackages).where(eq(commercialCampaignPackages.id, id));
        revalidateCommercialSurfaces();
        return createSuccessState("Pacote comercial removido e dashboard revalidado.");
    } catch (error: unknown) {
        return createErrorState(error, "Nao foi possivel remover o pacote comercial.", formData);
    }
}

export async function savePremiumPartnerPage(
    _previousState: CommercialActionState,
    formData: FormData
): Promise<CommercialActionState> {
    try {
        const parsed = readPremiumPartnerPage(formData);
        const previousPage = parsed.id
            ? await db.query.premiumPartnerPages.findFirst({
                where: eq(premiumPartnerPages.id, parsed.id)
            })
            : null;
        const payload = {
            slug: parsed.slug,
            sponsorId: parsed.sponsorId,
            partnerName: parsed.partnerName,
            title: parsed.title,
            summary: parsed.summary,
            body: parsed.body,
            heroImageUrl: parsed.heroImageUrl,
            ctaLabel: parsed.ctaLabel,
            ctaHref: parsed.ctaHref,
            displayOrder: parsed.displayOrder,
            isActive: parsed.isActive,
            publishedAt: parsed.publishedAt,
            updatedAt: new Date()
        };

        if (parsed.id) {
            await db.update(premiumPartnerPages).set(payload).where(eq(premiumPartnerPages.id, parsed.id));
        } else {
            await db.insert(premiumPartnerPages).values(payload);
        }

        revalidateCommercialSurfaces();
        revalidatePremiumPartnerPage(previousPage?.slug);
        revalidatePremiumPartnerPage(parsed.slug);
        return createSuccessState(parsed.isActive
            ? "Pagina premium salva e publicada para o slug informado."
            : "Pagina premium salva como inativa. O slug publico retorna nao encontrado.");
    } catch (error: unknown) {
        return createErrorState(error, "Nao foi possivel salvar a pagina premium do parceiro.", formData);
    }
}

export async function deletePremiumPartnerPage(
    _previousState: CommercialActionState,
    formData: FormData
): Promise<CommercialActionState> {
    try {
        const id = normalizeId(getString(formData, "id"));

        if (!id) {
            throw new Error("Pagina premium nao encontrada.");
        }

        const [deletedPage] = await db
            .delete(premiumPartnerPages)
            .where(eq(premiumPartnerPages.id, id))
            .returning({ slug: premiumPartnerPages.slug });

        revalidateCommercialSurfaces();
        revalidatePremiumPartnerPage(deletedPage?.slug);
        return createSuccessState("Pagina premium removida. O slug publico foi revalidado.");
    } catch (error: unknown) {
        return createErrorState(error, "Nao foi possivel remover a pagina premium do parceiro.", formData);
    }
}

export async function saveCopyCtaExperiment(
    _previousState: CommercialActionState,
    formData: FormData
): Promise<CommercialActionState> {
    try {
        const parsed = readCopyCtaExperiment(formData);
        const payload = {
            experimentKey: parsed.experimentKey,
            surface: parsed.surface,
            journey: parsed.journey,
            variantLabel: parsed.variantLabel,
            headline: parsed.headline,
            supportingCopy: parsed.supportingCopy,
            ctaLabel: parsed.ctaLabel,
            destination: parsed.destination,
            trafficWeight: parsed.trafficWeight,
            minSampleSize: parsed.minSampleSize,
            startsAt: parsed.startsAt,
            endsAt: parsed.endsAt,
            notes: parsed.notes,
            isActive: parsed.isActive,
            updatedAt: new Date()
        };

        if (parsed.id) {
            await db.update(copyCtaExperiments).set(payload).where(eq(copyCtaExperiments.id, parsed.id));
        } else {
            await db.insert(copyCtaExperiments).values(payload);
        }

        revalidateCommercialSurfaces();
        return createSuccessState("Experimento salvo. A hero comercial usara apenas variantes ativas dentro da janela.");
    } catch (error: unknown) {
        return createErrorState(error, "Nao foi possivel salvar o experimento de copy e CTA.", formData);
    }
}

export async function deleteCopyCtaExperiment(
    _previousState: CommercialActionState,
    formData: FormData
): Promise<CommercialActionState> {
    try {
        const id = normalizeId(getString(formData, "id"));

        if (!id) {
            throw new Error("Experimento nao encontrado.");
        }

        await db.delete(copyCtaExperiments).where(eq(copyCtaExperiments.id, id));
        revalidateCommercialSurfaces();
        return createSuccessState("Experimento removido. A copy publica voltara para o proximo conteudo valido.");
    } catch (error: unknown) {
        return createErrorState(error, "Nao foi possivel remover o experimento de copy e CTA.", formData);
    }
}
