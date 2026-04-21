import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Badge, Button, Card, CardContent, Container } from "@resenha/ui";
import type { LucideIcon } from "lucide-react";
import {
    ArrowRight,
    CalendarDays,
    Camera,
    HeartHandshake,
    MessageCircle,
    ShieldCheck,
    Sparkles,
    Trophy,
    Users
} from "lucide-react";
import { FaqBlock, type FaqItem } from "@/components/monetization/FaqBlock";
import { LeadForm } from "@/components/monetization/LeadForm";
import { createPageMetadata } from "@/lib/seo";

type SupportItem = {
    title: string;
    description: string;
    icon: LucideIcon;
};

const supportValueBlocks: SupportItem[] = [
    {
        title: "Estrutura do time",
        description: "Ajuda em materiais, inscricoes, logistica e rotina para o clube seguir organizado.",
        icon: ShieldCheck
    },
    {
        title: "Campo e quadra",
        description: "Fortalece as duas frentes do Resenha sem separar a identidade do clube.",
        icon: Trophy
    },
    {
        title: "Conteudo e memoria",
        description: "Mantem registros, materias, fotos e cobertura para contar a caminhada do projeto.",
        icon: Camera
    },
    {
        title: "Comunidade",
        description: "Aproxima quem joga, torce, acompanha e acredita no futebol amador local.",
        icon: Users
    }
];

const supportTypes: SupportItem[] = [
    {
        title: "Apoio pontual",
        description: "Ajuda especifica para uma rodada, material, inscricao ou necessidade do momento.",
        icon: Sparkles
    },
    {
        title: "Apoio recorrente",
        description: "Combinado simples para sustentar parte da rotina do clube durante a temporada.",
        icon: CalendarDays
    },
    {
        title: "Patrocinio institucional",
        description: "Marca ou empresa caminhando junto do projeto esportivo do Resenha.",
        icon: HeartHandshake
    },
    {
        title: "Produto ou servico",
        description: "Materiais, transporte, alimentacao, impressos, fotos, equipamentos ou estrutura.",
        icon: ShieldCheck
    },
    {
        title: "Quero conversar antes",
        description: "Para quem quer entender com calma qual formato faz sentido para o clube e para o apoiador.",
        icon: MessageCircle
    }
];

const supporterRecognition: string[] = [
    "Nome ou marca na area de apoiadores quando fizer sentido para o formato combinado.",
    "Agradecimento em conteudos institucionais do clube.",
    "Possibilidade de aparecer em acoes do Resenha como reconhecimento, nao como promessa de anuncio.",
    "Relacao direta com as pessoas responsaveis pelo projeto."
];

const credibilityItems: SupportItem[] = [
    {
        title: "Portal oficial",
        description: "O site organiza jogos, elenco, galeria, noticias e parceiros em um so lugar.",
        icon: ShieldCheck
    },
    {
        title: "Fundado em 2023",
        description: "O Resenha nasceu como projeto esportivo com identidade propria e presenca local.",
        icon: CalendarDays
    },
    {
        title: "Campo e quadra",
        description: "A identidade do clube passa pelas duas frentes, com calendario e rotina esportiva.",
        icon: Trophy
    },
    {
        title: "Conteudo e galeria",
        description: "Materias, fotos e registros ajudam a preservar a memoria de cada etapa do projeto.",
        icon: Camera
    }
];

const supportFaqs: FaqItem[] = [
    {
        question: "O apoio e so para empresas?",
        answer: "Nao. Pessoas, amigos, familiares, torcedores e empresas podem apoiar o Resenha."
    },
    {
        question: "Preciso fechar um valor agora?",
        answer: "Nao. O primeiro passo e conversar para entender o tipo de apoio e o melhor formato."
    },
    {
        question: "O apoio aparece no site?",
        answer: "Pode aparecer como reconhecimento, dependendo do formato combinado com o clube."
    },
    {
        question: "Isso e a mesma coisa que anunciar no site?",
        answer: "Nao. Apoiar o Resenha fortalece o clube. Para visibilidade comercial no portal, o caminho certo e Seja parceiro."
    },
    {
        question: "Posso apoiar com produto ou servico?",
        answer: "Sim. Materiais, transporte, alimentacao, estrutura, impressos, equipamentos e servicos podem fazer sentido."
    }
];

