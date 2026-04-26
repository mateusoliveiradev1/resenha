export interface MonetizationCta {
    label: string;
    href: string;
    external?: boolean;
}

export interface CommercialOffer {
    badge?: string;
    title: string;
    audience?: string;
    description: string;
    inclusions: string[];
    note?: string;
    cta?: MonetizationCta;
}

export interface CommercialAddOn {
    title: string;
    description: string;
    badge?: string;
    cta?: MonetizationCta;
}

export interface CommercialOfferContentRow {
    slot: "base_offer" | "addon";
    title: string;
    badge?: string | null;
    audience?: string | null;
    description: string;
    inclusions?: string[] | null;
    note?: string | null;
    ctaLabel?: string | null;
}

export function resolveCommercialOfferContent(
    rows: CommercialOfferContentRow[],
    fallbackOffer: CommercialOffer,
    fallbackAddOns: CommercialAddOn[],
    buildOfferHref: (title: string) => string
) {
    const baseOffer = rows.find((row) => row.slot === "base_offer");
    const addOnRows = rows.filter((row) => row.slot === "addon");

    const offer: CommercialOffer = baseOffer
        ? {
            badge: baseOffer.badge ?? undefined,
            title: baseOffer.title,
            audience: baseOffer.audience ?? undefined,
            description: baseOffer.description,
            inclusions: baseOffer.inclusions?.length ? baseOffer.inclusions : fallbackOffer.inclusions,
            note: baseOffer.note ?? undefined,
            cta: {
                label: baseOffer.ctaLabel ?? fallbackOffer.cta?.label ?? "Quero aparecer no Resenha",
                href: buildOfferHref(baseOffer.title),
                external: true
            }
        }
        : fallbackOffer;

    const addOns: CommercialAddOn[] = addOnRows.length
        ? addOnRows.map((row) => ({
            title: row.title,
            description: row.description,
            badge: row.badge ?? undefined,
            cta: {
                label: row.ctaLabel ?? "Falar no WhatsApp",
                href: buildOfferHref(row.title),
                external: true
            }
        }))
        : fallbackAddOns;

    return { offer, addOns };
}
