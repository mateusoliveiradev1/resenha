import type { Metadata } from "next";
import Link from "next/link";
import { Badge, Button, Card, Container } from "@resenha/ui";
import { db } from "@resenha/db";
import { premiumPartnerPages, sponsors } from "@resenha/db/schema";
import { asc, eq } from "drizzle-orm";
import type { SponsorRelationshipType, SponsorTier } from "@resenha/validators";
import { ArrowRight, Handshake, HeartHandshake, Star } from "lucide-react";
import { SponsorBrandTile } from "@/components/sponsors/SponsorBrandTile";
import { getSponsorSupportCopy } from "@/components/sponsors/sponsorBrand";
import { createPageMetadata } from "@/lib/seo";

const tierOrder: SponsorTier[] = ["MASTER", "OURO", "PRATA", "APOIO"];
const tierLabels: Record<SponsorTier, string> = {
    MASTER: "Master",
    OURO: "Ouro",
    PRATA: "Prata",
    APOIO: "Apoio"
};
const tierDescriptions: Record<SponsorTier, string> = {
    MASTER: "Marcas com presenca premium na vitrine oficial, podendo unir apoio ao clube e destaque comercial combinado.",
    OURO: "Parcerias com forte presenca institucional e possibilidade de aparecer em espacos da cobertura.",
    PRATA: "Apoios relevantes para fortalecer a estrutura, a experiencia e a comunicacao do Resenha RFC.",
    APOIO: "Negocios, apoiadores e parceiros locais que caminham junto com o projeto desde a base."
};
const tierRelationshipBadges: Record<SponsorTier, string[]> = {
    MASTER: ["Apoio ao clube", "Destaque comercial"],
    OURO: ["Apoio institucional", "Parceiro da cobertura"],
    PRATA: ["Apoio ao projeto", "Presenca no site"],
    APOIO: ["Apoiador", "Comercio local"]
};

const relationshipLabels: Record<SponsorRelationshipType, string> = {
    CLUB_SPONSOR: "Apoio ao clube",
    SITE_PARTNER: "Parceiro do site",
    SUPPORTER: "Apoiador",
    BOTH: "Clube e site"
};

const relationshipCopy: Record<SponsorRelationshipType, string> = {
    CLUB_SPONSOR: "Relacao voltada ao fortalecimento do clube, da estrutura e da rotina esportiva.",
    SITE_PARTNER: "Relacao comercial de presenca no site, em vitrine ou em espacos combinados da cobertura.",
    SUPPORTER: "Apoio flexivel de pessoa, projeto ou negocio local que caminha junto com o Resenha.",
    BOTH: "Relacao que pode unir apoio institucional ao clube e presenca comercial no site."
};

const sponsorJourneyCards = [
    {
        title: "Apoiar o time",
        description: "Para quem quer fortalecer campo, quadra, materiais, calendario e a continuidade do projeto esportivo.",
        href: "/apoiar-o-resenha",
        cta: "Ver formas de apoio",
        badge: "Apoio ao clube",
        icon: HeartHandshake
    },
    {
        title: "Divulgar minha marca",
        description: "Para empresas que querem aparecer no site, nas materias, em conteudos de rodada ou na pagina de parceiros.",
        href: "/seja-parceiro",
        cta: "Ver como funciona",
        badge: "Parceria comercial",
        icon: Handshake
    }
];

export const dynamic = "force-dynamic";

export const metadata: Metadata = createPageMetadata({
    title: "Patrocinadores e parceiros",
    description:
        "Veja marcas que fortalecem o Resenha RFC e escolha entre apoiar o clube ou divulgar sua empresa no site.",
    path: "/patrocinadores",
    keywords: ["patrocinadores", "parceiros oficiais", "apoio ao clube", "parceria comercial", "Resenha RFC"]
});

