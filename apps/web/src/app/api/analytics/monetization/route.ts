import { NextResponse } from "next/server";
import { db } from "@resenha/db";
import { monetizationEvents } from "@resenha/db/schema";
import type { MonetizationEventName } from "@/lib/analytics";

const validEvents: MonetizationEventName[] = [
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
    "faq_expand",
];

type AnalyticsBody = {
    name?: string;
    payload?: Record<string, unknown>;
};

function getString(payload: Record<string, unknown>, key: string) {
    const value = payload[key];

    return typeof value === "string" && value.trim() ? value.trim() : null;
}

function getJourney(payload: Record<string, unknown>) {
    const value = getString(payload, "journey");

    return value === "support" || value === "commercial" ? value : null;
}

export async function POST(request: Request) {
    let body: AnalyticsBody;

    try {
        body = (await request.json()) as AnalyticsBody;
    } catch {
        return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
    }

    if (!body.name || !validEvents.includes(body.name as MonetizationEventName)) {
        return NextResponse.json({ ok: false, error: "Invalid analytics event." }, { status: 422 });
    }

    const payload = body.payload ?? {};

    await db.insert(monetizationEvents).values({
        eventName: body.name as MonetizationEventName,
        source: getString(payload, "source"),
        journey: getJourney(payload),
        label: getString(payload, "label"),
        destination: getString(payload, "destination"),
        partnerName: getString(payload, "partner_name"),
        url: getString(payload, "url"),
        planName: getString(payload, "plan_name"),
        offerName: getString(payload, "offer_name"),
        page: getString(payload, "page"),
        question: getString(payload, "question"),
        rawPayload: payload
    });

    return NextResponse.json({ ok: true }, { status: 202 });
}
