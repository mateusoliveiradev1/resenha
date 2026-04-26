import { z } from "zod";

export const leadJourneyValues = ["support", "commercial"] as const;
export const leadStatusValues = ["NEW", "CONTACTED", "QUALIFIED", "WON", "LOST"] as const;
export const commercialOfferSlotValues = ["base_offer", "addon"] as const;
export const followUpChannelValues = ["whatsapp", "email", "crm"] as const;
export const commercialCampaignPackageTypeValues = ["round", "seasonal"] as const;
export const commercialCampaignStatusValues = ["DRAFT", "ACTIVE", "PAUSED", "FINISHED"] as const;
export const monetizationEventNameValues = [
    "monetization_cta_click",
    "support_form_start",
    "support_form_submit",
    "support_form_success",
    "support_form_error",
    "partner_form_start",
    "partner_form_submit",
    "partner_form_success",
    "partner_form_error",
    "partner_logo_click",
    "plan_cta_click",
    "faq_expand",
] as const;

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

const optionalEmailField = z.preprocess(
    (value) => value === "" ? null : value,
    z
        .string()
        .trim()
        .email("Informe um e-mail valido.")
        .optional()
        .nullable()
);

const optionalLongTextField = z.preprocess(
    (value) => value === "" ? null : value,
    z.string().trim().max(800, "Use no maximo 800 caracteres.").optional().nullable()
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

const sourceField = z.preprocess(
    (value) => typeof value === "string" && value.trim() ? value : "lead_form",
    z.string().trim().min(1).max(120).default("lead_form")
);

const whatsappField = z
    .string()
    .trim()
    .refine((value) => value.replace(/\D/g, "").length >= 10, "Informe um WhatsApp valido com DDD.");

const optionalInstagramOrSiteField = z.preprocess(
    (value) => value === "" ? null : value,
    z
        .string()
        .trim()
        .refine((value) => {
            if (!value) {
                return true;
            }

            if (/^@[a-zA-Z0-9._]{2,30}$/.test(value)) {
                return true;
            }

            try {
                const url = new URL(value);

                return url.protocol === "http:" || url.protocol === "https:";
            } catch {
                return false;
            }
        }, "Informe um @perfil ou uma URL completa com https://.")
        .optional()
        .nullable()
);

const rawPayloadSchema = z.record(z.unknown());

const valueLength = (value: string | null | undefined) => value?.trim().length ?? 0;
const monetizationEventNameSet = new Set<string>(monetizationEventNameValues);

export const UpdateLeadStatusSchema = z.object({
    id: z.string().uuid("Lead invalido."),
    status: z.enum(leadStatusValues),
});

export const PublicLeadValuesSchema = z.object({
    name: z.string().trim().min(2, "Informe o nome."),
    company: optionalTextField,
    whatsapp: whatsappField,
    email: optionalEmailField,
    city: optionalTextField,
    supportType: optionalTextField,
    supportDescription: optionalLongTextField,
    advertisingOption: optionalTextField,
    businessType: optionalTextField,
    instagramOrSite: optionalInstagramOrSiteField,
    message: optionalLongTextField,
    contactConsent: z.boolean().refine((value) => value, "Confirme que podemos entrar em contato."),
}).passthrough();

export const PublicLeadSubmissionSchema = z.object({
    variant: z.enum(leadJourneyValues),
    source: sourceField,
    values: PublicLeadValuesSchema,
}).superRefine((data, context) => {
    if (data.variant === "support") {
        if (!data.values.supportType) {
            context.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["values", "supportType"],
                message: "Escolha uma forma de apoio."
            });
        }

        if (valueLength(data.values.supportDescription) < 8) {
            context.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["values", "supportDescription"],
                message: "Descreva em poucas palavras como voce imagina o apoio."
            });
        }
    }

    if (data.variant === "commercial") {
        if (valueLength(data.values.company) < 2) {
            context.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["values", "company"],
                message: "Informe o nome da empresa ou marca."
            });
        }

        if (!data.values.advertisingOption) {
            context.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["values", "advertisingOption"],
                message: "Escolha uma opcao de divulgacao."
            });
        }
    }
});

