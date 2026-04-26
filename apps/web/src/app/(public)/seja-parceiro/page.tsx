import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Badge, Button, Card, CardContent, Container } from "@resenha/ui";
import { db } from "@resenha/db";
import { commercialOfferContents, copyCtaExperiments } from "@resenha/db/schema";
import { asc, desc, eq } from "drizzle-orm";
import type { LucideIcon } from "lucide-react";
import {
    ArrowRight,
    Camera,
    Handshake,
    HeartHandshake,
    MessageCircle,
    Newspaper,
    ShieldCheck,
    Sparkles,
    Store,
    Trophy,
    Users
} from "lucide-react";
import { CommercialOfferCard } from "@/components/monetization/CommercialOfferCard";
import { FaqBlock, type FaqItem } from "@/components/monetization/FaqBlock";
import { LeadForm } from "@/components/monetization/LeadForm";
import { CONTACT_CHANNELS, buildWhatsAppHref } from "@/lib/contact";
import { resolveCommercialOfferContent, type CommercialAddOn, type CommercialOffer } from "@/lib/commercialOfferContent";
import { createPageMetadata } from "@/lib/seo";

type PartnerItem = {
    title: string;
    description: string;
    icon: LucideIcon;
};

type PlacementItem = PartnerItem & {
    badge: string;
    sample: string;
    action: string;
    context: string;
};

const commercialContact = CONTACT_CHANNELS.site;
const commercialWhatsappMessages = {
    hero: "Oi, Resenha! Vim pela pagina Seja parceiro e quero entender como minha empresa pode aparecer no site.",
    baseOffer: "Oi, Resenha! Quero aparecer na pagina de parceiros do site. Minha empresa e: ",
    offeredArticle: "Oi, Resenha! Quero falar sobre materia com oferecimento no site. Minha empresa e: ",
    roundPartner: "Oi, Resenha! Quero falar sobre parceiro da rodada no site. Minha empresa e: ",
    highlight: "Oi, Resenha! Quero falar sobre um destaque maior na pagina de parceiros do site. Minha empresa e: ",
    comparison: "Oi, Resenha! Vim pela comparacao entre apoiar o time e anunciar no site. Quero conversar sobre anuncio no site.",
    afterExamples: "Oi, Resenha! Gostei dos exemplos de espaco no site e quero ver onde minha empresa pode entrar primeiro.",
    afterOffer: "Oi, Resenha! Quero entender o comeco mais simples para aparecer no site.",
    contactIntro: "Oi, Resenha! Quero falar direto sobre divulgacao da minha empresa no site. Minha empresa e: ",
    afterFaq: "Oi, Resenha! Ainda tenho uma duvida sobre divulgar minha empresa no site.",
    finalCta: "Oi, Resenha! Quero mandar uma mensagem sobre parceria para aparecer no site. Minha empresa e: "
} as const;

function buildCommercialWhatsappHref(message: string) {
    return buildWhatsAppHref(message, "site");
}

function buildDynamicCommercialWhatsappHref(title: string) {
    return buildCommercialWhatsappHref(`Oi, Resenha! Vim pela pagina Seja parceiro e quero conversar sobre "${title}" no site. Minha empresa e: `);
}

const commercialWhatsappHrefs = {
    hero: buildCommercialWhatsappHref(commercialWhatsappMessages.hero),
    baseOffer: buildCommercialWhatsappHref(commercialWhatsappMessages.baseOffer),
    offeredArticle: buildCommercialWhatsappHref(commercialWhatsappMessages.offeredArticle),
    roundPartner: buildCommercialWhatsappHref(commercialWhatsappMessages.roundPartner),
    highlight: buildCommercialWhatsappHref(commercialWhatsappMessages.highlight),
    comparison: buildCommercialWhatsappHref(commercialWhatsappMessages.comparison),
    afterExamples: buildCommercialWhatsappHref(commercialWhatsappMessages.afterExamples),
    afterOffer: buildCommercialWhatsappHref(commercialWhatsappMessages.afterOffer),
    contactIntro: buildCommercialWhatsappHref(commercialWhatsappMessages.contactIntro),
    afterFaq: buildCommercialWhatsappHref(commercialWhatsappMessages.afterFaq),
    finalCta: buildCommercialWhatsappHref(commercialWhatsappMessages.finalCta)
} as const;
const defaultHeroHeadline = "Divulgue sua empresa no site do Resenha";
const defaultHeroDescription =
    "Quem acompanha jogos, entrevistas, cronicas e parceiros do clube pode ver sua empresa e chamar voce pelo WhatsApp ou Instagram.";
