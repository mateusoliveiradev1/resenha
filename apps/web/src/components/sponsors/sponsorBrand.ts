import type { CSSProperties } from "react";

const sponsorStopWords = new Set(["a", "da", "das", "de", "do", "dos", "e"]);
const positionPrefixPattern = /^posicao no uniforme:\s*/i;

const fallbackPalettes = [
    {
        backgroundImage: "linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(30, 64, 175, 0.96))",
        accentColor: "rgba(250, 204, 21, 0.86)",
        spotlight: "radial-gradient(circle at top left, rgba(255,255,255,0.2), transparent 52%)"
    },
    {
        backgroundImage: "linear-gradient(135deg, rgba(10, 22, 40, 0.98), rgba(8, 145, 178, 0.92))",
        accentColor: "rgba(255, 241, 118, 0.84)",
        spotlight: "radial-gradient(circle at top left, rgba(255,255,255,0.18), transparent 50%)"
    },
    {
        backgroundImage: "linear-gradient(135deg, rgba(55, 48, 163, 0.96), rgba(15, 23, 42, 0.98))",
        accentColor: "rgba(191, 219, 254, 0.88)",
        spotlight: "radial-gradient(circle at top right, rgba(255,255,255,0.2), transparent 48%)"
    },
    {
        backgroundImage: "linear-gradient(135deg, rgba(127, 29, 29, 0.95), rgba(15, 23, 42, 0.98))",
        accentColor: "rgba(253, 224, 71, 0.88)",
        spotlight: "radial-gradient(circle at top left, rgba(255,255,255,0.22), transparent 54%)"
    }
] as const;

function hashSponsorName(value: string) {
    return Array.from(value).reduce((hash, character) => {
        return (hash * 31 + character.charCodeAt(0)) >>> 0;
    }, 7);
}

function normalizeWords(name: string) {
    return name
        .split(/\s+/)
        .map((word) => word.trim())
        .filter(Boolean);
}

export function getSponsorInitials(name: string) {
    const filteredWords = normalizeWords(name).filter((word) => !sponsorStopWords.has(word.toLowerCase()));
    const sourceWords = filteredWords.length > 0 ? filteredWords : normalizeWords(name);

    return sourceWords
        .slice(0, 2)
        .map((word) => word[0]?.toUpperCase() ?? "")
        .join("")
        .slice(0, 2) || "RF";
}

export function getSponsorWordmark(name: string, maxWords = 2) {
    const words = normalizeWords(name);
    const selectedWords = words.slice(0, maxWords);
    const label = selectedWords.join(" ");

    if (label.length <= 18) {
        return label;
    }

    return label.slice(0, 16).trimEnd();
}

export function getSponsorPlacementLabel(description?: string | null) {
    const normalizedDescription = description?.replace(/\s+/g, " ").trim();

    if (!normalizedDescription) {
        return "Parceiro oficial";
    }

    const withoutPrefix = normalizedDescription.replace(positionPrefixPattern, "").trim();
    const placement = withoutPrefix.replace(/[.!?]+$/, "").trim();

    if (!placement) {
        return "Parceiro oficial";
    }

    return placement;
}

export function getSponsorSupportCopy(description?: string | null) {
    const normalizedDescription = description?.replace(/\s+/g, " ").trim();

    if (!normalizedDescription) {
        return "Parceiro institucional do Resenha RFC, com presenca confirmada nas entregas oficiais do clube.";
    }

    if (positionPrefixPattern.test(normalizedDescription)) {
        const placement = getSponsorPlacementLabel(normalizedDescription).toLowerCase();
        return `Marca posicionada em ${placement} no uniforme oficial do Resenha RFC.`;
    }

    return normalizedDescription;
}

export function getSponsorFallbackStyle(name: string): CSSProperties {
    const palette = fallbackPalettes[hashSponsorName(name) % fallbackPalettes.length];

    return {
        backgroundImage: `${palette.spotlight}, ${palette.backgroundImage}`,
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.16), 0 18px 38px rgba(15,23,42,0.22)`
    };
}

export function getSponsorAccentStyle(name: string): CSSProperties {
    const palette = fallbackPalettes[hashSponsorName(name) % fallbackPalettes.length];

    return {
        borderColor: palette.accentColor,
        color: palette.accentColor
    };
}
