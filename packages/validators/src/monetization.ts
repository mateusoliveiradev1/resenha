import { z } from "zod";

export const leadJourneyValues = ["support", "commercial"] as const;
export const leadStatusValues = ["NEW", "CONTACTED", "QUALIFIED", "WON", "LOST"] as const;
export const commercialOfferSlotValues = ["base_offer", "addon"] as const;
export const followUpChannelValues = ["whatsapp", "email", "crm"] as const;
export const commercialCampaignPackageTypeValues = ["round", "seasonal"] as const;
export const commercialCampaignStatusValues = ["DRAFT", "ACTIVE", "PAUSED", "FINISHED"] as const;

const optionalTextField = z.preprocess(
    (value) => value === "" ? null : value,
    z.string().trim().optional().nullable()
);

const optionalUrlField = z.preprocess(
    (value) => value === "" ? null : value,
    z
        .string()
        .trim()
        .url("Informe uma URL completa, com https://")
        .optional()
        .nullable()
);

const textListField = z.preprocess((value) => {
    if (Array.isArray(value)) {
        return value;
    }

    if (typeof value !== "string") {
        return [];
    }

    return value
        .split(/\r?\n/)
        .map((item) => item.trim())
        .filter(Boolean);
}, z.array(z.string().trim().min(2)).default([]));

const optionalDateField = z.preprocess((value) => {
    if (value instanceof Date) {
        return Number.isNaN(value.getTime()) ? null : value;
    }

    if (typeof value !== "string") {
        return null;
    }

    const trimmed = value.trim();

    return trimmed ? new Date(trimmed) : null;
}, z.date().optional().nullable());

export const UpdateLeadStatusSchema = z.object({
    status: z.enum(leadStatusValues),
});

export const SaveCommercialOfferContentSchema = z.object({
    id: z.string().uuid().optional().nullable(),
    offerKey: z.string().trim().min(2, "Informe uma chave curta para este formato."),
    slot: z.enum(commercialOfferSlotValues),
    title: z.string().trim().min(3, "Informe o titulo."),
    badge: optionalTextField,
    audience: optionalTextField,
    description: z.string().trim().min(10, "Descreva o formato comercial."),
    inclusions: textListField,
    note: optionalTextField,
    ctaLabel: optionalTextField,
    displayOrder: z.coerce.number().int().min(0).max(999).default(0),
    isActive: z.boolean().default(false),
});

export const SaveEditorialOfferingSchema = z.object({
    id: z.string().uuid().optional().nullable(),
    label: z.string().trim().min(2).default("Oferecimento"),
    partnerName: z.string().trim().min(2, "Informe o parceiro."),
    title: optionalTextField,
    description: optionalTextField,
    href: optionalUrlField,
    linkLabel: z.string().trim().min(2).default("Conhecer parceiro"),
    displayOrder: z.coerce.number().int().min(0).max(999).default(0),
    isActive: z.boolean().default(false),
});

export const SaveLeadFollowUpAutomationSchema = z.object({
    id: z.string().uuid().optional().nullable(),
    name: z.string().trim().min(3, "Informe um nome para a automacao."),
    channel: z.enum(followUpChannelValues),
    journey: z.enum(leadJourneyValues).optional().nullable(),
    triggerStatus: z.enum(leadStatusValues),
    destinationHint: optionalTextField,
    messageTemplate: z.string().trim().min(12, "Informe a mensagem de acompanhamento."),
    isActive: z.boolean().default(false),
});

export const SaveCommercialCampaignPackageSchema = z.object({
    id: z.string().uuid().optional().nullable(),
    campaignKey: z.string().trim().min(2, "Informe uma chave curta para a campanha."),
    title: z.string().trim().min(3, "Informe o titulo da campanha."),
    packageType: z.enum(commercialCampaignPackageTypeValues),
    status: z.enum(commercialCampaignStatusValues),
    sponsorId: z.string().uuid().optional().nullable(),
    partnerName: optionalTextField,
    roundLabel: optionalTextField,
    seasonLabel: optionalTextField,
    description: z.string().trim().min(10, "Descreva o pacote comercial."),
    placements: textListField,
    startsAt: optionalDateField,
    endsAt: optionalDateField,
    displayOrder: z.coerce.number().int().min(0).max(999).default(0),
    isActive: z.boolean().default(false),
});

export const SavePremiumPartnerPageSchema = z.object({
    id: z.string().uuid().optional().nullable(),
    slug: z.string().trim().min(2, "Informe um slug.").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use apenas letras minusculas, numeros e hifens."),
    sponsorId: z.string().uuid().optional().nullable(),
    partnerName: z.string().trim().min(2, "Informe o parceiro."),
    title: z.string().trim().min(3, "Informe o titulo da pagina."),
    summary: z.string().trim().min(10, "Informe um resumo curto."),
    body: optionalTextField,
    heroImageUrl: optionalUrlField,
    ctaLabel: z.string().trim().min(2).default("Conhecer parceiro"),
    ctaHref: optionalUrlField,
    displayOrder: z.coerce.number().int().min(0).max(999).default(0),
    isActive: z.boolean().default(false),
    publishedAt: optionalDateField,
});

export const SaveCopyCtaExperimentSchema = z.object({
    id: z.string().uuid().optional().nullable(),
    experimentKey: z.string().trim().min(2, "Informe uma chave curta para o experimento."),
    surface: z.string().trim().min(2, "Informe a superficie do experimento."),
    journey: z.enum(leadJourneyValues),
    variantLabel: z.string().trim().min(2, "Informe o nome da variante."),
    headline: optionalTextField,
    supportingCopy: optionalTextField,
    ctaLabel: optionalTextField,
    destination: optionalTextField,
    trafficWeight: z.coerce.number().int().min(1).max(100).default(100),
    minSampleSize: z.coerce.number().int().min(1).max(100000).default(100),
    startsAt: optionalDateField,
    endsAt: optionalDateField,
    notes: optionalTextField,
    isActive: z.boolean().default(false),
});

export type LeadJourney = (typeof leadJourneyValues)[number];
export type LeadStatus = (typeof leadStatusValues)[number];
export type CommercialOfferSlot = (typeof commercialOfferSlotValues)[number];
export type FollowUpChannel = (typeof followUpChannelValues)[number];
export type CommercialCampaignPackageType = (typeof commercialCampaignPackageTypeValues)[number];
export type CommercialCampaignStatus = (typeof commercialCampaignStatusValues)[number];
export type SaveCommercialOfferContentInput = z.infer<typeof SaveCommercialOfferContentSchema>;
export type SaveEditorialOfferingInput = z.infer<typeof SaveEditorialOfferingSchema>;
export type SaveLeadFollowUpAutomationInput = z.infer<typeof SaveLeadFollowUpAutomationSchema>;
export type SaveCommercialCampaignPackageInput = z.infer<typeof SaveCommercialCampaignPackageSchema>;
export type SavePremiumPartnerPageInput = z.infer<typeof SavePremiumPartnerPageSchema>;
export type SaveCopyCtaExperimentInput = z.infer<typeof SaveCopyCtaExperimentSchema>;