export const CreateMonetizationLeadSchema = z.object({
    journey: z.enum(leadJourneyValues),
    source: sourceField,
    status: z.enum(leadStatusValues).default("NEW"),
    name: z.string().trim().min(2, "Informe o nome."),
    company: optionalTextField,
    whatsapp: whatsappField,
    email: optionalEmailField,
    city: optionalTextField,
    supportType: optionalTextField,
    supportDescription: optionalLongTextField,
    advertisingOption: optionalTextField,
    businessType: optionalTextField,
    instagramOrSite: optionalInstagramOrSiteField,
    message: optionalLongTextField,
    rawPayload: rawPayloadSchema.optional(),
});

export const PublicMonetizationEventPayloadSchema = z.object({
    source: optionalTextField,
    journey: z.enum(leadJourneyValues).optional().nullable(),
    label: optionalTextField,
    destination: optionalTextField,
    partner_name: optionalTextField,
    url: optionalTextField,
    plan_name: optionalTextField,
    offer_name: optionalTextField,
    page: optionalTextField,
    question: optionalTextField,
    context: optionalTextField,
    experiment_key: optionalTextField,
    experiment_variant: optionalTextField,
    reason: optionalTextField,
    field: optionalTextField,
}).passthrough();

export const CreateMonetizationEventSchema = z.object({
    eventName: z.enum(monetizationEventNameValues),
    source: optionalTextField,
    journey: z.enum(leadJourneyValues).optional().nullable(),
    label: optionalTextField,
    destination: optionalTextField,
    partnerName: optionalTextField,
    url: optionalTextField,
    planName: optionalTextField,
    offerName: optionalTextField,
    page: optionalTextField,
    question: optionalTextField,
    rawPayload: rawPayloadSchema.optional(),
});

export type NormalizeMonetizationEventResult =
    | { success: true; data: CreateMonetizationEventInput }
    | { success: false; error: "Invalid analytics event." | "Invalid analytics payload." };

export function normalizeMonetizationEventInput(name: unknown, payload: unknown): NormalizeMonetizationEventResult {
    if (typeof name !== "string" || !monetizationEventNameSet.has(name)) {
        return { success: false, error: "Invalid analytics event." };
    }

    const parsedPayload = PublicMonetizationEventPayloadSchema.safeParse(payload ?? {});

    if (!parsedPayload.success) {
        return { success: false, error: "Invalid analytics payload." };
    }

    const normalizedPayload = parsedPayload.data;
    const parsedEvent = CreateMonetizationEventSchema.safeParse({
        eventName: name,
        source: normalizedPayload.source,
        journey: normalizedPayload.journey,
        label: normalizedPayload.label,
        destination: normalizedPayload.destination,
        partnerName: normalizedPayload.partner_name,
        url: normalizedPayload.url,
        planName: normalizedPayload.plan_name,
        offerName: normalizedPayload.offer_name,
        page: normalizedPayload.page,
        question: normalizedPayload.question,
        rawPayload: normalizedPayload
    });

    if (!parsedEvent.success) {
        return { success: false, error: "Invalid analytics payload." };
    }

    return { success: true, data: parsedEvent.data };
}

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
export type MonetizationEventName = (typeof monetizationEventNameValues)[number];
export type PublicLeadValuesInput = z.infer<typeof PublicLeadValuesSchema>;
export type PublicLeadSubmissionInput = z.infer<typeof PublicLeadSubmissionSchema>;
export type CreateMonetizationLeadInput = z.infer<typeof CreateMonetizationLeadSchema>;
export type PublicMonetizationEventPayloadInput = z.infer<typeof PublicMonetizationEventPayloadSchema>;
export type CreateMonetizationEventInput = z.infer<typeof CreateMonetizationEventSchema>;
export type SaveCommercialOfferContentInput = z.infer<typeof SaveCommercialOfferContentSchema>;
export type SaveEditorialOfferingInput = z.infer<typeof SaveEditorialOfferingSchema>;
export type SaveLeadFollowUpAutomationInput = z.infer<typeof SaveLeadFollowUpAutomationSchema>;
export type SaveCommercialCampaignPackageInput = z.infer<typeof SaveCommercialCampaignPackageSchema>;
export type SavePremiumPartnerPageInput = z.infer<typeof SavePremiumPartnerPageSchema>;
export type SaveCopyCtaExperimentInput = z.infer<typeof SaveCopyCtaExperimentSchema>;
