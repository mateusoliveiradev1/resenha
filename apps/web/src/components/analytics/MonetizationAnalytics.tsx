"use client";

import * as React from "react";
import { trackMonetizationEvent, type MonetizationEventName } from "@/lib/analytics";

const eventNameMap: Record<string, MonetizationEventName> = {
    cta_click: "monetization_cta_click",
    offer_cta_click: "plan_cta_click",
    partner_logo_click: "partner_logo_click",
    faq_interaction: "faq_expand"
};

function getElementLabel(element: HTMLElement) {
    return element.dataset.label || element.getAttribute("aria-label") || element.textContent?.replace(/\s+/g, " ").trim() || undefined;
}

function getEventPayload(element: HTMLElement) {
    return {
        label: getElementLabel(element),
        source: element.dataset.source,
        destination: element.dataset.destination,
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

export function MonetizationAnalytics() {
    React.useEffect(() => {
        function handleClick(event: MouseEvent) {
            const target = event.target;

            if (!(target instanceof Element)) {
                return;
            }

            const element = target.closest<HTMLElement>("[data-monetization-event]");

            if (!element) {
                return;
            }

            const rawEventName = element.dataset.monetizationEvent;
            const eventName = rawEventName ? eventNameMap[rawEventName] : undefined;

            if (!eventName) {
                return;
            }

            if (eventName === "faq_expand") {
                window.requestAnimationFrame(() => {
                    if (element instanceof HTMLDetailsElement && element.open) {
                        trackMonetizationEvent(eventName, getEventPayload(element));
                    }
                });
                return;
            }

            trackMonetizationEvent(eventName, getEventPayload(element));
        }

        document.addEventListener("click", handleClick);

        return () => {
            document.removeEventListener("click", handleClick);
        };
    }, []);

    return null;
}
