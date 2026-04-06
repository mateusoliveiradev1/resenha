import type { Metadata } from "next";

export const SITE_NAME = "Resenha RFC";
export const DEFAULT_OG_IMAGE = "/logo2.png";
export const DEFAULT_TITLE = "Resenha RFC | Futebol Amador de Campo e Quadra";
export const DEFAULT_DESCRIPTION =
    "Portal oficial do Resenha RFC com jogos, elenco, estatísticas, galeria, parceiros e conteúdo institucional de um clube de futebol amador presente no campo e na quadra.";
export const DEFAULT_KEYWORDS = [
    "Resenha RFC",
    "futebol amador",
    "futebol de campo",
    "futsal",
    "quadra",
    "elenco",
    "jogos",
    "estatísticas",
    "galeria",
    "patrocinadores"
];

export function getSiteUrl() {
    const configuredUrl =
        process.env.NEXT_PUBLIC_SITE_URL ||
        process.env.SITE_URL ||
        process.env.VERCEL_PROJECT_PRODUCTION_URL ||
        process.env.VERCEL_URL ||
        "http://localhost:3000";

    const normalizedUrl = configuredUrl.startsWith("http") ? configuredUrl : `https://${configuredUrl}`;
    return new URL(normalizedUrl);
}

export function getAbsoluteUrl(path = "/") {
    return new URL(path, getSiteUrl()).toString();
}

function buildFullTitle(title: string) {
    return title === DEFAULT_TITLE || title.endsWith(`| ${SITE_NAME}`) ? title : `${title} | ${SITE_NAME}`;
}

export function createPageMetadata({
    title,
    description,
    path,
    keywords = [],
    image = DEFAULT_OG_IMAGE,
    noIndex = false,
    type = "website",
    publishedTime,
    modifiedTime
}: {
    title: string;
    description: string;
    path: string;
    keywords?: string[];
    image?: string;
    noIndex?: boolean;
    type?: "website" | "article";
    publishedTime?: string;
    modifiedTime?: string;
}): Metadata {
    const fullTitle = buildFullTitle(title);

    return {
        title,
        description,
        keywords: [...DEFAULT_KEYWORDS, ...keywords],
        alternates: {
            canonical: path
        },
        openGraph: {
            title: fullTitle,
            description,
            url: getAbsoluteUrl(path),
            siteName: SITE_NAME,
            locale: "pt_BR",
            type,
            ...(type === "article"
                ? {
                      publishedTime,
                      modifiedTime
                  }
                : {}),
            images: [
                {
                    url: getAbsoluteUrl(image),
                    alt: fullTitle
                }
            ]
        },
        twitter: {
            card: "summary_large_image",
            title: fullTitle,
            description,
            images: [getAbsoluteUrl(image)]
        },
        robots: noIndex
            ? {
                  index: false,
                  follow: false,
                  googleBot: {
                      index: false,
                      follow: false,
                      noimageindex: true
                  }
              }
            : {
                  index: true,
                  follow: true,
                  googleBot: {
                      index: true,
                      follow: true,
                      "max-image-preview": "large",
                      "max-snippet": -1,
                      "max-video-preview": -1
                  }
              }
    };
}
