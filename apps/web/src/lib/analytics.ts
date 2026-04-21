export type MonetizationEventName =
    | "monetization_cta_click"
    | "support_form_start"
    | "support_form_submit"
    | "support_form_success"
    | "support_form_error"
    | "partner_form_start"
    | "partner_form_submit"
    | "partner_form_success"
    | "partner_form_error"
    | "partner_logo_click"
    | "plan_cta_click"
    | "faq_expand";

export type MonetizationEventPayload = Record<string, string | number | boolean | null | undefined>;

type AnalyticsWindow = Window & {
    dataLayer?: Array<Record<string, unknown>>;
    gtag?: (event: "event", name: string, payload?: Record<string, unknown>) => void;
    plausible?: (name: string, options?: { props?: Record<string, unknown> }) => void;
};

function cleanPayload(payload: MonetizationEventPayload = {}) {
    return Object.fromEntries(Object.entries(payload).filter(([, value]) => value != null && value !== ""));
}

export function trackMonetizationEvent(name: MonetizationEventName, payload: MonetizationEventPayload = {}) {
    if (typeof window === "undefined") {
        return;
    }

    const eventPayload = cleanPayload(payload);
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
}
