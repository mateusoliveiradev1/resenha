import {
    CreateMonetizationLeadSchema,
    PublicLeadSubmissionSchema,
    UpdateLeadStatusSchema,
    leadStatusValues,
    normalizeMonetizationEventInput
} from "./monetization";

function assert(condition: unknown, message: string): asserts condition {
    if (!condition) {
        throw new Error(message);
    }
}

function assertEqual<T>(actual: T, expected: T, message?: string) {
    if (actual !== expected) {
        throw new Error(message ?? `Expected ${String(expected)}, received ${String(actual)}`);
    }
}

const validCommercialLead = PublicLeadSubmissionSchema.safeParse({
    variant: "commercial",
    source: "partner_page",
    values: {
        name: "Lia Comercial",
        company: "Padaria Central",
        whatsapp: "(17) 99673-5427",
        email: "lia@example.com",
        city: "Pirangi",
        advertisingOption: "Pagina de parceiros",
        businessType: "Comercio local",
        instagramOrSite: "@padariacentral",
        message: "Quero entender os formatos comerciais.",
        contactConsent: true
    }
});

assert(validCommercialLead.success, "Valid commercial submissions must pass public lead validation");

const persistedCommercialLead = CreateMonetizationLeadSchema.parse({
    journey: validCommercialLead.success ? validCommercialLead.data.variant : "commercial",
    source: validCommercialLead.success ? validCommercialLead.data.source : "partner_page",
    status: "NEW",
    name: validCommercialLead.success ? validCommercialLead.data.values.name : "",
    company: validCommercialLead.success ? validCommercialLead.data.values.company : "",
    whatsapp: validCommercialLead.success ? validCommercialLead.data.values.whatsapp : "",
    email: validCommercialLead.success ? validCommercialLead.data.values.email : null,
    city: validCommercialLead.success ? validCommercialLead.data.values.city : null,
    advertisingOption: validCommercialLead.success ? validCommercialLead.data.values.advertisingOption : "",
    businessType: validCommercialLead.success ? validCommercialLead.data.values.businessType : null,
    instagramOrSite: validCommercialLead.success ? validCommercialLead.data.values.instagramOrSite : null,
    message: validCommercialLead.success ? validCommercialLead.data.values.message : null,
    rawPayload: validCommercialLead.success ? validCommercialLead.data.values : {}
});

assertEqual(persistedCommercialLead.journey, "commercial");
assertEqual(persistedCommercialLead.status, "NEW");
assertEqual(persistedCommercialLead.company, "Padaria Central");

const invalidSupportLead = PublicLeadSubmissionSchema.safeParse({
    variant: "support",
    source: "",
    values: {
        name: "Li",
        whatsapp: "1799",
        supportDescription: "curto",
        contactConsent: false
    }
});

assert(!invalidSupportLead.success, "Invalid support submissions must be rejected");

if (!invalidSupportLead.success) {
    const paths = invalidSupportLead.error.issues.map((issue) => issue.path.join("."));

    assert(paths.includes("values.whatsapp"), "Support validation must require a WhatsApp with DDD");
    assert(paths.includes("values.contactConsent"), "Support validation must require contact consent");
    assert(paths.includes("values.supportType"), "Support validation must require a support type");
    assert(paths.includes("values.supportDescription"), "Support validation must require a useful support description");
}

const leadId = "11111111-1111-4111-8111-111111111111";

for (const status of leadStatusValues) {
    const parsedStatus = UpdateLeadStatusSchema.safeParse({ id: leadId, status });

    assert(parsedStatus.success, `${status} must be accepted as a lead status transition target`);
}

assert(!UpdateLeadStatusSchema.safeParse({ id: leadId, status: "ARCHIVED" }).success, "Unknown lead statuses must be rejected");
assert(!UpdateLeadStatusSchema.safeParse({ id: "not-a-uuid", status: "CONTACTED" }).success, "Invalid lead ids must be rejected");

const partnerClick = normalizeMonetizationEventInput("partner_logo_click", {
    partner_name: "Padaria Central",
    source: "sponsors_page",
    destination: "https://example.com/padaria",
    url: "https://example.com/padaria",
    page: "/patrocinadores",
    extra_audit_field: "kept"
});

assert(partnerClick.success, "Supported analytics events must normalize for persistence");

if (partnerClick.success) {
    assertEqual(partnerClick.data.eventName, "partner_logo_click");
    assertEqual(partnerClick.data.partnerName, "Padaria Central");
    assertEqual(partnerClick.data.source, "sponsors_page");
    assertEqual(partnerClick.data.destination, "https://example.com/padaria");
    assertEqual(partnerClick.data.rawPayload?.extra_audit_field, "kept");
}

const planClick = normalizeMonetizationEventInput("plan_cta_click", {
    source: "partner_page_offer",
    plan_name: "Aparecer no Resenha",
    offer_name: "Materia com oferecimento",
    destination: "https://wa.me/5517996735427"
});

assert(planClick.success, "Plan CTA analytics payloads must normalize for persistence");

if (planClick.success) {
    assertEqual(planClick.data.planName, "Aparecer no Resenha");
    assertEqual(planClick.data.offerName, "Materia com oferecimento");
}

assert(
    !normalizeMonetizationEventInput("cta_click", { source: "raw_data_attribute" }).success,
    "Raw UI aliases must be mapped before analytics persistence"
);
assert(
    !normalizeMonetizationEventInput("unknown_event", { source: "bad" }).success,
    "Unsupported analytics events must be rejected"
);

console.log("monetization.test.ts passed");