const defaultHeroSupportText =
    "Comece simples: a gente mostra os espacos, combina onde sua empresa entra e publica dentro do visual do Resenha.";

const partnerPlacements: PlacementItem[] = [
    {
        title: "Nas materias do Resenha",
        description: "A marca pode aparecer como oferecimento sinalizado em conteudos combinados.",
        badge: "Oferecimento",
        sample: "Oferecimento: Sua empresa",
        action: "Abrir WhatsApp",
        context: "Materia",
        icon: Newspaper
    },
    {
        title: "Na pagina de parceiros",
        description: "Card com logo ou nome, texto curto e link para WhatsApp, Instagram ou site.",
        badge: "Parceiro oficial",
        sample: "Sua empresa",
        action: "Ver Instagram",
        context: "Vitrine",
        icon: Store
    },
    {
        title: "Em conteudos de jogo",
        description: "A empresa pode entrar em chamadas de rodada, jogo ou agenda quando combinado.",
        badge: "Parceiro da rodada",
        sample: "Rodada com apoio local",
        action: "Ver jogo",
        context: "Rodada",
        icon: Trophy
    }
];

const valuePoints: PartnerItem[] = [
    {
        title: "Aparece em conteudo do clube",
        description: "Sua empresa pode entrar em materias, jogos e secoes de parceiros com sinalizacao clara.",
        icon: ShieldCheck
    },
    {
        title: "Leva a pessoa para seu contato",
        description: "O card ou bloco pode apontar para WhatsApp, Instagram ou site oficial do negocio.",
        icon: MessageCircle
    },
    {
        title: "Comeca por conversa simples",
        description: "A gente mostra os espacos, entende seu negocio e combina um formato sem empurrar pacote grande.",
        icon: Sparkles
    }
];

const audienceItems: PartnerItem[] = [
    {
        title: "Quem joga e acompanha",
        description: "Atletas, familiares, amigos e torcedores que seguem a rotina do Resenha.",
        icon: Users
    },
    {
        title: "Quem ve jogos e fotos",
        description: "Pessoas que chegam pelo calendario, resultados, galeria e registros das rodadas.",
        icon: Camera
    },
    {
        title: "Comunidade da regiao",
        description: "Gente ligada ao futebol local, aos parceiros e aos negocios que caminham perto do clube.",
        icon: Store
    }
];

const localCommerceBenefits: PartnerItem[] = [
    {
        title: "Link direto para WhatsApp",
        description: "Quem se interessar pode sair do Resenha para chamar sua empresa no canal que voce usa no dia a dia.",
        icon: MessageCircle
    },
    {
        title: "Instagram ou site oficial",
        description: "O parceiro pode levar a pessoa para ver cardapio, servicos, agenda, perfil ou pagina da marca.",
        icon: Store
    },
    {
        title: "Conteudo real do clube",
        description: "A marca aparece junto de materias, jogos, entrevistas, cronicas e paginas oficiais do Resenha.",
        icon: Newspaper
    }
];

const commercialOffer: CommercialOffer = {
    badge: "Comece simples",
    title: "Aparecer no Resenha",
    audience: "Para comercio local",
    description:
        "Sua empresa entra na pagina de parceiros, com logo ou nome, texto curto e link para WhatsApp, Instagram ou site.",
    inclusions: [
        "Card da empresa na pagina de parceiros",
        "Logo ou nome da marca",
        "Texto curto explicando o que a empresa faz",
        "Link para WhatsApp, Instagram ou site",
        "Possibilidade de aparecer em uma secao de parceiros do site"
    ],
    note: "Chame no WhatsApp e veja o formato mais simples para sua empresa.",
    cta: {
        label: "Quero aparecer no Resenha",
        href: commercialWhatsappHrefs.baseOffer,
        external: true
    }
};