export const metadata: Metadata = createPageMetadata({
    title: "Apoiar o Resenha",
    description:
        "Saiba como apoiar o Resenha RFC e fortalecer o projeto esportivo do clube no campo, na quadra e na comunidade.",
    path: "/apoiar-o-resenha",
    keywords: [
        "apoiar Resenha RFC",
        "apoio ao futebol amador",
        "patrocinio futebol amador",
        "apoiar time amador",
        "Resenha RFC apoio"
    ]
});

export default function ApoiarOResenhaPage() {
    return (
        <div className="min-h-screen bg-navy-950 py-16 lg:py-20">
            <Container>
                <section className="relative overflow-hidden rounded-[2rem] border border-navy-800 bg-[radial-gradient(circle_at_top_left,_rgba(212,168,67,0.18),_transparent_34%),linear-gradient(180deg,rgba(10,22,40,0.97),rgba(6,14,26,1))] px-6 py-8 shadow-[0_28px_60px_rgba(0,0,0,0.24)] sm:px-8 lg:grid lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-10 lg:px-12 lg:py-12">
                    <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/3 bg-[radial-gradient(circle_at_center,_rgba(37,99,235,0.16),_transparent_62%)] lg:block" />

                    <div className="relative z-10 max-w-4xl">
                        <Badge variant="gold" className="mb-5">
                            Apoio ao clube
                        </Badge>
                        <h1 className="font-display text-4xl font-bold tracking-tight text-cream-100 sm:text-5xl lg:text-6xl">
                            Ajude o Resenha a seguir em campo, em quadra e na comunidade.
                        </h1>
                        <p className="mt-5 max-w-3xl text-base leading-8 text-cream-300 md:text-lg">
                            O apoio ao Resenha fortalece a estrutura do time, ajuda na rotina esportiva e mantem viva uma cobertura feita com identidade, organizacao e respeito pela nossa historia.
                        </p>

                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                            <Button asChild size="lg">
                                <Link
                                    href="#fale-sobre-apoio"
                                    data-monetization-event="cta_click"
                                    data-label="Quero apoiar o Resenha"
                                    data-journey="support"
                                    data-source="support_page_hero"
                                    data-destination="#fale-sobre-apoio"
                                >
                                    Quero apoiar o Resenha
                                    <HeartHandshake className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                            <Button asChild variant="outline" size="lg">
                                <Link
                                    href="#formas-de-apoio"
                                    data-monetization-event="cta_click"
                                    data-label="Ver formas de apoio"
                                    data-journey="support"
                                    data-source="support_page_hero"
                                    data-destination="#formas-de-apoio"
                                >
                                    Ver formas de apoio
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                    </div>

                    <Card variant="glass" className="relative z-10 mt-8 border-cream-100/8 bg-navy-950/55 lg:mt-0">
                        <CardContent className="p-6">
                            <div className="flex justify-center">
                                <div className="relative h-32 w-32 overflow-hidden rounded-full border border-gold-400/25 bg-navy-900 p-4 shadow-[0_20px_48px_rgba(212,168,67,0.14)]">
                                    <Image
                                        src="/logo2.png"
                                        alt="Escudo do Resenha RFC"
                                        fill
                                        sizes="128px"
                                        className="object-contain p-3"
                                        priority
                                    />
                                </div>
                            </div>
                            <div className="mt-6 grid gap-3">
                                {["Campo", "Quadra", "Comunidade"].map((item) => (
                                    <div
                                        key={item}
                                        className="rounded-2xl border border-cream-100/8 bg-navy-900/80 px-4 py-3 text-center text-sm font-semibold uppercase tracking-[0.22em] text-cream-100"
                                    >
                                        {item}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </section>

                <section className="mt-12" aria-labelledby="support-values-heading">
                    <div className="max-w-3xl">
                        <Badge variant="outline" className="mb-4 border-cream-100/10 bg-navy-950/40 text-cream-100">
                            Como o apoio fortalece o clube
                        </Badge>
                        <h2 id="support-values-heading" className="font-display text-3xl font-bold tracking-tight text-cream-100 sm:text-4xl">
                            Apoio que vira estrutura para a rotina do Resenha
                        </h2>
                        <p className="mt-3 text-base leading-7 text-cream-300">
                            A ideia e simples: manter o clube mais organizado, presente e preparado para cada compromisso.
                        </p>
                    </div>

                    <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        {supportValueBlocks.map((item) => {
                            const Icon = item.icon;

                            return (
                                <Card key={item.title} variant="glass" className="border-cream-100/8">
                                    <CardContent className="p-6">
                                        <Icon className="h-6 w-6 text-gold-400" aria-hidden="true" />
                                        <h3 className="mt-5 font-display text-xl font-bold text-cream-100">{item.title}</h3>
                                        <p className="mt-3 text-sm leading-7 text-cream-300">{item.description}</p>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </section>

                <section id="formas-de-apoio" className="mt-12" aria-labelledby="support-types-heading">
                    <div className="mb-6 max-w-3xl">
                        <Badge variant="accent" className="mb-4">
                            Formas de apoio
                        </Badge>
                        <h2 id="support-types-heading" className="font-display text-3xl font-bold tracking-tight text-cream-100 sm:text-4xl">
                            Escolha um caminho flexivel para jogar junto
                        </h2>
                        <p className="mt-3 text-base leading-7 text-cream-300">
                            Nao precisa chegar com tudo fechado. O apoio pode comecar por uma conversa honesta sobre o que o clube precisa e o que voce pode oferecer.
                        </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                        {supportTypes.map((item) => {
                            const Icon = item.icon;

                            return (
                                <Card key={item.title} className="border-navy-800 bg-navy-900/85">
                                    <CardContent className="p-5">
                                        <Icon className="h-5 w-5 text-blue-300" aria-hidden="true" />
                                        <h3 className="mt-4 font-display text-lg font-bold text-cream-100">{item.title}</h3>
                                        <p className="mt-3 text-sm leading-7 text-cream-300">{item.description}</p>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </section>

                <section className="mt-12 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.8fr)]" aria-labelledby="recognition-heading">
                    <Card variant="glass" className="border-cream-100/8">
                        <CardContent className="p-6 lg:p-8">
                            <Badge variant="gold" className="mb-4">
                                Reconhecimento
                            </Badge>
                            <h2 id="recognition-heading" className="font-display text-3xl font-bold tracking-tight text-cream-100">
                                Visibilidade como agradecimento, nao como promessa comercial
                            </h2>
                            <p className="mt-4 text-base leading-8 text-cream-300">
                                Quando o apoio tiver exposicao publica, ela entra como reconhecimento pela caminhada junto. O Resenha nao promete alcance, retorno financeiro ou resultado esportivo.
                            </p>
                            <ul className="mt-6 grid gap-3">
                                {supporterRecognition.map((item) => (
                                    <li key={item} className="flex gap-3 text-sm leading-7 text-cream-300">
                                        <ShieldCheck className="mt-1 h-4 w-4 shrink-0 text-gold-400" aria-hidden="true" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>

                    <Card className="border-navy-800 bg-navy-900/85">
                        <CardContent className="p-6 lg:p-8">
                            <Badge variant="outline" className="mb-4 border-cream-100/10 bg-navy-950/40 text-cream-100">
                                Contexto do clube
                            </Badge>
                            <div className="grid gap-4">
                                {credibilityItems.map((item) => {
                                    const Icon = item.icon;

                                    return (
                                        <div key={item.title} className="rounded-2xl border border-cream-100/8 bg-navy-950/50 p-4">
                                            <Icon className="h-5 w-5 text-blue-300" aria-hidden="true" />
                                            <h3 className="mt-3 font-display text-lg font-bold text-cream-100">{item.title}</h3>
                                            <p className="mt-2 text-sm leading-7 text-cream-300">{item.description}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </section>

                <section id="fale-sobre-apoio" className="mt-12 grid gap-6 lg:grid-cols-[minmax(0,0.82fr)_minmax(360px,1fr)] lg:items-start">
                    <Card className="border-navy-800 bg-navy-900/85">
                        <CardContent className="p-6 lg:p-8">
                            <Badge variant="gold" className="mb-4">
                                Fale com o clube
                            </Badge>
                            <h2 className="font-display text-3xl font-bold tracking-tight text-cream-100">
                                Conte como voce quer ajudar. A conversa vem antes de qualquer combinacao.
                            </h2>
                            <p className="mt-4 text-base leading-8 text-cream-300">
                                O primeiro contato serve para entender a ideia, o momento do clube e o melhor formato para quem quer caminhar junto com o Resenha.
                            </p>
                            <div className="mt-6 grid gap-3">
                                {[
                                    "Nome, WhatsApp, tipo de apoio e como voce imagina ajudar.",
                                    "Empresa ou projeto, e-mail, cidade/regiao e mensagem ficam como campos opcionais.",
                                    "Sem compromisso: o retorno acontece pelo WhatsApp para conversar com calma."
                                ].map((item) => (
                                    <div key={item} className="flex gap-3 rounded-2xl border border-cream-100/8 bg-navy-950/50 p-4 text-sm leading-7 text-cream-300">
                                        <HeartHandshake className="mt-1 h-4 w-4 shrink-0 text-gold-400" aria-hidden="true" />
                                        <span>{item}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <LeadForm variant="support" source="support_page" />
                </section>

                <FaqBlock
                    items={supportFaqs}
                    title="Antes de apoiar, entenda o caminho certo"
                    description="Apoio ao clube e divulgacao comercial podem caminhar juntos, mas cada um tem uma intencao diferente."
                    source="support_page"
                    defaultOpenFirst
                    className="mt-12"
                />

                <section className="mt-12 overflow-hidden rounded-[2rem] border border-gold-400/20 bg-[linear-gradient(135deg,rgba(212,168,67,0.14),rgba(10,22,40,0.96)_42%,rgba(6,14,26,0.98))] px-6 py-8 sm:px-8 lg:px-10" aria-labelledby="support-final-cta-heading">
                    <div className="max-w-3xl">
                        <Badge variant="gold" className="mb-4">
                            Jogue junto
                        </Badge>
                        <h2 id="support-final-cta-heading" className="font-display text-3xl font-bold tracking-tight text-cream-100 sm:text-4xl">
                            O Resenha cresce quando a comunidade fortalece o clube.
                        </h2>
                        <p className="mt-4 text-base leading-8 text-cream-300">
                            Se voce quer apoiar estrutura, rotina, material, conteudo ou alguma necessidade do projeto, chame o Resenha e comece por uma conversa simples.
                        </p>
                        <div className="mt-7">
                            <Button asChild size="lg" className="w-full rounded-full sm:w-auto">
                                <Link
                                    href="#fale-sobre-apoio"
                                    data-monetization-event="cta_click"
                                    data-label="Conversar sobre apoio"
                                    data-journey="support"
                                    data-source="support_page_final_cta"
                                    data-destination="#fale-sobre-apoio"
                                >
                                    Conversar sobre apoio
                                    <HeartHandshake className="ml-2 h-4 w-4" aria-hidden="true" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                </section>
            </Container>
        </div>
    );
}
