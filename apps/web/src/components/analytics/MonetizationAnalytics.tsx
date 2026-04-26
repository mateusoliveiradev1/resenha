"use client";

import * as React from "react";
import { trackMonetizationEvent } from "@/lib/analytics";
import { buildMonetizationEventPayload, normalizeMonetizationEventName } from "@/lib/monetizationEvents";

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

            const eventName = normalizeMonetizationEventName(element.dataset.monetizationEvent);

            if (!eventName) {
                return;
            }

            if (eventName === "faq_expand") {
                if (!(element instanceof HTMLDetailsElement)) {
                    return;
                }

                const summary = target.closest("summary");

                if (!summary || summary.parentElement !== element) {
                    return;
                }

                const wasOpen = element.open;

                window.requestAnimationFrame(() => {
                    if (!wasOpen && element.open) {
                        trackMonetizationEvent(eventName, buildMonetizationEventPayload(element));
                    }
                });
                return;
            }

            trackMonetizationEvent(eventName, buildMonetizationEventPayload(element));
        }

        document.addEventListener("click", handleClick);

        return () => {
            document.removeEventListener("click", handleClick);
        };
    }, []);

    return null;
}
