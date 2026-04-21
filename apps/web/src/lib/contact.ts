export const CONTACT_CHANNELS = {
    team: {
        id: "team",
        label: "Time do Resenha",
        shortLabel: "Time",
        displayPhone: "17 99658-2337",
        whatsappNumber: "5517996582337",
        email: "warface01031999@gmail.com"
    },
    site: {
        id: "site",
        label: "Site e suporte tecnico",
        shortLabel: "Site",
        displayPhone: "17 99673-5427",
        whatsappNumber: "5517996735427",
        email: "warface01031999@gmail.com"
    }
} as const;

export type ContactChannelId = keyof typeof CONTACT_CHANNELS;
export type ContactChannel = (typeof CONTACT_CHANNELS)[ContactChannelId];

export const DEFAULT_CONTACT_CHANNEL_ID: ContactChannelId = "team";
export const CONTACT_DISPLAY_PHONE = CONTACT_CHANNELS[DEFAULT_CONTACT_CHANNEL_ID].displayPhone;
export const CONTACT_WHATSAPP_NUMBER = CONTACT_CHANNELS[DEFAULT_CONTACT_CHANNEL_ID].whatsappNumber;
export const CONTACT_EMAIL = CONTACT_CHANNELS[DEFAULT_CONTACT_CHANNEL_ID].email;

export const DEFAULT_CONTACT_MESSAGE = "Oi, Resenha! Vim pelo site e quero falar com o time.";
export const DEFAULT_CONTACT_EMAIL_SUBJECT = "Contato pelo site do Resenha RFC";

type QueryParamValue = string | null | undefined;

export type ContactActionType = "whatsapp" | "email" | "internal";

export type ContactIntentId =
    | "commercial-partnership"
    | "club-support"
    | "friendlies-games"
    | "press-content"
    | "institutional"
    | "general-questions"
    | "site-support";

export type ContactAction = {
    label: string;
    type: ContactActionType;
    href: string;
    destination: string;
    displayDestination?: string;
    channelId?: ContactChannelId;
    message?: string;
    external?: boolean;
};

