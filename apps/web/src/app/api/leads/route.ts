import { NextResponse } from "next/server";
import { db } from "@resenha/db";
import { monetizationLeads } from "@resenha/db/schema";
import {
    CreateMonetizationLeadSchema,
    PublicLeadSubmissionSchema,
    type CreateMonetizationLeadInput
} from "@resenha/validators";
import type { ZodIssue } from "zod";

type LeadValidationErrors = Record<string, string>;

function formatLeadValidationErrors(issues: ZodIssue[]) {
    return issues.reduce<LeadValidationErrors>((errors, issue) => {
        const path = issue.path[0] === "values" && typeof issue.path[1] === "string"
            ? issue.path[1]
            : String(issue.path[0] ?? "form");

        if (!errors[path]) {
            errors[path] = issue.message;
        }

        return errors;
    }, {});
}

export async function POST(request: Request) {
    let body: unknown;

    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
    }

    const parsedSubmission = PublicLeadSubmissionSchema.safeParse(body);

    if (!parsedSubmission.success) {
        return NextResponse.json(
            { ok: false, errors: formatLeadValidationErrors(parsedSubmission.error.issues) },
            { status: 422 }
        );
    }

    const { variant, source, values } = parsedSubmission.data;
    const leadInput: CreateMonetizationLeadInput = CreateMonetizationLeadSchema.parse({
        journey: variant,
        source,
        status: "NEW",
        name: values.name,
        company: values.company,
        whatsapp: values.whatsapp,
        email: values.email,
        city: values.city,
        supportType: values.supportType,
        supportDescription: values.supportDescription,
        advertisingOption: values.advertisingOption,
        businessType: values.businessType,
        instagramOrSite: values.instagramOrSite,
        message: values.message,
        rawPayload: values
    });
    const now = new Date();

    const [lead] = await db.insert(monetizationLeads).values({
        journey: leadInput.journey,
        source: leadInput.source,
        status: leadInput.status,
        name: leadInput.name,
        company: leadInput.company,
        whatsapp: leadInput.whatsapp,
        email: leadInput.email,
        city: leadInput.city,
        supportType: leadInput.supportType,
        supportDescription: leadInput.supportDescription,
        advertisingOption: leadInput.advertisingOption,
        businessType: leadInput.businessType,
        instagramOrSite: leadInput.instagramOrSite,
        message: leadInput.message,
        rawPayload: leadInput.rawPayload,
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
