const REMOTE_IMAGE_PROTOCOL_RE = /^https?:\/\//i;

export function shouldBypassNextImageOptimization(src?: string | null) {
    if (!src) {
        return false;
    }

    const normalizedSrc = src.trim();

    if (!normalizedSrc) {
        return false;
    }

    return (
        normalizedSrc.startsWith("/uploads/") ||
        normalizedSrc.startsWith("blob:") ||
        normalizedSrc.startsWith("data:") ||
        REMOTE_IMAGE_PROTOCOL_RE.test(normalizedSrc)
    );
}
