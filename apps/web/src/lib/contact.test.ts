import {
    CONTACT_CHANNELS,
    CONTACT_INTENTS,
    buildMailtoHref,
    buildWhatsAppHref,
    resolveContactChannelForSubject,
} from "./contact";

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

assertEqual(CONTACT_CHANNELS.team.displayPhone, "17 99658-2337");
assertEqual(CONTACT_CHANNELS.team.whatsappNumber, "5517996582337");
assertEqual(CONTACT_CHANNELS.team.email, "warface01031999@gmail.com");
assertEqual(CONTACT_CHANNELS.site.displayPhone, "17 99673-5427");
assertEqual(CONTACT_CHANNELS.site.whatsappNumber, "5517996735427");

assert(
    buildWhatsAppHref("Quero apoiar o time", "team").startsWith("https://wa.me/5517996582337?text="),
    "Team WhatsApp href must include the team destination number",
);
assert(
    buildWhatsAppHref("Tenho um problema no site", "site").startsWith("https://wa.me/5517996735427?text="),
    "Site WhatsApp href must include the site destination number",
);
assert(
    buildMailtoHref({ subject: "Contato institucional", body: "Ola", channelId: "team" }).startsWith(
        "mailto:warface01031999@gmail.com?",
    ),
    "Team e-mail href must use the official e-mail destination",
);

assertEqual(resolveContactChannelForSubject("Apoiar ou patrocinar o clube").id, "team");
assertEqual(resolveContactChannelForSubject("Amistosos e jogos").id, "team");
assertEqual(resolveContactChannelForSubject("Divulgar empresa no site").id, "site");
assertEqual(resolveContactChannelForSubject("Suporte do site").id, "site");

for (const intent of CONTACT_INTENTS) {
    for (const action of [intent.primaryAction, intent.secondaryAction]) {
        if (!action) {
            continue;
        }

        if (action.type === "whatsapp") {
            assert(
                action.href.startsWith(`https://wa.me/${action.destination}`),
                `${intent.id} WhatsApp action must include its explicit destination number`,
            );
            assert(!action.href.startsWith("https://wa.me/?"), `${intent.id} WhatsApp action cannot be destinationless`);
        }

        if (action.type === "email") {
            assertEqual(action.destination, "warface01031999@gmail.com");
            assert(action.href.startsWith("mailto:warface01031999@gmail.com"), `${intent.id} e-mail action must use mailto`);
        }
    }
}

console.log("contact.test.ts passed");