const commercialAddOns: CommercialAddOn[] = [
    {
        title: "Materia com oferecimento",
        description: "A empresa aparece sinalizada em uma materia combinada com o Resenha.",
        badge: "Oferecimento",
        cta: {
            label: "Falar sobre materia",
            href: commercialWhatsappHrefs.offeredArticle,
            external: true
        }
    },
    {
        title: "Parceiro da rodada",
        description: "Presenca em conteudo de jogo, agenda ou rodada, quando fizer sentido.",
        badge: "Rodada",
        cta: {
            label: "Falar sobre rodada",
            href: commercialWhatsappHrefs.roundPartner,
            external: true
        }
    },
    {
        title: "Destaque maior",
        description: "Card maior ou posicao de destaque na pagina de parceiros.",
        badge: "Destaque",
        cta: {
            label: "Falar sobre destaque",
            href: commercialWhatsappHrefs.highlight,
            external: true
        }
    }
];

const comparisonItems = [
    {
        title: "Apoiar o time",
        description: "Ajuda o Resenha como clube: estrutura, rotina esportiva, materiais e continuidade do projeto.",
        ctaLabel: "Ver apoio ao clube",
        href: "/apoiar-o-resenha",
        icon: HeartHandshake
    },
    {
        title: "Anunciar no site",
        description: "Divulga sua empresa em espacos combinados do site, como parceiros, materias e conteudos de jogo.",
        ctaLabel: "Falar no WhatsApp",
        href: commercialWhatsappHrefs.comparison,
        icon: MessageCircle,
        external: true
    }
];

const credibilityItems: PartnerItem[] = [
    {
        title: "Materias",
        description: "Conteudos editoriais do Resenha abrem espaco para oferecimentos bem sinalizados.",
        icon: Newspaper
    },
    {
        title: "Entrevistas",
        description: "Conversas e perfis ajudam a aproximar quem acompanha o clube da rotina do projeto.",
        icon: Users
    },
    {
        title: "Cronicas",
        description: "Textos de memoria e bastidor fortalecem a identidade local sem virar anuncio solto.",
        icon: ShieldCheck
    },
    {
        title: "Jogos",
        description: "Agenda, resultados e chamadas de rodada criam pontos naturais para parceria.",
        icon: Trophy
    },
    {
        title: "Galeria",
        description: "Fotos e registros do clube mantem a caminhada visivel para quem acompanha de perto.",
        icon: Camera
    },
    {
        title: "Pagina de parceiros",
        description: "A vitrine oficial organiza marcas que caminham junto com o Resenha.",
        icon: Handshake
    }
];

const partnerFaqs: FaqItem[] = [
    {
        question: "Onde minha empresa pode aparecer?",
        answer: "Na pagina de parceiros, em materias combinadas e em conteudos de jogo ou rodada quando fizer sentido."
    },
    {
        question: "Quem vai ver minha empresa?",
        answer: "Quem acompanha jogos, fotos, materias, jogadores, familia, amigos, torcedores e pessoas ligadas a comunidade do clube."
    },
    {
        question: "Preciso fechar um plano grande?",
        answer: "Nao. A conversa pode comecar pelo formato simples de aparecer no Resenha."
    },
    {
        question: "Pode ter link para WhatsApp ou Instagram?",
        answer: "Sim. O card pode apontar para WhatsApp, Instagram ou site da empresa."
    },
    {
        question: "Como faco para entrar?",
        answer: "Chame o Resenha no WhatsApp ou deixe seus dados no formulario. A conversa serve para mostrar os espacos e combinar um formato simples."
    },
    {
        question: "Isso e diferente de apoiar o time?",
        answer: "Sim. Anunciar no site divulga a empresa em espacos combinados. Apoiar o time fortalece o clube como projeto esportivo."
    }
];

async function getCommercialOfferContent() {
    let rows: Array<typeof commercialOfferContents.$inferSelect> = [];

    try {
        rows = await db.query.commercialOfferContents.findMany({
            where: eq(commercialOfferContents.isActive, true),
            orderBy: [asc(commercialOfferContents.slot), asc(commercialOfferContents.displayOrder)]
        });
    } catch {
        return { offer: commercialOffer, addOns: commercialAddOns };
    }
    return resolveCommercialOfferContent(rows, commercialOffer, commercialAddOns, buildDynamicCommercialWhatsappHref);
}

type ActiveHeroExperiment = typeof copyCtaExperiments.$inferSelect;

function isExperimentInWindow(experiment: ActiveHeroExperiment, now: Date) {
    const startsOk = !experiment.startsAt || experiment.startsAt <= now;
    const endsOk = !experiment.endsAt || experiment.endsAt >= now;

    return startsOk && endsOk;
}

