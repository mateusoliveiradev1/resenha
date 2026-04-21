import { NextResponse } from "next/server";
import { db } from "@resenha/db";
import { monetizationLeads } from "@resenha/db/schema";

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

function getOptionalString(values: Record<string, unknown>, key: string) {
    const value = getString(values, key);

    return value ? value : null;
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

    const values = body.values ?? {};
    const journey: LeadJourney = body.variant === "commercial" ? "commercial" : "support";
    const source = getString({ source: body.source }, "source") || "lead_form";
    const now = new Date();

    const [lead] = await db.insert(monetizationLeads).values({
        journey,
        source,
        status: "NEW",
        name: getString(values, "name"),
        company: getOptionalString(values, "company"),
        whatsapp: getString(values, "whatsapp"),
        email: getOptionalString(values, "email"),
        city: getOptionalString(values, "city"),
        supportType: getOptionalString(values, "supportType"),
        supportDescription: getOptionalString(values, "supportDescription"),
        advertisingOption: getOptionalString(values, "advertisingOption"),
        businessType: getOptionalString(values, "businessType"),
        instagramOrSite: getOptionalString(values, "instagramOrSite"),
        message: getOptionalString(values, "message"),
        rawPayload: values,
        createdAt: now,
        updatedAt: now
    }).returning({
        id: monetizationLeads.id,
        journey: monetizationLeads.journey,
        source: monetizationLeads.source,
        status: monetizationLeads.status,
        createdAt: monetizationLeads.createdAt
    });

    return NextResponse.json(
        {
            ok: true,
            lead: {
                id: lead.id,
                journey: lead.journey,
                source: lead.source,
                status: lead.status,
                receivedAt: lead.createdAt.toISOString()
            }
        },
        { status: 201 }
    );
}
