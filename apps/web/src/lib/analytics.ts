import {
    cleanMonetizationPayload,
    type MonetizationEventName,
    type MonetizationEventPayload
} from "./monetizationEvents";

export type { MonetizationEventName, MonetizationEventPayload } from "./monetizationEvents";

type AnalyticsWindow = Window & {
    dataLayer?: Array<Record<string, unknown>>;
    gtag?: (event: "event", name: string, payload?: Record<string, unknown>) => void;
    plausible?: (name: string, options?: { props?: Record<string, unknown> }) => void;
};

function persistMonetizationEvent(name: MonetizationEventName, payload: Record<string, unknown>) {
    const body = JSON.stringify({ name, payload });

    if ("sendBeacon" in navigator) {
        const blob = new Blob([body], { type: "application/json" });

        navigator.sendBeacon("/api/analytics/monetization", blob);
        return;
    }

    void fetch("/api/analytics/monetization", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body,
        keepalive: true
    }).catch(() => {
        // Analytics must never block the public journey.
    });
}

export function trackMonetizationEvent(name: MonetizationEventName, payload: MonetizationEventPayload = {}) {
    if (typeof window === "undefined") {
        return;
    }

    const eventPayload = cleanMonetizationPayload(payload);
    const analyticsWindow = window as AnalyticsWindow;

    analyticsWindow.dispatchEvent(
        new CustomEvent("resenha:analytics", {
            detail: {
                name,
                payload: eventPayload
            }
        })
    );

    analyticsWindow.dataLayer?.push({
        event: name,
        ...eventPayload
    });
    analyticsWindow.gtag?.("event", name, eventPayload);
    analyticsWindow.plausible?.(name, { props: eventPayload });
    persistMonetizationEvent(name, eventPayload);
}
