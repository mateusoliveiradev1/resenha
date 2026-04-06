import type { Metadata } from "next";
import Link from "next/link";
import { Badge, Button, Card, Container } from "@resenha/ui";
import { db } from "@resenha/db";
import { sponsors } from "@resenha/db/schema";
import { asc, eq } from "drizzle-orm";
import type { SponsorTier } from "@resenha/validators";
import { ArrowRight, Handshake, Star } from "lucide-react";
import { SponsorBrandTile } from "@/components/sponsors/SponsorBrandTile";
import { getSponsorPlacementLabel, getSponsorSupportCopy } from "@/components/sponsors/sponsorBrand";
import { createPageMetadata } from "@/lib/seo";

const tierOrder: SponsorTier[] = ["MASTER", "OURO", "PRATA", "APOIO"];
const tierLabels: Record<SponsorTier, string> = {
    MASTER: "Master",
    OURO: "Ouro",
    PRATA: "Prata",
    APOIO: "Apoio"
};
const tierDescriptions: Record<SponsorTier, string> = {
    MASTER: "Marcas com presenca premium ao lado da identidade principal do clube.",
    OURO: "Parcerias com forte visibilidade institucional e exposicao recorrente.",
    PRATA: "Apoios relevantes para fortalecer a estrutura e a experiencia do Resenha RFC.",
    APOIO: "Negocios e parceiros que caminham junto com o projeto desde a base."
};

export const dynamic = "force-dynamic";

export const metadata: Metadata = createPageMetadata({
    title: "Patrocinadores",
    description:
        "Veja os patrocinadores e parceiros oficiais do Resenha RFC e descubra como apoiar o clube com visibilidade institucional e presença de marca.",
    path: "/patrocinadores",
    keywords: ["patrocinadores", "parceiros oficiais", "apoio", "marca", "visibilidade"]
});

export default async function PatrocinadoresPage() {
    const sponsorList = await db.query.sponsors.findMany({
        where: eq(sponsors.isActive, true),
        orderBy: [asc(sponsors.displayOrder), asc(sponsors.name)]
    });

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
                            Parceiros oficiais
                        </Badge>
                        <h1 className="font-display text-4xl font-bold tracking-tight text-cream-100 sm:text-5xl md:text-6xl">
                            Patrocinadores que aceleram o nosso projeto
                        </h1>
                        <p className="mt-5 text-base leading-relaxed text-cream-300 md:text-lg">
                            O Resenha RFC foi fundado em 2023 e vem construindo uma identidade forte dentro e fora de quadra. Cada parceiro aqui ajuda a transformar presenca local em marca viva, torcida em comunidade e calendario em oportunidade real de exposicao.
                        </p>

                        <div className="mt-8 flex flex-wrap gap-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-cream-300">
                            <span className="rounded-full border border-navy-700 bg-navy-900/80 px-3 py-1.5">Home com destaque</span>
                            <span className="rounded-full border border-navy-700 bg-navy-900/80 px-3 py-1.5">Pagina institucional</span>
                            <span className="rounded-full border border-navy-700 bg-navy-900/80 px-3 py-1.5">Fundado em 2023</span>
                        </div>

                        <div className="mt-8 flex flex-wrap gap-3">
                            <Button asChild>
                                <Link href="/contato">
                                    Quero apoiar o Resenha
                                    <Handshake className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                            <Button asChild variant="outline">
                                <Link href="/">
                                    Voltar para a home
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>

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
                                                            {getSponsorPlacementLabel(sponsor.description)}
                                                        </span>
                                                    </div>
                                                    <p className="mt-2 text-sm leading-relaxed text-cream-300">
                                                        {getSponsorSupportCopy(sponsor.description)}
                                                    </p>
                                                </div>

                                                <div className="mt-5 flex items-center justify-between border-t border-navy-800 pt-4">
                                                    <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-blue-300">
                                                        {sponsor.websiteUrl ? "Visitar marca" : "Parceria confirmada"}
                                                    </span>
                                                    <ArrowRight className="h-4 w-4 text-blue-300 transition-transform group-hover:translate-x-1" />
                                                </div>
                                            </div>
                                        );

                                        return sponsor.websiteUrl ? (
                                            <Link
                                                key={sponsor.id}
                                                href={sponsor.websiteUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                {cardContent}
                                            </Link>
                                        ) : (
                                            <div key={sponsor.id}>{cardContent}</div>
                                        );
                                    })}
                                </div>
                            </Card>
                        ))
                    ) : (
                        <Card className="border-dashed border-navy-800 bg-navy-900/80 p-8 text-center">
                            <h2 className="font-display text-2xl text-cream-100">Espaco aberto para os primeiros parceiros</h2>
                            <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-cream-300">
                                A pagina de patrocinadores ja esta pronta para receber as logos e destacar as marcas na home. Assim que o primeiro parceiro entrar no admin, ele aparece aqui.
                            </p>
                            <div className="mt-6">
                                <Button asChild>
                                    <Link href="/contato">Quero ser o primeiro parceiro</Link>
                                </Button>
                            </div>
                        </Card>
                    )}
                </div>
            </Container>
        </div>
    );
}