async function getActiveHeroExperiment() {
    let rows: ActiveHeroExperiment[] = [];

    try {
        rows = await db.query.copyCtaExperiments.findMany({
            where: eq(copyCtaExperiments.isActive, true),
            orderBy: [desc(copyCtaExperiments.trafficWeight), asc(copyCtaExperiments.createdAt)]
        });
    } catch {
        return null;
    }
    const now = new Date();

    return rows.find((row) =>
        row.surface === "partner_page_hero" &&
        row.journey === "commercial" &&
        isExperimentInWindow(row, now)
    ) ?? null;
}

export const metadata: Metadata = createPageMetadata({
    title: "Seja parceiro",
    description:
        "Divulgue sua empresa no site do Resenha RFC e apareca em materias, jogos e na pagina de parceiros do clube.",
    path: "/seja-parceiro",
    keywords: [
        "anunciar no Resenha RFC",
        "anunciar no futebol amador",
        "divulgar empresa futebol local",
        "aparecer no site do Resenha",
        "comercio local esporte"
    ]
});

export const dynamic = "force-dynamic";

function CommercialWhatsappButton({
    label = "Falar no WhatsApp",
    href = commercialWhatsappHrefs.hero,
    source,
    className,
    experiment
}: {
    label?: string;
    href?: string;
    source: string;
    className?: string;
    experiment?: ActiveHeroExperiment | null;
}) {
    const isExternal = /^https?:\/\//.test(href);
    const trackingDestination = href.startsWith(`https://wa.me/${commercialContact.whatsappNumber}`) ? commercialContact.whatsappNumber : href;
    const commonProps = {
        "data-monetization-event": "cta_click",
        "data-label": label,
        "data-journey": "commercial",
        "data-source": source,
        "data-destination": trackingDestination,
        "data-experiment-key": experiment?.experimentKey,
        "data-experiment-variant": experiment?.variantLabel
    };

    return (
        <Button asChild size="lg" className={className}>
            {isExternal ? (
                <a href={href} target="_blank" rel="noopener noreferrer" {...commonProps}>
                    {label}
                    <MessageCircle className="ml-2 h-4 w-4" aria-hidden="true" />
                </a>
            ) : (
                <Link href={href} {...commonProps}>
                    {label}
                    <MessageCircle className="ml-2 h-4 w-4" aria-hidden="true" />
                </Link>
            )}
        </Button>
    );
}