export type ContactIntent = {
    id: ContactIntentId;
    title: string;
    description: string;
    journey: "commercial" | "support" | "sports" | "editorial" | "institutional" | "general" | "site";
    channelId: ContactChannelId;
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

export function getContactChannel(channelId: ContactChannelId = DEFAULT_CONTACT_CHANNEL_ID) {
    return CONTACT_CHANNELS[channelId];
}

export function buildWhatsAppHref(message = DEFAULT_CONTACT_MESSAGE, channelId: ContactChannelId = DEFAULT_CONTACT_CHANNEL_ID) {
    const channel = getContactChannel(channelId);

    return `https://wa.me/${channel.whatsappNumber}${buildQueryString({ text: message })}`;
}

export function buildMailtoHref({
    subject = DEFAULT_CONTACT_EMAIL_SUBJECT,
    body,
    channelId = DEFAULT_CONTACT_CHANNEL_ID
}: {
    subject?: string;
    body?: string;
    channelId?: ContactChannelId;
} = {}) {
    const channel = getContactChannel(channelId);

    return `mailto:${channel.email}${buildQueryString({ subject, body })}`;
}

function whatsappAction(label: string, message: string, channelId: ContactChannelId = DEFAULT_CONTACT_CHANNEL_ID): ContactAction {
    const channel = getContactChannel(channelId);

    return {
        label,
        type: "whatsapp",
        href: buildWhatsAppHref(message, channelId),
        destination: channel.whatsappNumber,
        displayDestination: channel.displayPhone,
        channelId,
        message,
        external: true
    };
}

function emailAction(
    label: string,
    subject: string,
    body?: string,
    channelId: ContactChannelId = DEFAULT_CONTACT_CHANNEL_ID
): ContactAction {
    const channel = getContactChannel(channelId);

    return {
        label,
        type: "email",
        href: buildMailtoHref({ subject, body, channelId }),
        destination: channel.email,
        displayDestination: channel.email,
        channelId,
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
        title: "Divulgar empresa no site",
        description:
            "Para marcas, comercios e projetos que querem conversar sobre divulgacao ou presenca no site.",
        journey: "commercial",
        channelId: "site",
        primaryAction: internalAction("Ver caminho para parceiros", "/seja-parceiro"),
        secondaryAction: whatsappAction(
            "Chamar no WhatsApp",
            "Oi, Resenha! Vim pelo site e quero conversar sobre divulgacao da minha empresa no portal. Minha empresa e: ",
            "site"
        ),
        keywords: ["parceria", "anuncio", "divulgacao", "comercial", "site"]
    },
    {
        id: "club-support",
        title: "Apoiar ou patrocinar o clube",
        description:
            "Para quem quer apoiar, patrocinar ou fortalecer estrutura, materiais, rotina esportiva ou alguma necessidade atual do Resenha.",
        journey: "support",
        channelId: "team",
        primaryAction: internalAction("Ver formas de apoio", "/apoiar-o-resenha"),
        secondaryAction: whatsappAction(
            "Falar sobre apoio",
            "Oi, Resenha! Vim pelo site e quero conversar sobre apoio ou patrocinio para o time. Quero entender as necessidades atuais e como posso ajudar.",
            "team"
        ),
        keywords: ["apoio", "apoiador", "patrocinio", "estrutura", "materiais", "clube", "time"]
    },
    {
        id: "friendlies-games",
        title: "Amistosos e jogos",
        description: "Para combinar partidas, desafios, agendas de jogo e conversas esportivas com o Resenha.",
        journey: "sports",
        channelId: "team",
        primaryAction: whatsappAction(
            "Combinar pelo WhatsApp",
            "Oi, Resenha! Vim pelo site e quero conversar sobre amistoso, jogo ou agenda de partida. Podemos ver disponibilidade?",
            "team"
        ),
        keywords: ["amistoso", "jogo", "agenda", "partida", "desafio"]
    },
    {
        id: "press-content",
        title: "Imprensa e conteudo",
        description:
            "Para pautas, entrevistas, fotos, historias, materiais editoriais e conversas sobre conteudo do clube.",
        journey: "editorial",
        channelId: "team",
        primaryAction: emailAction(
            "Enviar e-mail",
            "Imprensa e conteudo - Resenha RFC",
            "Oi, Resenha!\n\nVim pelo site e quero falar sobre imprensa, conteudo ou pauta editorial do clube.\n\nContexto:\n",
            "team"
        ),
        secondaryAction: whatsappAction(
            "Chamar no WhatsApp",
            "Oi, Resenha! Vim pelo site e quero falar sobre imprensa, conteudo ou pauta editorial do clube.",
            "team"
        ),
        keywords: ["imprensa", "conteudo", "pauta", "entrevista", "fotos"]
    },
    {
        id: "institutional",
        title: "Assuntos institucionais",
        description:
            "Para convites, documentos, comunicados, relacionamento institucional e conversas formais com o clube.",
        journey: "institutional",
        channelId: "team",
        primaryAction: emailAction(
            "Enviar e-mail institucional",
            "Assunto institucional - Resenha RFC",
            "Oi, Resenha!\n\nVim pelo site e quero tratar de um assunto institucional com o clube.\n\nContexto:\n",
            "team"
        ),
        keywords: ["institucional", "convite", "documento", "comunicado", "clube"]
    },
    {
        id: "general-questions",
        title: "Duvidas gerais do clube",
        description: "Para perguntas gerais sobre o Resenha, a rotina do clube ou o melhor caminho de contato.",
        journey: "general",
        channelId: "team",
        primaryAction: whatsappAction(
            "Tirar duvida no WhatsApp",
            "Oi, Resenha! Vim pelo site e tenho uma duvida geral sobre o clube. Podem me orientar?",
            "team"
        ),
        secondaryAction: emailAction(
            "Mandar por e-mail",
            "Duvida geral - Resenha RFC",
            "Oi, Resenha!\n\nVim pelo site e tenho uma duvida geral sobre o clube.\n\nMinha duvida:\n",
            "team"
        ),
        keywords: ["duvida", "fale conosco", "contato", "clube", "Resenha RFC"]
    },
    {
        id: "site-support",
        title: "Suporte do site",
        description:
            "Para avisar sobre erro, manutencao, conteudo tecnico, acesso ou administracao do portal.",
        journey: "site",
        channelId: "site",
        primaryAction: whatsappAction(
            "Falar com suporte do site",
            "Oi, Resenha! Vim pelo site e quero falar sobre suporte, manutencao ou problema tecnico no portal. Posso explicar o caso?",
            "site"
        ),
        secondaryAction: emailAction(
            "Enviar e-mail sobre o site",
            "Suporte do site - Resenha RFC",
            "Oi, Resenha!\n\nVim pelo site e quero falar sobre suporte, manutencao ou problema tecnico no portal.\n\nDescricao:\n",
            "site"
        ),
        keywords: ["site", "suporte", "manutencao", "portal", "tecnico", "acesso"]
    }
];

export function getContactIntentByTitle(title: string) {
    return CONTACT_INTENTS.find((intent) => intent.title === title);
}

export function resolveContactChannelForIntent(intent?: Pick<ContactIntent, "channelId"> | null) {
    return getContactChannel(intent?.channelId ?? DEFAULT_CONTACT_CHANNEL_ID);
}

export function resolveContactChannelForSubject(subject: string) {
    return resolveContactChannelForIntent(getContactIntentByTitle(subject));
}
