import { NextResponse } from "next/server";

type LeadJourney = "support" | "commercial";

type LeadRequestBody = {
    variant?: LeadJourney;
    source?: string;
    values?: Record<string, unknown>;
};

function getString(values: Record<string, unknown>, key: string) {
    const value = values[key];

    return typeof value === "string" ? value.trim() : "";
}

function getDigits(value: string) {
    return value.replace(/\D/g, "");
}

function validateLead(body: LeadRequestBody) {
    const values = body.values ?? {};
    const errors: Record<string, string> = {};

    if (body.variant !== "support" && body.variant !== "commercial") {
        errors.variant = "Invalid lead journey.";
    }

    if (getString(values, "name").length < 2) {
        errors.name = "Name is required.";
    }

    if (getDigits(getString(values, "whatsapp")).length < 10) {
        errors.whatsapp = "A valid WhatsApp with area code is required.";
    }

    if (body.variant === "support") {
        if (!getString(values, "supportType")) {
            errors.supportType = "Support type is required.";
        }

        if (getString(values, "supportDescription").length < 8) {
            errors.supportDescription = "Support description is required.";
        }
    }

    if (body.variant === "commercial") {
        if (getString(values, "company").length < 2) {
            errors.company = "Company is required.";
        }

        if (!getString(values, "advertisingOption")) {
            errors.advertisingOption = "Advertising option is required.";
        }
    }

    if (values.contactConsent !== true) {
        errors.contactConsent = "Contact consent is required.";
    }

    return errors;
}

export async function POST(request: Request) {
    let body: LeadRequestBody;

    try {
        body = (await request.json()) as LeadRequestBody;
    } catch {
        return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
    }

    const errors = validateLead(body);

    if (Object.keys(errors).length > 0) {
        return NextResponse.json({ ok: false, errors }, { status: 422 });
    }

    // Fase 1 destination: validate and accept the inquiry without persistence.
    // A database/CRM destination is intentionally left for the planned Fase 2.
    return NextResponse.json(
        {
            ok: true,
            lead: {
                journey: body.variant,
                source: body.source ?? "lead_form",
                receivedAt: new Date().toISOString()
            }
        },
        { status: 202 }
    );
}