export default async function SejaParceiroPage() {
    const [resolvedCommercialContent, heroExperiment] = await Promise.all([
        getCommercialOfferContent(),
        getActiveHeroExperiment()
    ]);
    const heroHeadline = heroExperiment?.headline ?? defaultHeroHeadline;
    const heroDescription = heroExperiment?.supportingCopy ?? defaultHeroDescription;
    const heroCtaLabel = heroExperiment?.ctaLabel ?? "Falar no WhatsApp";
    const heroCtaHref = heroExperiment?.destination ?? commercialWhatsappHrefs.hero;

    return (
        <div className="min-h-screen bg-navy-950 py-16 lg:py-20">
            <Container>
                <section className="relative overflow-hidden rounded-[2rem] border border-navy-800 bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.2),_transparent_34%),linear-gradient(180deg,rgba(10,22,40,0.97),rgba(6,14,26,1))] px-6 py-8 shadow-[0_28px_60px_rgba(0,0,0,0.24)] sm:px-8 lg:grid lg:grid-cols-[minmax(0,1fr)_410px] lg:gap-10 lg:px-12 lg:py-12">
                    <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/3 bg-[radial-gradient(circle_at_center,_rgba(212,168,67,0.14),_transparent_62%)] lg:block" />

                    <div className="relative z-10 max-w-4xl">
                        <Badge variant="gold" className="mb-5">
                            Para comercios da regiao
                        </Badge>
                        <h1 className="font-display text-4xl font-bold tracking-tight text-cream-100 sm:text-5xl lg:text-6xl">
                            {heroHeadline}
                        </h1>
                        <p className="mt-5 max-w-3xl text-base leading-8 text-cream-300 md:text-lg">
                            {heroDescription}
                        </p>
                        <p className="mt-4 max-w-2xl text-sm leading-7 text-cream-300">
                            {defaultHeroSupportText}
                        </p>

                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                            <CommercialWhatsappButton source="partner_page_hero" label={heroCtaLabel} href={heroCtaHref} experiment={heroExperiment} />
                            <Button asChild variant="outline" size="lg">
                                <Link
                                    href="#onde-aparece"
                                    data-monetization-event="cta_click"
                                    data-label="Ver onde minha empresa aparece"
                                    data-journey="commercial"
                                    data-source="partner_page_hero"
                                    data-destination="#onde-aparece"
                                >
                                    Ver onde minha empresa aparece
                                    <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                                </Link>
                            </Button>
                        </div>
                        <Link
                            href="#contato-comercial"
                            className="mt-4 inline-flex text-sm font-semibold text-blue-300 underline-offset-4 hover:text-blue-200 hover:underline"
                            data-monetization-event="cta_click"
                            data-label="Prefiro deixar meus dados"
                            data-journey="commercial"
                            data-source="partner_page_hero"
                            data-destination="#contato-comercial"
                        >
                            Prefiro deixar meus dados
                        </Link>
                    </div>

                    <Card variant="glass" className="relative z-10 mt-8 border-cream-100/8 bg-navy-950/55 lg:mt-0">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="relative h-20 w-20 overflow-hidden rounded-2xl border border-gold-400/25 bg-navy-900 p-3">
                                    <Image
                                        src="/logo2.png"
                                        alt="Escudo do Resenha RFC"
                                        fill
                                        sizes="80px"
                                        className="object-contain p-2"
                                        priority
                                    />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold-300">
                                        Previa nativa
                                    </p>
                                    <p className="mt-2 font-display text-2xl font-bold text-cream-100">
                                        Sua marca no Resenha
                                    </p>
                                </div>
                            </div>
                            <div className="mt-6 space-y-4">
                                <div className="rounded-2xl border border-cream-100/8 bg-navy-900/80 p-5">
                                    <Badge variant="accent" className="mb-4">
                                        Oferecimento
                                    </Badge>
                                    <p className="font-display text-xl font-bold text-cream-100">
                                        Sua empresa apoia a cobertura da rodada
                                    </p>
                                    <p className="mt-3 text-sm leading-7 text-cream-300">
                                        Um bloco discreto, com cara de Resenha, levando a pessoa para o contato da empresa.
                                    </p>
                                </div>
                                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                                    <div className="rounded-2xl border border-cream-100/8 bg-navy-900/70 p-4">
                                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-300">
                                            Parceiro oficial
                                        </p>
                                        <p className="mt-2 font-display text-lg font-bold text-cream-100">
                                            Sua empresa
                                        </p>
                                        <p className="mt-2 text-sm text-cream-300">Abrir WhatsApp</p>
                                    </div>
                                    <div className="rounded-2xl border border-gold-400/20 bg-gold-400/10 p-4">
                                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-300">
                                            Parceiro da rodada
                                        </p>
                                        <p className="mt-2 font-display text-lg font-bold text-cream-100">
                                            Rodada com apoio local
                                        </p>
                                        <p className="mt-2 text-sm text-cream-300">Ver Instagram</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                <section id="onde-aparece" className="mt-12" aria-labelledby="placements-heading">
                    <div className="mb-6 max-w-3xl">
                        <Badge variant="outline" className="mb-4 border-cream-100/10 bg-navy-950/40 text-cream-100">
                            Exemplos visuais
                        </Badge>
                        <h2 id="placements-heading" className="font-display text-3xl font-bold tracking-tight text-cream-100 sm:text-4xl">
                            Veja onde sua empresa pode aparecer
                        </h2>
                        <p className="mt-3 text-base leading-7 text-cream-300">
                            Antes de qualquer proposta, o Resenha mostra espacos simples, sinalizados e dentro do visual do site.
                        </p>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-3">
                        {partnerPlacements.map((placement) => {
                            const Icon = placement.icon;

                            return (
                                <Card key={placement.title} variant="glass" className="border-cream-100/8">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between gap-4">
                                            <Badge variant="accent">{placement.badge}</Badge>
                                            <Icon className="h-5 w-5 text-gold-400" aria-hidden="true" />
                                        </div>
                                        <div className="mt-5 rounded-2xl border border-cream-100/8 bg-navy-950/55 p-4">
                                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cream-300/70">
                                                {placement.context}
                                            </p>
                                            <p className="mt-4 text-sm font-semibold uppercase tracking-[0.18em] text-blue-300">
                                                {placement.sample}
                                            </p>
                                            <h3 className="mt-4 font-display text-2xl font-bold text-cream-100">{placement.title}</h3>
                                            <p className="mt-3 text-sm leading-7 text-cream-300">{placement.description}</p>
                                            <div className="mt-4 inline-flex items-center text-sm font-semibold text-blue-300">
                                                {placement.action}
                                                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>

                    <div className="mt-6 flex flex-col gap-3 rounded-[1.5rem] border border-cream-100/8 bg-navy-900/65 p-5 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm leading-7 text-cream-300">
                            Gostou de um formato? Chame o Resenha e veja onde sua empresa pode entrar primeiro.
                        </p>
                        <CommercialWhatsappButton
                            source="partner_page_after_examples"
                            href={commercialWhatsappHrefs.afterExamples}
                            className="w-full rounded-full sm:w-auto"
                        />
                    </div>
                </section>

                <section className="mt-12 grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)]" aria-labelledby="value-heading">
                    <Card variant="glass" className="border-cream-100/8">
                        <CardContent className="p-6 lg:p-8">
                            <Badge variant="gold" className="mb-4">
                                Valor direto
                            </Badge>
                            <h2 id="value-heading" className="font-display text-3xl font-bold tracking-tight text-cream-100">
                                Sua empresa nas materias, jogos e pagina de parceiros do Resenha
                            </h2>
                            <p className="mt-4 text-base leading-8 text-cream-300">
                                A ideia nao e vender promessa de numero. E colocar sua marca em lugares que quem acompanha o clube ja reconhece: conteudo, rodada e parceiros.
                            </p>
                        </CardContent>
                    </Card>

                    <div className="grid gap-4">
                        {valuePoints.map((item) => {
                            const Icon = item.icon;

                            return (
                                <Card key={item.title} className="border-navy-800 bg-navy-900/85">
                                    <CardContent className="flex gap-4 p-5">
                                        <Icon className="mt-1 h-5 w-5 shrink-0 text-blue-300" aria-hidden="true" />
                                        <div>
                                            <h3 className="font-display text-xl font-bold text-cream-100">{item.title}</h3>
                                            <p className="mt-2 text-sm leading-7 text-cream-300">{item.description}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </section>

                <section className="mt-12" aria-labelledby="audience-heading">
                    <div className="mb-6 max-w-3xl">
                        <Badge variant="outline" className="mb-4 border-cream-100/10 bg-navy-950/40 text-cream-100">
                            Publico local
                        </Badge>
                        <h2 id="audience-heading" className="font-display text-3xl font-bold tracking-tight text-cream-100 sm:text-4xl">
                            Quem vai ver sua empresa
                        </h2>
                        <p className="mt-3 text-base leading-7 text-cream-300">
                            O Resenha fala com gente ligada ao clube e ao futebol local. Sem inventar alcance: a proposta e aparecer com contexto para quem acompanha a caminhada.
                        </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                        {audienceItems.map((item) => {
                            const Icon = item.icon;

                            return (
                                <Card key={item.title} variant="glass" className="border-cream-100/8">
                                    <CardContent className="p-6">
                                        <Icon className="h-5 w-5 text-gold-400" aria-hidden="true" />
                                        <h3 className="mt-4 font-display text-xl font-bold text-cream-100">{item.title}</h3>
                                        <p className="mt-3 text-sm leading-7 text-cream-300">{item.description}</p>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </section>

                <section className="mt-12" aria-labelledby="local-commerce-heading">
                    <div className="mb-6 max-w-3xl">
                        <Badge variant="accent" className="mb-4">
                            Comercio local
                        </Badge>
                        <h2 id="local-commerce-heading" className="font-display text-3xl font-bold tracking-tight text-cream-100 sm:text-4xl">
                            Por que isso faz sentido para comercio local
                        </h2>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                        {localCommerceBenefits.map((benefit) => {
                            const Icon = benefit.icon;

                            return (
                                <Card key={benefit.title} className="border-navy-800 bg-navy-900/85">
                                    <CardContent className="p-6">
                                        <Icon className="h-5 w-5 text-blue-300" aria-hidden="true" />
                                        <h3 className="mt-4 font-display text-xl font-bold text-cream-100">{benefit.title}</h3>
                                        <p className="mt-3 text-sm leading-7 text-cream-300">{benefit.description}</p>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </section>

                <section className="mt-12" aria-labelledby="offer-heading">
                    <div className="mb-6 max-w-3xl">
                        <Badge variant="gold" className="mb-4">
                            Como comecar
                        </Badge>
                        <h2 id="offer-heading" className="font-display text-3xl font-bold tracking-tight text-cream-100 sm:text-4xl">
                            Comece com uma presenca simples no Resenha
                        </h2>
                        <p className="mt-3 text-base leading-7 text-cream-300">
                            Primeiro vem o formato base. Depois, se fizer sentido, entram extras como materia com oferecimento ou parceiro da rodada.
                        </p>
                    </div>

                    <CommercialOfferCard offer={resolvedCommercialContent.offer} addOns={resolvedCommercialContent.addOns} source="partner_page_offer" />

                    <div className="mt-6 flex flex-col gap-3 rounded-[1.5rem] border border-gold-400/20 bg-gold-400/10 p-5 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm leading-7 text-cream-300">
                            Nao precisa escolher tudo agora. Chame no WhatsApp e veja o comeco mais simples.
                        </p>
                        <CommercialWhatsappButton
                            source="partner_page_after_offer"
                            label="Chamar no WhatsApp"
                            href={commercialWhatsappHrefs.afterOffer}
                            className="w-full rounded-full sm:w-auto"
                        />
                    </div>
                </section>

                <section className="mt-12" aria-labelledby="difference-heading">
                    <div className="mb-6 max-w-3xl">
                        <Badge variant="outline" className="mb-4 border-cream-100/10 bg-navy-950/40 text-cream-100">
                            Caminho certo
                        </Badge>
                        <h2 id="difference-heading" className="font-display text-3xl font-bold tracking-tight text-cream-100 sm:text-4xl">
                            Apoiar o time e anunciar no site sao coisas diferentes
                        </h2>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        {comparisonItems.map((item) => {
                            const Icon = item.icon;
                            const card = (
                                <Card className="h-full border-navy-800 bg-navy-900/85 transition-colors hover:border-blue-500/30">
                                    <CardContent className="flex h-full flex-col p-6">
                                        <Icon className="h-6 w-6 text-gold-400" aria-hidden="true" />
                                        <h3 className="mt-5 font-display text-2xl font-bold text-cream-100">{item.title}</h3>
                                        <p className="mt-3 flex-1 text-sm leading-7 text-cream-300">{item.description}</p>
                                        <span className="mt-5 inline-flex items-center text-sm font-semibold text-blue-300">
                                            {item.ctaLabel}
                                            <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                                        </span>
                                    </CardContent>
                                </Card>
                            );

                            if (item.external) {
                                return (
                                    <a
                                        key={item.title}
                                        href={item.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block h-full"
                                        data-monetization-event="cta_click"
                                        data-label={item.ctaLabel}
                                        data-journey="commercial"
                                        data-source="partner_page_comparison"
                                        data-destination={item.href}
                                    >
                                        {card}
                                    </a>
                                );
                            }

                            return (
                                <Link
                                    key={item.title}
                                    href={item.href}
                                    className="block h-full"
                                    data-monetization-event="cta_click"
                                    data-label={item.ctaLabel}
                                    data-journey="support"
                                    data-source="partner_page_comparison"
                                    data-destination={item.href}
                                >
                                    {card}
                                </Link>
                            );
                        })}
                    </div>
                </section>

                <section className="mt-12" aria-labelledby="credibility-heading">
                    <div className="mb-6 max-w-3xl">
                        <Badge variant="gold" className="mb-4">
                            Prova concreta
                        </Badge>
                        <h2 id="credibility-heading" className="font-display text-3xl font-bold tracking-tight text-cream-100 sm:text-4xl">
                            O Resenha ja tem conteudo para sua marca aparecer com contexto
                        </h2>
                        <p className="mt-3 text-base leading-7 text-cream-300">
                            A parceria usa ativos atuais do portal: artigos, entrevistas, cronicas, jogos, galeria e pagina de parceiros.
                        </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {credibilityItems.map((item) => {
                            const Icon = item.icon;

                            return (
                                <Card key={item.title} variant="glass" className="border-cream-100/8">
                                    <CardContent className="p-5">
                                        <Icon className="h-5 w-5 text-blue-300" aria-hidden="true" />
                                        <h3 className="mt-4 font-display text-lg font-bold text-cream-100">{item.title}</h3>
                                        <p className="mt-2 text-sm leading-7 text-cream-300">{item.description}</p>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </section>

                <section id="contato-comercial" className="mt-12 grid gap-6 lg:grid-cols-[minmax(0,0.82fr)_minmax(360px,1fr)] lg:items-start" aria-labelledby="commercial-contact-heading">
                    <Card className="border-navy-800 bg-navy-900/85">
                        <CardContent className="p-6 lg:p-8">
                            <Badge variant="accent" className="mb-4">
                                Contato comercial
                            </Badge>
                            <h2 id="commercial-contact-heading" className="font-display text-3xl font-bold tracking-tight text-cream-100">
                                Chame agora ou deixe seus dados para o Resenha retornar
                            </h2>
                            <p className="mt-4 text-base leading-8 text-cream-300">
                                O WhatsApp e o caminho mais rapido. O formulario fica para quem prefere registrar nome, empresa, opcao desejada e contato antes da conversa.
                            </p>
                            <div className="mt-6 grid gap-3">
                                {[
                                    "Nome, empresa, WhatsApp, opcao desejada e consentimento sao obrigatorios.",
                                    "Tipo de negocio, Instagram ou site e mensagem ajudam a entender melhor sua empresa.",
                                    "Sem compromisso: a conversa serve para mostrar espacos e combinar um formato simples."
                                ].map((item) => (
                                    <div key={item} className="flex gap-3 rounded-2xl border border-cream-100/8 bg-navy-950/50 p-4 text-sm leading-7 text-cream-300">
                                        <MessageCircle className="mt-1 h-4 w-4 shrink-0 text-gold-400" aria-hidden="true" />
                                        <span>{item}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-6">
                                <CommercialWhatsappButton
                                    source="partner_page_contact_intro"
                                    label="Falar direto no WhatsApp"
                                    href={commercialWhatsappHrefs.contactIntro}
                                    className="w-full rounded-full sm:w-auto"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <LeadForm variant="commercial" source="partner_page" />
                </section>

                <FaqBlock
                    items={partnerFaqs}
                    title="Duvidas antes de divulgar sua empresa"
                    description="As respostas deixam claro onde a marca aparece, quem pode ver, como entrar e quando o caminho certo e apoiar o clube."
                    source="partner_page"
                    defaultOpenFirst
                    className="mt-12"
                />

                <section className="mt-6 flex flex-col gap-3 rounded-[1.5rem] border border-cream-100/8 bg-navy-900/65 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm leading-7 text-cream-300">
                        Ainda ficou alguma duvida? Chame no WhatsApp e o Resenha mostra os formatos com calma.
                    </p>
                    <CommercialWhatsappButton
                        source="partner_page_after_faq"
                        label="Tirar duvida no WhatsApp"
                        href={commercialWhatsappHrefs.afterFaq}
                        className="w-full rounded-full sm:w-auto"
                    />
                </section>

                <section className="mt-12 overflow-hidden rounded-[2rem] border border-gold-400/20 bg-[linear-gradient(135deg,rgba(212,168,67,0.14),rgba(10,22,40,0.96)_42%,rgba(6,14,26,0.98))] px-6 py-8 sm:px-8 lg:px-10" aria-labelledby="partner-final-cta-heading">
                    <div className="max-w-3xl">
                        <Badge variant="gold" className="mb-4">
                            Seja parceiro
                        </Badge>
                        <h2 id="partner-final-cta-heading" className="font-display text-3xl font-bold tracking-tight text-cream-100 sm:text-4xl">
                            Sua empresa pode aparecer no Resenha sem complicar a conversa.
                        </h2>
                        <p className="mt-4 text-base leading-8 text-cream-300">
                            Se voce tem um comercio, servico ou projeto local, chame o Resenha e veja onde sua marca pode entrar no site.
                        </p>
                        <div className="mt-7">
                            <CommercialWhatsappButton
                                source="partner_page_final_cta"
                                label="Mandar mensagem agora"
                                href={commercialWhatsappHrefs.finalCta}
                                className="w-full rounded-full sm:w-auto"
                            />
                        </div>
                    </div>
                </section>
            </Container>
        </div>
    );
}
