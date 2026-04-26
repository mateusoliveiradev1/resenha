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

const supportedEventNames = new Set<string>([
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
    "faq_expand"
]);

const dataAttributeEventNameMap: Record<string, MonetizationEventName> = {
    cta_click: "monetization_cta_click",
    offer_cta_click: "plan_cta_click",
    partner_logo_click: "partner_logo_click",
    faq_interaction: "faq_expand"
};

export function normalizeMonetizationEventName(rawEventName: string | undefined | null) {
    if (!rawEventName) {
        return null;
    }

    if (dataAttributeEventNameMap[rawEventName]) {
        return dataAttributeEventNameMap[rawEventName];
    }

    return supportedEventNames.has(rawEventName) ? rawEventName as MonetizationEventName : null;
}

export function cleanMonetizationPayload(payload: MonetizationEventPayload = {}) {
    return Object.fromEntries(Object.entries(payload).filter(([, value]) => value != null && value !== ""));
}

function getElementLabel(element: Pick<HTMLElement, "dataset" | "getAttribute" | "textContent">) {
    return element.dataset.label || element.getAttribute("aria-label") || element.textContent?.replace(/\s+/g, " ").trim() || undefined;
}

export function buildMonetizationEventPayload(element: Pick<HTMLElement, "dataset" | "getAttribute" | "textContent">) {
    return {
        label: getElementLabel(element),
        source: element.dataset.source,
        destination: element.dataset.destination,
        context: element.dataset.context,
        journey: element.dataset.journey,
        partner_name: element.dataset.partnerName,
        url: element.dataset.destination,
        plan_name: element.dataset.planName || element.dataset.offerName,
        offer_name: element.dataset.offerName,
        experiment_key: element.dataset.experimentKey,
        experiment_variant: element.dataset.experimentVariant,
        page: element.dataset.page,
        question: element.dataset.question
    };
}
