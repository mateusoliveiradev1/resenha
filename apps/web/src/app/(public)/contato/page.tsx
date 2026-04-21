import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Badge, Button, Card, CardContent, Container } from "@resenha/ui";
import type { LucideIcon } from "lucide-react";
import {
    ArrowRight,
    Building2,
    Handshake,
    HeartHandshake,
    Mail,
    MessageCircle,
    Newspaper,
    ShieldCheck,
    Trophy,
    Users
} from "lucide-react";
import {
    CONTACT_DISPLAY_PHONE,
    CONTACT_EMAIL,
    CONTACT_INTENTS,
    type ContactAction,
    type ContactIntent,
    buildMailtoHref,
    buildWhatsAppHref
} from "@/lib/contact";
import { ContactForm } from "@/components/contact/ContactForm";
import { createPageMetadata } from "@/lib/seo";

type DirectChannel = {
    title: string;
    value: string;
    description: string;
    ctaLabel: string;
    href: string;
    icon: LucideIcon;
    actionType: ContactAction["type"];
    journey: ContactIntent["journey"];
    destination: string;
    external?: boolean;
};

type TrackingProps = {
    label: string;
    journey: ContactIntent["journey"] | "credibility";
    source: string;
    destination: string;
    context?: string;
};

const heroWhatsAppHref = buildWhatsAppHref("Oi, Resenha! Vim pelo site e quero falar com o clube.");
const heroEmailHref = buildMailtoHref({
    subject: "Contato pelo site do Resenha RFC",
    body: "Oi, Resenha!\n\nVim pelo site e quero falar com o clube sobre:\n\n"
});

const directChannels: DirectChannel[] = [
    {
        title: "WhatsApp oficial",
        value: CONTACT_DISPLAY_PHONE,
        description: "Para abrir conversa rapida sobre parceria, apoio, jogos, duvidas ou o melhor caminho de contato.",
        ctaLabel: "Chamar no WhatsApp",
        href: heroWhatsAppHref,
        icon: MessageCircle,
        actionType: "whatsapp",
        journey: "general",
        destination: CONTACT_DISPLAY_PHONE,
        external: true
    },
    {
        title: "E-mail oficial",
        value: CONTACT_EMAIL,
        description: "Para pautas, documentos, assuntos institucionais ou mensagens que precisam de mais contexto.",
        ctaLabel: "Enviar e-mail",
        href: heroEmailHref,
        icon: Mail,
        actionType: "email",
        journey: "institutional",
        destination: CONTACT_EMAIL
    }
];

const intentIconByJourney: Record<ContactIntent["journey"], LucideIcon> = {
    commercial: Handshake,
    support: HeartHandshake,
    sports: Trophy,
    editorial: Newspaper,
    institutional: Building2,
    general: Users
};

const journeyLabels: Record<ContactIntent["journey"], string> = {
    commercial: "Parceria",
    support: "Apoio",
    sports: "Jogos",
    editorial: "Conteudo",
    institutional: "Institucional",
    general: "Geral"
};

const sponsorRoute = {
    title: "Ver patrocinadores",
    description:
        "Para conhecer marcas que ja caminham com o clube antes de conversar sobre apoio, parceria ou presenca no site.",
    href: "/patrocinadores",
    ctaLabel: "Ver vitrine oficial",
    badge: "Credibilidade",
    journey: "credibility" as const,
    destination: "/patrocinadores",
    icon: ShieldCheck
};
const SponsorRouteIcon = sponsorRoute.icon;

export const metadata: Metadata = createPageMetadata({
    title: "Contato oficial",
    description:
        `Fale com o Resenha RFC pelo WhatsApp ${CONTACT_DISPLAY_PHONE} ou e-mail ${CONTACT_EMAIL} para parcerias, apoio, patrocinio, amistosos e assuntos institucionais.`,
    path: "/contato",
    keywords: [
        "contato Resenha RFC",
        "WhatsApp Resenha RFC",
        "parceria Resenha RFC",
        "apoio ao Resenha RFC",
        "patrocinio Resenha RFC",
        "amistosos Resenha RFC",
        "fale com o Resenha RFC"
    ]
});

function trackingProps({ label, journey, source, destination, context }: TrackingProps) {
    return {
        "data-monetization-event": "cta_click",
        "data-label": label,
        "data-journey": journey,
        "data-source": source,
        "data-destination": destination,
        "data-context": context
    };
}

function ActionIcon({
    actionType,
    className
}: {
    actionType: ContactAction["type"];
    className?: string;
}) {
    if (actionType === "whatsapp") {
        return <MessageCircle className={className} aria-hidden="true" />;
    }

    if (actionType === "email") {
        return <Mail className={className} aria-hidden="true" />;
    }

    return <ArrowRight className={className} aria-hidden="true" />;
}

