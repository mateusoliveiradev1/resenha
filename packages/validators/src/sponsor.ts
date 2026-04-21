import { z } from "zod";

export const sponsorTierValues = ["MASTER", "OURO", "PRATA", "APOIO"] as const;
export const sponsorRelationshipTypeValues = ["CLUB_SPONSOR", "SITE_PARTNER", "SUPPORTER", "BOTH"] as const;

const isValidImageReference = (value: string) => {
    if (value.startsWith("/")) {
        return true;
    }

    try {
        new URL(value);
        return true;
    } catch {
        return false;
    }
};

const optionalTextField = z.preprocess(
    (value) => value === "" ? null : value,
    z.string().trim().optional().nullable()
);

const optionalImageField = z.preprocess(
    (value) => value === "" ? null : value,
    z.string().trim().refine(isValidImageReference, "Informe uma URL valida ou use o upload do sistema").optional().nullable()
);

const optionalWebsiteField = z.preprocess(
    (value) => value === "" ? null : value,
    z
        .string()
        .trim()
        .url("Informe uma URL completa, com https://")
        .optional()
        .nullable()
);

export const CreateSponsorSchema = z.object({
    name: z.string().trim().min(2, "Nome muito curto"),
    logoUrl: optionalImageField,
    websiteUrl: optionalWebsiteField,
    description: optionalTextField,
    tier: z.enum(sponsorTierValues),
    relationshipType: z.enum(sponsorRelationshipTypeValues).default("CLUB_SPONSOR"),
    displayOrder: z.coerce.number().int().min(0).max(999).default(0),
    featuredOnHome: z.boolean().default(true),
    isActive: z.boolean().default(true),
});

export const UpdateSponsorSchema = CreateSponsorSchema.partial();

export type SponsorTier = (typeof sponsorTierValues)[number];
export type SponsorRelationshipType = (typeof sponsorRelationshipTypeValues)[number];
export type CreateSponsorInput = z.infer<typeof CreateSponsorSchema>;
export type UpdateSponsorInput = z.infer<typeof UpdateSponsorSchema>;
