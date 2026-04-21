export const CONTACT_DISPLAY_PHONE = "17 99673-5427";
export const CONTACT_WHATSAPP_NUMBER = "5517996735427";
export const CONTACT_EMAIL = "warface01031999@gmail.com";

export const DEFAULT_CONTACT_MESSAGE = "Oi, Resenha! Quero falar com o clube pelo site.";
export const DEFAULT_CONTACT_EMAIL_SUBJECT = "Contato pelo site do Resenha RFC";

type QueryParamValue = string | null | undefined;

export type ContactActionType = "whatsapp" | "email" | "internal";

export type ContactIntentId =
    | "commercial-partnership"
    | "club-support"
    | "friendlies-games"
    | "press-content"
    | "institutional"
    | "general-questions";

export type ContactAction = {
    label: string;
    type: ContactActionType;
    href: string;
    destination: string;
    message?: string;
    external?: boolean;
};

export type ContactIntent = {
    id: ContactIntentId;
    title: string;
    description: string;
    journey: "commercial" | "support" | "sports" | "editorial" | "institutional" | "general";
    primaryAction: ContactAction;
    secondaryAction?: ContactAction;
    keywords: string[];
};

function buildQueryString(params: Record<string, QueryParamValue>) {
    const query = Object.entries(params)
        .filter(([, value]) => value != null && value.trim() !== "")
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value ?? "")}`)
        .join("&");

    return query ? `?${query}` : "";
}

export function buildWhatsAppHref(message = DEFAULT_CONTACT_MESSAGE) {
    return `https://wa.me/${CONTACT_WHATSAPP_NUMBER}${buildQueryString({ text: message })}`;
}

export function buildMailtoHref({
    subject = DEFAULT_CONTACT_EMAIL_SUBJECT,
    body
}: {
    subject?: string;
    body?: string;
} = {}) {
    return `mailto:${CONTACT_EMAIL}${buildQueryString({ subject, body })}`;
}

function whatsappAction(label: string, message: string): ContactAction {
    return {
        label,
        type: "whatsapp",
        href: buildWhatsAppHref(message),
        destination: CONTACT_WHATSAPP_NUMBER,
        message,
        external: true
    };
}

function emailAction(label: string, subject: string, body?: string): ContactAction {
    return {
        label,
        type: "email",
        href: buildMailtoHref({ subject, body }),
        destination: CONTACT_EMAIL,
        message: body,
        external: false
    };
}

function internalAction(label: string, href: string): ContactAction {
    return {
        label,
        type: "internal",
        href,
        destination: href
    };
}

export const CONTACT_INTENTS: ContactIntent[] = [
    {
        id: "commercial-partnership",
        title: "Parceria comercial",
        description:
            "Para marcas, comercios e projetos que querem conversar sobre divulgacao, patrocinio ou presenca no site.",
        journey: "commercial",
        primaryAction: internalAction("Ver caminho para parceiros", "/seja-parceiro"),
        secondaryAction: whatsappAction(
            "Chamar no WhatsApp",
            "Oi, Resenha! Quero conversar sobre parceria comercial, patrocinio ou divulgacao no site."
        ),
        keywords: ["parceria", "patrocinio", "anuncio", "divulgacao", "comercial"]
    },
    {
        id: "club-support",
        title: "Apoiar o clube",
        description:
            "Para quem quer fortalecer estrutura, materiais, rotina esportiva ou alguma necessidade atual do Resenha.",
        journey: "support",
        primaryAction: internalAction("Ver formas de apoio", "/apoiar-o-resenha"),
        secondaryAction: whatsappAction("Falar sobre apoio", "Oi, Resenha! Quero entender como posso apoiar o clube."),
        keywords: ["apoio", "apoiador", "estrutura", "materiais", "clube"]
    },
    {
        id: "friendlies-games",
        title: "Amistosos e jogos",
        description: "Para combinar partidas, desafios, agendas de jogo e conversas esportivas com o Resenha.",
        journey: "sports",
        primaryAction: whatsappAction(
            "Combinar pelo WhatsApp",
            "Oi, Resenha! Quero conversar sobre amistoso, jogo ou agenda de partida."
        ),
        keywords: ["amistoso", "jogo", "agenda", "partida", "desafio"]
    },
    {
        id: "press-content",
        title: "Imprensa e conteudo",
        description:
            "Para pautas, entrevistas, fotos, historias, materiais editoriais e conversas sobre conteudo do clube.",
        journey: "editorial",
        primaryAction: emailAction(
            "Enviar e-mail",
            "Imprensa e conteudo - Resenha RFC",
            "Oi, Resenha! Quero falar sobre imprensa, conteudo ou pauta editorial."
        ),
        secondaryAction: whatsappAction(
            "Chamar no WhatsApp",
            "Oi, Resenha! Quero falar sobre imprensa, conteudo ou pauta editorial."
        ),
        keywords: ["imprensa", "conteudo", "pauta", "entrevista", "fotos"]
    },
    {
        id: "institutional",
        title: "Assuntos institucionais",
        description:
            "Para convites, documentos, comunicados, relacionamento institucional e conversas formais com o clube.",
        journey: "institutional",
        primaryAction: emailAction(
            "Enviar e-mail institucional",
            "Assunto institucional - Resenha RFC",
            "Oi, Resenha! Quero tratar de um assunto institucional com o clube."
        ),
        keywords: ["institucional", "convite", "documento", "comunicado", "clube"]
    },
    {
        id: "general-questions",
        title: "Duvidas gerais",
        description: "Para perguntas gerais sobre o Resenha, o site, a rotina do clube ou o melhor caminho de contato.",
        journey: "general",
        primaryAction: whatsappAction("Tirar duvida no WhatsApp", "Oi, Resenha! Tenho uma duvida geral e vim pelo site."),
        secondaryAction: emailAction(
            "Mandar por e-mail",
            "Duvida geral - Resenha RFC",
            "Oi, Resenha! Tenho uma duvida geral e vim pelo site."
        ),
        keywords: ["duvida", "fale conosco", "contato", "site", "Resenha RFC"]
    }
];