function ActionButton({
    action,
    intent,
    source,
    variant = "outline",
    className = "w-full rounded-full"
}: {
    action: ContactAction;
    intent: ContactIntent;
    source: string;
    variant?: "primary" | "outline" | "secondary" | "ghost";
    className?: string;
}) {
    const commonProps = trackingProps({
        label: action.label,
        journey: intent.journey,
        source,
        destination: action.destination,
        context: intent.id
    });
    const content = (
        <>
            <span>{action.label}</span>
            <ActionIcon actionType={action.type} className="ml-2 h-4 w-4 shrink-0" />
        </>
    );

    return (
        <Button asChild variant={variant} className={className}>
            {action.type === "internal" ? (
                <Link href={action.href} {...commonProps}>
                    {content}
                </Link>
            ) : (
                <a
                    href={action.href}
                    target={action.external ? "_blank" : undefined}
                    rel={action.external ? "noopener noreferrer" : undefined}
                    aria-label={`${action.label} para ${intent.title}`}
                    {...commonProps}
                >
                    {content}
                </a>
            )}
        </Button>
    );
}

function ActionTextLink({
    action,
    intent,
    source
}: {
    action: ContactAction;
    intent: ContactIntent;
    source: string;
}) {
    const className =
        "inline-flex items-center text-sm font-semibold text-blue-300 underline-offset-4 transition-colors hover:text-blue-200 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400";
    const commonProps = trackingProps({
        label: action.label,
        journey: intent.journey,
        source,
        destination: action.destination,
        context: intent.id
    });
    const content = (
        <>
            {action.label}
            <ActionIcon actionType={action.type} className="ml-2 h-4 w-4" />
        </>
    );

    if (action.type === "internal") {
        return (
            <Link href={action.href} className={className} {...commonProps}>
                {content}
            </Link>
        );
    }

    return (
        <a
            href={action.href}
            className={className}
            target={action.external ? "_blank" : undefined}
            rel={action.external ? "noopener noreferrer" : undefined}
            aria-label={`${action.label} para ${intent.title}`}
            {...commonProps}
        >
            {content}
        </a>
    );
}

