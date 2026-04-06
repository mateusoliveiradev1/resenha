const DEFAULT_DEV_ADMIN_URL = "http://localhost:3001";
const DEFAULT_PRODUCTION_ADMIN_URL = "https://admin-mateusoliveiradev1s-projects.vercel.app";

function normalizeBaseUrl(value: string) {
    return value.trim().replace(/\/+$/, "");
}

export function getAdminLoginUrl() {
    const configuredBaseUrl =
        process.env.NEXT_PUBLIC_ADMIN_URL?.trim() ||
        process.env.ADMIN_APP_URL?.trim();

    if (configuredBaseUrl) {
        const normalizedUrl = normalizeBaseUrl(configuredBaseUrl);
        return normalizedUrl.endsWith("/login") ? normalizedUrl : `${normalizedUrl}/login`;
    }

    if (process.env.NODE_ENV !== "production") {
        return `${DEFAULT_DEV_ADMIN_URL}/login`;
    }

    return `${DEFAULT_PRODUCTION_ADMIN_URL}/login`;
}