async function getActivePremiumPages() {
    try {
        return await db.query.premiumPartnerPages.findMany({
            where: eq(premiumPartnerPages.isActive, true),
            orderBy: [asc(premiumPartnerPages.displayOrder), asc(premiumPartnerPages.partnerName)]
        });
    } catch {
        return [];
    }
}

async function getActiveSponsors() {
    try {
        return await db.query.sponsors.findMany({
            where: eq(sponsors.isActive, true),
            orderBy: [asc(sponsors.displayOrder), asc(sponsors.name)]
        });
    } catch {
        return [];
    }
}

export default async function PatrocinadoresPage() {
    const [sponsorList, premiumPages] = await Promise.all([
        getActiveSponsors(),
        getActivePremiumPages()
    ]);
    const premiumPageBySponsor = new Map(premiumPages.filter((page) => page.sponsorId).map((page) => [page.sponsorId, page]));
    const premiumPageByPartnerName = new Map(premiumPages.map((page) => [page.partnerName.toLowerCase(), page]));

    const groupedSponsors = tierOrder
        .map((tier) => ({
            tier,
            label: tierLabels[tier],
            description: tierDescriptions[tier],
            sponsors: sponsorList.filter((sponsor) => sponsor.tier === tier)
        }))
        .filter((group) => group.sponsors.length > 0);

    return (
        <div className="min-h-screen bg-navy-950 py-20">
            <Container>
                <div className="relative overflow-hidden rounded-[32px] border border-navy-800 bg-[linear-gradient(135deg,rgba(10,22,40,0.98),rgba(6,14,26,0.96))] px-6 py-8 md:px-10 md:py-12">
                    <div className="absolute left-1/2 top-0 h-[1px] w-full max-w-4xl -translate-x-1/2 bg-gradient-to-r from-transparent via-gold-400/50 to-transparent" />
                    <div className="absolute left-1/2 top-1/3 h-[260px] w-[780px] -translate-x-1/2 rounded-full bg-blue-600/8 blur-[140px] pointer-events-none" />

                    <div className="relative z-10 max-w-3xl">
                        <Badge variant="gold" className="mb-5">
                            Vitrine oficial
                        </Badge>
                        <h1 className="font-display text-4xl font-bold tracking-tight text-cream-100 sm:text-5xl md:text-6xl">
                            Parceiros que fortalecem o Resenha.
                        </h1>
                        <p className="mt-5 text-base leading-relaxed text-cream-300 md:text-lg">
                            Esta e a vitrine de marcas, apoiadores e negocios que caminham com o clube. Alguns fortalecem a rotina esportiva; outros aparecem na cobertura e nos espacos do site; muitos podem fazer as duas coisas de forma combinada.
                        </p>

                        <div className="mt-8 flex flex-wrap gap-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-cream-300">
                            <span className="rounded-full border border-navy-700 bg-navy-900/80 px-3 py-1.5">Apoio ao clube</span>
                            <span className="rounded-full border border-navy-700 bg-navy-900/80 px-3 py-1.5">Parceria comercial</span>
                            <span className="rounded-full border border-navy-700 bg-navy-900/80 px-3 py-1.5">Fundado em 2023</span>
                        </div>

                        <div className="mt-8 flex flex-wrap gap-3">
                            <Button asChild>
                                <Link
                                    href="/apoiar-o-resenha"
                                    data-monetization-event="cta_click"
                                    data-label="Apoiar o time"
                                    data-journey="support"
                                    data-source="sponsors_page_hero"
                                    data-destination="/apoiar-o-resenha"
                                >
                                    Apoiar o time
                                    <HeartHandshake className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                            <Button asChild variant="outline">
                                <Link
                                    href="/seja-parceiro"
                                    data-monetization-event="cta_click"
                                    data-label="Divulgar minha marca"
                                    data-journey="commercial"
                                    data-source="sponsors_page_hero"
                                    data-destination="/seja-parceiro"
                                >
                                    Divulgar minha marca
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>

                <section className="mt-8 grid gap-4 md:grid-cols-2" aria-label="Escolha sua forma de parceria">
                    {sponsorJourneyCards.map((card) => {
                        const Icon = card.icon;

                        return (
                            <Card key={card.title} className="group border-navy-800 bg-navy-900/85 p-6 transition-all hover:-translate-y-1 hover:border-blue-500/30 hover:shadow-[0_18px_40px_rgba(37,99,235,0.12)]">
                                <div className="flex items-start gap-4">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-blue-400/20 bg-blue-500/10 text-blue-300">
                                        <Icon className="h-5 w-5" aria-hidden="true" />
                                    </div>
                                    <div>
                                        <Badge variant="outline" className="border-cream-100/10 bg-navy-950/50 text-cream-100">
                                            {card.badge}
                                        </Badge>
                                        <h2 className="mt-4 font-display text-2xl font-bold text-cream-100">
                                            {card.title}
                                        </h2>
                                        <p className="mt-3 text-sm leading-7 text-cream-300">
                                            {card.description}
                                        </p>
                                    </div>
                                </div>
                                <Button asChild variant={card.href === "/seja-parceiro" ? "primary" : "outline"} className="mt-6 w-full rounded-full sm:w-auto">
                                    <Link
                                        href={card.href}
                                        data-monetization-event="cta_click"
                                        data-label={card.cta}
                                        data-journey={card.href === "/seja-parceiro" ? "commercial" : "support"}
                                        data-source="sponsors_page_journey_cards"
                                        data-destination={card.href}
                                    >
                                        {card.cta}
                                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </Link>
                                </Button>
                            </Card>
                        );
                    })}
                </section>

                <div className="mt-12 space-y-8">
                    {groupedSponsors.length > 0 ? (
                        groupedSponsors.map((group) => (
                            <Card key={group.tier} className="border-navy-800 bg-navy-900/90 p-6 md:p-8">
                                <div className="flex flex-col gap-4 border-b border-navy-800/80 pb-5 md:flex-row md:items-end md:justify-between">
                                    <div>
                                        <div className="mb-3 flex items-center gap-2">
                                            <Star className="h-4 w-4 text-gold-400" />
                                            <span className="text-xs font-semibold uppercase tracking-[0.24em] text-gold-400">
                                                {group.label}
                                            </span>
                                        </div>
                                        <h2 className="font-display text-2xl font-bold text-cream-100 md:text-3xl">
                                            Cota {group.label}
                                        </h2>
                                        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-cream-300">
                                            {group.description}
                                        </p>
                                        <div className="mt-4 flex flex-wrap gap-2">
                                            {tierRelationshipBadges[group.tier].map((label) => (
                                                <span
                                                    key={label}
                                                    className="rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-200"
                                                >
                                                    {label}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <Badge variant={group.tier === "MASTER" ? "gold" : group.tier === "OURO" ? "accent" : "outline"}>
                                        {group.sponsors.length} parceiro{group.sponsors.length > 1 ? "s" : ""}
                                    </Badge>
                                </div>

                                <div
                                    className={`mt-6 grid gap-4 ${
                                        group.sponsors.length === 1
                                            ? "grid-cols-1"
                                            : "grid-cols-1 md:grid-cols-2 xl:grid-cols-2"
                                    }`}
                                >
                                    {group.sponsors.map((sponsor) => {
                                        const premiumPage =
                                            premiumPageBySponsor.get(sponsor.id) ??
                                            premiumPageByPartnerName.get(sponsor.name.toLowerCase());
                                        const destination = premiumPage ? `/parceiros/${premiumPage.slug}` : sponsor.websiteUrl;
                                        const isExternalDestination = destination ? /^https?:\/\//.test(destination) : false;
                                        const cardContent = (
                                            <div
                                                className={`group flex h-full flex-col rounded-[26px] border bg-navy-950/80 p-5 transition-all duration-300 hover:-translate-y-1 ${
                                                    sponsor.tier === "MASTER"
                                                        ? "border-gold-400/25 hover:border-gold-300/40 hover:shadow-[0_20px_42px_rgba(250,204,21,0.14)]"
                                                        : "border-navy-800 hover:border-blue-500/30 hover:shadow-[0_18px_40px_rgba(37,99,235,0.12)]"
                                                }`}
                                            >
                                                <SponsorBrandTile
                                                    name={sponsor.name}
                                                    logoUrl={sponsor.logoUrl}
                                                    variant="feature"
                                                />

                                                <div className="mt-5 flex-1">
                                                    <p className="text-lg font-semibold text-cream-100">{sponsor.name}</p>
                                                    <div className="mt-3 flex flex-wrap gap-2">
                                                        <span className="rounded-full border border-gold-400/20 bg-gold-400/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-gold-300">
                                                            {tierLabels[sponsor.tier]}
                                                        </span>
                                                        <span className="rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-200">
                                                            {relationshipLabels[sponsor.relationshipType]}
                                                        </span>
                                                    </div>
                                                    <p className="mt-2 text-sm leading-relaxed text-cream-300">
                                                        {getSponsorSupportCopy(sponsor.description)}
                                                    </p>
                                                    <p className="mt-3 text-xs leading-6 text-cream-300/65">
                                                        {relationshipCopy[sponsor.relationshipType]}
                                                    </p>
                                                </div>

                                                <div className="mt-5 flex items-center justify-between border-t border-navy-800 pt-4">
                                                    <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-blue-300">
                                                        {premiumPage ? "Ver destaque" : sponsor.websiteUrl ? "Visitar marca" : "Parceria confirmada"}
                                                    </span>
                                                    <ArrowRight className="h-4 w-4 text-blue-300 transition-transform group-hover:translate-x-1" />
                                                </div>
                                            </div>
                                        );

                                        if (!destination) {
                                            return (
                                                <div key={sponsor.id}>{cardContent}</div>
                                            );
                                        }

                                        return (
                                            <Link
                                                key={sponsor.id}
                                                href={destination}
                                                target={isExternalDestination ? "_blank" : undefined}
                                                rel={isExternalDestination ? "noopener noreferrer" : undefined}
                                                data-monetization-event="partner_logo_click"
                                                data-label={premiumPage ? "Ver destaque" : "Visitar marca"}
                                                data-partner-name={sponsor.name}
                                                data-source="sponsors_page"
                                                data-destination={destination}
                                            >
                                                {cardContent}
                                            </Link>
                                        );
                                    })}
                                </div>
                            </Card>
                        ))
                    ) : (
                        <Card className="border-dashed border-navy-800 bg-navy-900/80 p-8 text-center">
                            <h2 className="font-display text-2xl text-cream-100">Espaco aberto para os primeiros parceiros do Resenha</h2>
                            <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-cream-300">
                                A vitrine ja esta pronta para receber marcas que queiram fortalecer o clube ou aparecer na cobertura do Resenha.
                            </p>
                            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                                <Button asChild variant="outline">
                                    <Link
                                        href="/apoiar-o-resenha"
                                        data-monetization-event="cta_click"
                                        data-label="Apoiar o time"
                                        data-journey="support"
                                        data-source="sponsors_page_empty_state"
                                        data-destination="/apoiar-o-resenha"
                                    >
                                        Apoiar o time
                                    </Link>
                                </Button>
                                <Button asChild>
                                    <Link
                                        href="/seja-parceiro"
                                        data-monetization-event="cta_click"
                                        data-label="Divulgar minha marca"
                                        data-journey="commercial"
                                        data-source="sponsors_page_empty_state"
                                        data-destination="/seja-parceiro"
                                    >
                                        Divulgar minha marca
                                    </Link>
                                </Button>
                            </div>
                        </Card>
                    )}
                </div>
            </Container>
        </div>
    );
}