export default function ContatoPage() {
    return (
        <div className="min-h-screen bg-navy-950 py-16 lg:py-20">
            <Container>
                <section className="relative overflow-hidden rounded-2xl border border-navy-800 bg-[linear-gradient(135deg,rgba(10,22,40,0.98),rgba(6,14,26,0.96))] px-6 py-8 shadow-[0_28px_60px_rgba(0,0,0,0.24)] sm:px-8 lg:px-12 lg:py-12">
                    <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-gold-400/50 to-transparent" />

                    <div className="relative z-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-center">
                        <div className="max-w-4xl">
                            <Badge variant="gold" className="mb-5">
                                Central oficial de contato
                            </Badge>
                            <h1 className="font-display text-4xl font-bold text-cream-100 sm:text-5xl lg:text-6xl">
                                Fale com o Resenha RFC pelo canal certo.
                            </h1>
                            <p className="mt-5 max-w-3xl text-base leading-8 text-cream-300 md:text-lg">
                                Use esta pagina para conversar sobre parcerias, apoio ao clube, amistosos, imprensa,
                                conteudo, assuntos institucionais ou duvidas gerais. WhatsApp e e-mail sao os canais
                                oficiais para comecar.
                            </p>

                            <div className="mt-8 grid max-w-3xl gap-3 sm:grid-cols-2">
                                <Button asChild size="lg" className="h-auto min-h-12 w-full whitespace-normal rounded-full px-5 py-3">
                                    <a
                                        href={heroWhatsAppHref}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label={`Chamar o Resenha no WhatsApp ${CONTACT_DISPLAY_PHONE}`}
                                        {...trackingProps({
                                            label: "WhatsApp oficial",
                                            journey: "general",
                                            source: "contact_page_hero",
                                            destination: CONTACT_DISPLAY_PHONE,
                                            context: "primary_whatsapp"
                                        })}
                                    >
                                        <span className="flex min-w-0 flex-col text-left leading-tight">
                                            <span className="text-xs text-cream-100/75">WhatsApp</span>
                                            <span>{CONTACT_DISPLAY_PHONE}</span>
                                        </span>
                                        <MessageCircle className="ml-3 h-5 w-5 shrink-0" aria-hidden="true" />
                                    </a>
                                </Button>
                                <Button
                                    asChild
                                    variant="outline"
                                    size="lg"
                                    className="h-auto min-h-12 w-full whitespace-normal rounded-full px-5 py-3"
                                >
                                    <a
                                        href={heroEmailHref}
                                        aria-label={`Enviar e-mail para ${CONTACT_EMAIL}`}
                                        {...trackingProps({
                                            label: "E-mail oficial",
                                            journey: "institutional",
                                            source: "contact_page_hero",
                                            destination: CONTACT_EMAIL,
                                            context: "primary_email"
                                        })}
                                    >
                                        <span className="flex min-w-0 flex-col text-left leading-tight">
                                            <span className="text-xs text-cream-100/75">E-mail</span>
                                            <span className="break-all">{CONTACT_EMAIL}</span>
                                        </span>
                                        <Mail className="ml-3 h-5 w-5 shrink-0" aria-hidden="true" />
                                    </a>
                                </Button>
                            </div>
                        </div>

                        <div className="rounded-xl border border-cream-100/8 bg-navy-950/55 p-6">
                            <div className="flex items-center gap-4">
                                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-gold-400/25 bg-navy-900 p-3">
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
                                    <p className="text-sm font-semibold text-gold-300">Resenha RFC</p>
                                    <p className="mt-1 text-2xl font-bold text-cream-100">Contato oficial do clube</p>
                                </div>
                            </div>
                            <dl className="mt-6 grid gap-4 text-sm">
                                <div className="border-t border-cream-100/8 pt-4">
                                    <dt className="text-cream-300">Telefone e WhatsApp</dt>
                                    <dd className="mt-1 font-semibold text-cream-100">{CONTACT_DISPLAY_PHONE}</dd>
                                </div>
                                <div className="border-t border-cream-100/8 pt-4">
                                    <dt className="text-cream-300">E-mail</dt>
                                    <dd className="mt-1 break-all font-semibold text-cream-100">{CONTACT_EMAIL}</dd>
                                </div>
                            </dl>
                        </div>
                    </div>
                </section>

                <section className="mt-12" aria-labelledby="direct-contact-heading">
                    <div className="mb-6 max-w-3xl">
                        <Badge variant="accent" className="mb-4">
                            Canais diretos
                        </Badge>
                        <h2 id="direct-contact-heading" className="font-display text-3xl font-bold text-cream-100 sm:text-4xl">
                            Comece pelo contato que combina com a sua mensagem.
                        </h2>
                        <p className="mt-3 text-base leading-7 text-cream-300">
                            WhatsApp resolve conversas rapidas. E-mail ajuda quando o assunto pede contexto, documentos ou
                            encaminhamento institucional.
                        </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        {directChannels.map((channel) => {
                            const Icon = channel.icon;

                            return (
                                <Card key={channel.title} className="border-navy-800 bg-navy-900/85">
                                    <CardContent className="flex h-full flex-col p-6">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-500/10 text-blue-300">
                                                <Icon className="h-5 w-5" aria-hidden="true" />
                                            </div>
                                            <Badge variant="outline" className="border-cream-100/10 bg-navy-950/50 text-cream-100">
                                                Oficial
                                            </Badge>
                                        </div>
                                        <h3 className="mt-5 font-display text-2xl font-bold text-cream-100">{channel.title}</h3>
                                        <p className="mt-2 break-all text-lg font-semibold text-gold-300">{channel.value}</p>
                                        <p className="mt-4 flex-1 text-sm leading-7 text-cream-300">{channel.description}</p>
                                        <Button asChild className="mt-6 w-full rounded-full sm:w-auto">
                                            <a
                                                href={channel.href}
                                                target={channel.external ? "_blank" : undefined}
                                                rel={channel.external ? "noopener noreferrer" : undefined}
                                                aria-label={`${channel.ctaLabel}: ${channel.value}`}
                                                {...trackingProps({
                                                    label: channel.ctaLabel,
                                                    journey: channel.journey,
                                                    source: "contact_page_direct_channels",
                                                    destination: channel.destination,
                                                    context: channel.actionType
                                                })}
                                            >
                                                {channel.ctaLabel}
                                                <Icon className="ml-2 h-4 w-4" aria-hidden="true" />
                                            </a>
                                        </Button>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </section>

                <section className="mt-12" aria-labelledby="intent-routing-heading">
                    <div className="mb-6 max-w-3xl">
                        <Badge variant="gold" className="mb-4">
                            Motivo do contato
                        </Badge>
                        <h2 id="intent-routing-heading" className="font-display text-3xl font-bold text-cream-100 sm:text-4xl">
                            Escolha o caminho mais direto para o seu assunto.
                        </h2>
                        <p className="mt-3 text-base leading-7 text-cream-300">
                            Algumas conversas ficam melhores nas paginas de apoio, parceria ou patrocinadores. Outras ja
                            podem comecar por WhatsApp ou e-mail.
                        </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {CONTACT_INTENTS.map((intent) => {
                            const Icon = intentIconByJourney[intent.journey];

                            return (
                                <Card key={intent.id} className="border-navy-800 bg-navy-900/85">
                                    <CardContent className="flex h-full flex-col p-6">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gold-400/20 bg-gold-400/10 text-gold-300">
                                                <Icon className="h-5 w-5" aria-hidden="true" />
                                            </div>
                                            <Badge variant="outline" className="border-cream-100/10 bg-navy-950/50 text-cream-100">
                                                {journeyLabels[intent.journey]}
                                            </Badge>
                                        </div>
                                        <h3 className="mt-5 font-display text-xl font-bold text-cream-100">{intent.title}</h3>
                                        <p className="mt-3 flex-1 text-sm leading-7 text-cream-300">{intent.description}</p>
                                        <div className="mt-6 space-y-3">
                                            <ActionButton action={intent.primaryAction} intent={intent} source="contact_page_intent_cards" />
                                            {intent.secondaryAction ? (
                                                <ActionTextLink
                                                    action={intent.secondaryAction}
                                                    intent={intent}
                                                    source="contact_page_intent_cards_secondary"
                                                />
                                            ) : null}
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}

                        <Card className="border-navy-800 bg-navy-900/85">
                            <CardContent className="flex h-full flex-col p-6">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-500/10 text-blue-300">
                                        <SponsorRouteIcon className="h-5 w-5" aria-hidden="true" />
                                    </div>
                                    <Badge variant="outline" className="border-cream-100/10 bg-navy-950/50 text-cream-100">
                                        {sponsorRoute.badge}
                                    </Badge>
                                </div>
                                <h3 className="mt-5 font-display text-xl font-bold text-cream-100">{sponsorRoute.title}</h3>
                                <p className="mt-3 flex-1 text-sm leading-7 text-cream-300">{sponsorRoute.description}</p>
                                <Button asChild variant="outline" className="mt-6 w-full rounded-full">
                                    <Link
                                        href={sponsorRoute.href}
                                        {...trackingProps({
                                            label: sponsorRoute.ctaLabel,
                                            journey: sponsorRoute.journey,
                                            source: "contact_page_intent_cards",
                                            destination: sponsorRoute.destination,
                                            context: "sponsor_credibility"
                                        })}
                                    >
                                        {sponsorRoute.ctaLabel}
                                        <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </section>

                <section className="mt-12 rounded-xl border border-gold-400/20 bg-gold-400/10 p-6 sm:p-8" aria-labelledby="contact-expectations-heading">
                    <div className="flex flex-col gap-5 md:flex-row md:items-start">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-gold-400/25 bg-navy-950/50 text-gold-300">
                            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                        </div>
                        <div className="max-w-4xl">
                            <h2 id="contact-expectations-heading" className="font-display text-2xl font-bold text-cream-100 sm:text-3xl">
                                Conversa direta, expectativa honesta.
                            </h2>
                            <p className="mt-3 text-sm leading-7 text-cream-300 sm:text-base">
                                WhatsApp e e-mail sao os caminhos mais rapidos para iniciar a conversa com o Resenha.
                                O clube le cada mensagem dentro do contexto do momento, sem promessa de prazo de resposta,
                                resultado comercial, alcance, retorno financeiro ou confirmacao automatica de jogos.
                            </p>
                        </div>
                    </div>
                </section>

                <section className="mt-12 grid gap-6 lg:grid-cols-[minmax(0,0.86fr)_minmax(420px,1.14fr)] lg:items-start" aria-labelledby="contact-form-heading">
                    <div className="lg:sticky lg:top-24">
                        <Badge variant="accent" className="mb-4">
                            Formulario
                        </Badge>
                        <h2 id="contact-form-heading" className="font-display text-3xl font-bold text-cream-100 sm:text-4xl">
                            Prefere organizar a mensagem antes de abrir o canal?
                        </h2>
                        <p className="mt-4 text-base leading-7 text-cream-300">
                            Use o formulario como apoio para montar uma mensagem completa com nome, contato de retorno,
                            assunto e contexto. Depois de validar os campos, o site abre WhatsApp ou e-mail com tudo
                            preenchido para voce revisar e enviar.
                        </p>
                        <div className="mt-6 space-y-4 text-sm leading-7 text-cream-300">
                            <p className="border-l-2 border-blue-400/50 pl-4">
                                Informe pelo menos um canal de retorno valido. WhatsApp e e-mail continuam sendo os meios
                                oficiais para comecar a conversa.
                            </p>
                            <p className="border-l-2 border-gold-400/50 pl-4">
                                O envio final acontece no aplicativo externo aberto pelo formulario; a pagina nao cria inbox
                                interno nem confirma resposta automatica.
                            </p>
                        </div>
                    </div>

                    <ContactForm />
                </section>
            </Container>
        </div>
    );
}
