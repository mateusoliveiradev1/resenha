import {
    buildMonetizationEventPayload,
    cleanMonetizationPayload,
    normalizeMonetizationEventName
} from "./monetizationEvents";
import {
    type CommercialAddOn,
    type CommercialOffer,
    type CommercialOfferContentRow,
    resolveCommercialOfferContent
} from "./commercialOfferContent";

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

const cleanedPayload = cleanMonetizationPayload({
    label: "Ver parceiros",
    source: "",
    destination: null,
    count: 0,
    active: false
});

assertEqual(cleanedPayload.label, "Ver parceiros");
assertEqual(cleanedPayload.count, 0);
assertEqual(cleanedPayload.active, false);
assert(!("source" in cleanedPayload), "Empty analytics payload fields must be removed");
assert(!("destination" in cleanedPayload), "Null analytics payload fields must be removed");

assertEqual(normalizeMonetizationEventName("cta_click"), "monetization_cta_click");
assertEqual(normalizeMonetizationEventName("offer_cta_click"), "plan_cta_click");
assertEqual(normalizeMonetizationEventName("partner_logo_click"), "partner_logo_click");
assertEqual(normalizeMonetizationEventName("faq_interaction"), "faq_expand");
assertEqual(normalizeMonetizationEventName("plan_cta_click"), "plan_cta_click");
assertEqual(normalizeMonetizationEventName("unknown"), null);

const payloadElement = {
    dataset: {
        monetizationEvent: "offer_cta_click",
        source: "partner_page_offer",
        destination: "https://wa.me/5517996735427",
        offerName: "Materia com oferecimento",
        partnerName: "Padaria Central",
        journey: "commercial",
        page: "/seja-parceiro"
    },
    getAttribute: (name: string) => name === "aria-label" ? "Falar sobre materia" : null,
    textContent: "Ignorado quando aria-label existe"
} as Pick<HTMLElement, "dataset" | "getAttribute" | "textContent">;
const eventPayload = buildMonetizationEventPayload(payloadElement);

assertEqual(eventPayload.label, "Falar sobre materia");
assertEqual(eventPayload.source, "partner_page_offer");
assertEqual(eventPayload.destination, "https://wa.me/5517996735427");
assertEqual(eventPayload.url, "https://wa.me/5517996735427");
assertEqual(eventPayload.offer_name, "Materia com oferecimento");
assertEqual(eventPayload.plan_name, "Materia com oferecimento");
assertEqual(eventPayload.partner_name, "Padaria Central");

const fallbackOffer: CommercialOffer = {
    badge: "Comece simples",
    title: "Aparecer no Resenha",
    audience: "Para comercio local",
    description: "Fallback comercial publico.",
    inclusions: ["Card na pagina de parceiros", "Link para contato"],
    cta: {
        label: "Quero aparecer no Resenha",
        href: "https://wa.me/5517996735427",
        external: true
    }
};
const fallbackAddOns: CommercialAddOn[] = [
    {
        title: "Materia com oferecimento",
        description: "Fallback de oferecimento.",
        badge: "Oferecimento"
    }
];
const buildOfferHref = (title: string) => `https://wa.me/5517996735427?text=${encodeURIComponent(title)}`;

const fallbackContent = resolveCommercialOfferContent([], fallbackOffer, fallbackAddOns, buildOfferHref);

assertEqual(fallbackContent.offer.title, "Aparecer no Resenha");
assertEqual(fallbackContent.addOns[0]?.title, "Materia com oferecimento");

const activeRows: CommercialOfferContentRow[] = [
    {
        slot: "base_offer",
        title: "Vitrine Premium",
        badge: "Ativo no admin",
        audience: "Empresas da regiao",
        description: "Oferta ativa configurada no admin.",
        inclusions: [],
        note: "Publicacao apos alinhamento.",
        ctaLabel: "Quero a vitrine"
    },
    {
        slot: "addon",
        title: "Parceiro da rodada",
        badge: "Rodada",
        description: "Marca nos conteudos de jogo.",
        inclusions: ["Nao usado para addon"],
        ctaLabel: null
    }
];
const activeContent = resolveCommercialOfferContent(activeRows, fallbackOffer, fallbackAddOns, buildOfferHref);

assertEqual(activeContent.offer.title, "Vitrine Premium");
assertEqual(activeContent.offer.badge, "Ativo no admin");
assertEqual(activeContent.offer.cta?.label, "Quero a vitrine");
assertEqual(activeContent.offer.cta?.href, buildOfferHref("Vitrine Premium"));
assertEqual(activeContent.offer.inclusions[0], "Card na pagina de parceiros", "Empty DB inclusions must preserve safe fallback inclusions");
assertEqual(activeContent.addOns.length, 1);
assertEqual(activeContent.addOns[0]?.title, "Parceiro da rodada");
assertEqual(activeContent.addOns[0]?.cta?.label, "Falar no WhatsApp");
assertEqual(activeContent.addOns[0]?.cta?.href, buildOfferHref("Parceiro da rodada"));

console.log("monetization.test.ts passed");
