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

const getString = (formData: FormData, key: string) => {
    const value = formData.get(key);

    return typeof value === "string" ? value : "";
};

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

function revalidateCommercialSurfaces() {
    revalidatePath("/comercial");
    revalidatePath("/seja-parceiro");
    revalidatePath("/patrocinadores");
    revalidatePath("/parceiros");
    revalidatePath("/blog");
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
        isActive: formData.get("isActive") === "on",
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
        isActive: formData.get("isActive") === "on",
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
        isActive: formData.get("isActive") === "on",
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
        isActive: formData.get("isActive") === "on",
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
        isActive: formData.get("isActive") === "on",
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
        isActive: formData.get("isActive") === "on",
    });
}

export async function saveCommercialOfferContent(formData: FormData) {
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
    } catch (error: unknown) {
        throw new Error(getErrorMessage(error, "Nao foi possivel salvar o formato comercial."));
    }
}

export async function deleteCommercialOfferContent(formData: FormData) {
    try {
        const id = normalizeId(getString(formData, "id"));

        if (!id) {
            throw new Error("Formato comercial nao encontrado.");
        }

        await db.delete(commercialOfferContents).where(eq(commercialOfferContents.id, id));
        revalidateCommercialSurfaces();
    } catch (error: unknown) {
        throw new Error(getErrorMessage(error, "Nao foi possivel remover o formato comercial."));
    }
}

export async function saveEditorialOffering(formData: FormData) {
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
    } catch (error: unknown) {
        throw new Error(getErrorMessage(error, "Nao foi possivel salvar o oferecimento editorial."));
    }
}

export async function deleteEditorialOffering(formData: FormData) {
    try {
        const id = normalizeId(getString(formData, "id"));

        if (!id) {
            throw new Error("Oferecimento nao encontrado.");
        }

        await db.delete(editorialOfferings).where(eq(editorialOfferings.id, id));
        revalidateCommercialSurfaces();
    } catch (error: unknown) {
        throw new Error(getErrorMessage(error, "Nao foi possivel remover o oferecimento editorial."));
    }
}

export async function saveLeadFollowUpAutomation(formData: FormData) {
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
    } catch (error: unknown) {
        throw new Error(getErrorMessage(error, "Nao foi possivel salvar a automacao de follow-up."));
    }
}

export async function deleteLeadFollowUpAutomation(formData: FormData) {
    try {
        const id = normalizeId(getString(formData, "id"));

        if (!id) {
            throw new Error("Automacao nao encontrada.");
        }

        await db.delete(leadFollowUpAutomations).where(eq(leadFollowUpAutomations.id, id));
        revalidateCommercialSurfaces();
    } catch (error: unknown) {
        throw new Error(getErrorMessage(error, "Nao foi possivel remover a automacao de follow-up."));
    }
}

export async function saveCommercialCampaignPackage(formData: FormData) {
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
    } catch (error: unknown) {
        throw new Error(getErrorMessage(error, "Nao foi possivel salvar o pacote comercial."));
    }
}

export async function deleteCommercialCampaignPackage(formData: FormData) {
    try {
        const id = normalizeId(getString(formData, "id"));

        if (!id) {
            throw new Error("Pacote comercial nao encontrado.");
        }

        await db.delete(commercialCampaignPackages).where(eq(commercialCampaignPackages.id, id));
        revalidateCommercialSurfaces();
    } catch (error: unknown) {
        throw new Error(getErrorMessage(error, "Nao foi possivel remover o pacote comercial."));
    }
}

export async function savePremiumPartnerPage(formData: FormData) {
    try {
        const parsed = readPremiumPartnerPage(formData);
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
    } catch (error: unknown) {
        throw new Error(getErrorMessage(error, "Nao foi possivel salvar a pagina premium do parceiro."));
    }
}

export async function deletePremiumPartnerPage(formData: FormData) {
    try {
        const id = normalizeId(getString(formData, "id"));

        if (!id) {
            throw new Error("Pagina premium nao encontrada.");
        }

        await db.delete(premiumPartnerPages).where(eq(premiumPartnerPages.id, id));
        revalidateCommercialSurfaces();
    } catch (error: unknown) {
        throw new Error(getErrorMessage(error, "Nao foi possivel remover a pagina premium do parceiro."));
    }
}

export async function saveCopyCtaExperiment(formData: FormData) {
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
    } catch (error: unknown) {
        throw new Error(getErrorMessage(error, "Nao foi possivel salvar o experimento de copy e CTA."));
    }
}

export async function deleteCopyCtaExperiment(formData: FormData) {
    try {
        const id = normalizeId(getString(formData, "id"));

        if (!id) {
            throw new Error("Experimento nao encontrado.");
        }

        await db.delete(copyCtaExperiments).where(eq(copyCtaExperiments.id, id));
        revalidateCommercialSurfaces();
    } catch (error: unknown) {
        throw new Error(getErrorMessage(error, "Nao foi possivel remover o experimento de copy e CTA."));
    }
}
