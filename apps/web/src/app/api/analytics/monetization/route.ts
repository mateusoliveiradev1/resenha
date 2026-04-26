import { NextResponse } from "next/server";
import { db } from "@resenha/db";
import { monetizationEvents } from "@resenha/db/schema";
import { normalizeMonetizationEventInput } from "@resenha/validators";

type AnalyticsBody = {
    name?: string;
    payload?: unknown;
};

export async function POST(request: Request) {
    let body: AnalyticsBody;

    try {
        body = (await request.json()) as AnalyticsBody;
    } catch {
        return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
    }

    const normalized = normalizeMonetizationEventInput(body.name, body.payload ?? {});

    if (!normalized.success) {
        return NextResponse.json({ ok: false, error: normalized.error }, { status: 422 });
    }

    const eventInput = normalized.data;

    await db.insert(monetizationEvents).values({
        eventName: eventInput.eventName,
        source: eventInput.source,
        journey: eventInput.journey,
        label: eventInput.label,
        destination: eventInput.destination,
        partnerName: eventInput.partnerName,
        url: eventInput.url,
        planName: eventInput.planName,
        offerName: eventInput.offerName,
        page: eventInput.page,
        question: eventInput.question,
        rawPayload: eventInput.rawPayload
    });

    return NextResponse.json({ ok: true }, { status: 202 });
}
