import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db } from "@resenha/db";
import { premiumPartnerPages, sponsors } from "@resenha/db/schema";
import { Badge, Button, Card, CardContent, Container, shouldBypassNextImageOptimization } from "@resenha/ui";
import type { SponsorRelationshipType } from "@resenha/validators";
import { ArrowLeft, ArrowRight, ExternalLink, Handshake, Star } from "lucide-react";
import { DEFAULT_OG_IMAGE, createPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

const relationshipLabels: Record<SponsorRelationshipType, string> = {
    CLUB_SPONSOR: "Apoio ao clube",
    SITE_PARTNER: "Parceiro do site",
    SUPPORTER: "Apoiador",
    BOTH: "Clube e site"
};

async function getPremiumPartnerPage(slug: string) {
    let page: typeof premiumPartnerPages.$inferSelect | undefined;

    try {
        page = await db.query.premiumPartnerPages.findFirst({
            where: and(eq(premiumPartnerPages.slug, slug), eq(premiumPartnerPages.isActive, true))
        });
    } catch {
        return null;
    }

    if (!page) {
        return null;
    }

    let sponsor: typeof sponsors.$inferSelect | undefined | null = null;

    if (page.sponsorId) {
        try {
            sponsor = await db.query.sponsors.findFirst({
                where: eq(sponsors.id, page.sponsorId)
            });
        } catch {
            sponsor = null;
        }
    }

    return { page, sponsor };
}

export async function generateMetadata({
    params
}: {
    params: Promise<{ slug: string }>;
}): Promise<Metadata> {
    const { slug } = await params;
    const result = await getPremiumPartnerPage(slug);

    if (!result) {
        return createPageMetadata({
            title: "Parceiro nao encontrado",
            description: "A pagina de parceiro solicitada nao foi encontrada no Resenha RFC.",
            path: `/parceiros/${slug}`,
            noIndex: true
        });
    }

    return createPageMetadata({
        title: result.page.title,
        description: result.page.summary,
        path: `/parceiros/${result.page.slug}`,
        image: result.page.heroImageUrl || result.sponsor?.logoUrl || DEFAULT_OG_IMAGE,
        keywords: [result.page.partnerName, "parceiro premium", "Resenha RFC"]
    });
}

export default async function PremiumPartnerPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const result = await getPremiumPartnerPage(slug);

    if (!result) {
        notFound();
    }

    const { page, sponsor } = result;
    const paragraphs = page.body
        ? page.body.split(/\n{2,}/).map((paragraph) => paragraph.trim()).filter(Boolean)
        : [];
    const ctaHref = page.ctaHref ?? sponsor?.websiteUrl;
    const isExternalCta = ctaHref ? /^https?:\/\//.test(ctaHref) : false;

    return (
        <div className="min-h-screen bg-navy-950 py-16 lg:py-20">
            <Container>
                <Link href="/patrocinadores" className="inline-flex items-center text-sm font-medium text-blue-300 transition-colors hover:text-blue-200">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar para parceiros
                </Link>

                <section className="mt-8 overflow-hidden rounded-[2rem] border border-gold-400/20 bg-[radial-gradient(circle_at_top_left,_rgba(212,168,67,0.18),_transparent_34%),linear-gradient(180deg,rgba(10,22,40,0.98),rgba(6,14,26,1))] shadow-[0_28px_60px_rgba(0,0,0,0.24)]">
                    <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:p-10">
                        <div className="flex flex-col justify-center">
                            <Badge variant="gold" className="mb-5 w-fit">
                                Parceiro premium
                            </Badge>
                            <h1 className="font-display text-4xl font-bold tracking-tight text-cream-100 sm:text-5xl">
                                {page.title}
                            </h1>
                            <p className="mt-5 max-w-3xl text-base leading-8 text-cream-300 md:text-lg">
                                {page.summary}
                            </p>

                            <div className="mt-7 flex flex-wrap gap-3">
                                <Badge variant="outline" className="border-cream-100/10 bg-navy-950/40 text-cream-100">
                                    {page.partnerName}
                                </Badge>
                                {sponsor ? (
                                    <Badge variant="accent">
                                        {relationshipLabels[sponsor.relationshipType]}
                                    </Badge>
                                ) : null}
                            </div>

                            {ctaHref ? (
                                <div className="mt-8">
                                    <Button asChild size="lg" className="rounded-full">
                                        {isExternalCta ? (
                                            <a
                                                href={ctaHref}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                data-monetization-event="partner_logo_click"
                                                data-label={page.ctaLabel}
                                                data-partner-name={page.partnerName}
                                                data-source="premium_partner_page"
                                                data-destination={ctaHref}
                                            >
                                                {page.ctaLabel}
                                                <ExternalLink className="ml-2 h-4 w-4" aria-hidden="true" />
                                            </a>
                                        ) : (
                                            <Link
                                                href={ctaHref}
                                                data-monetization-event="cta_click"
                                                data-label={page.ctaLabel}
                                                data-journey="commercial"
                                                data-source="premium_partner_page"
                                                data-destination={ctaHref}
                                            >
                                                {page.ctaLabel}
                                                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                                            </Link>
                                        )}
                                    </Button>
                                </div>
                            ) : null}
                        </div>

                        <Card className="border-gold-400/20 bg-navy-950/60">
                            <CardContent className="p-5">
                                <div className="relative h-72 overflow-hidden rounded-[1.5rem] border border-cream-100/10 bg-[linear-gradient(140deg,rgba(255,255,255,0.98),rgba(241,245,249,0.92),rgba(226,232,240,0.86))]">
                                    {page.heroImageUrl || sponsor?.logoUrl ? (
                                        <Image
                                            src={page.heroImageUrl || sponsor?.logoUrl || DEFAULT_OG_IMAGE}
                                            alt={`Imagem de ${page.partnerName}`}
                                            fill
                                            sizes="(max-width: 768px) 100vw, 420px"
                                            unoptimized={shouldBypassNextImageOptimization(page.heroImageUrl || sponsor?.logoUrl || "")}
                                            className="object-contain p-8"
                                        />
                                    ) : (
                                        <div className="flex h-full flex-col justify-between bg-[linear-gradient(135deg,rgba(15,23,42,0.98),rgba(30,64,175,0.96))] p-6 text-white">
                                            <Star className="h-6 w-6 text-gold-300" aria-hidden="true" />
                                            <div>
                                                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/60">Resenha RFC</p>
                                                <p className="mt-3 font-display text-3xl font-bold">{page.partnerName}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </section>

                <section className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)]">
                    <Card className="border-navy-800 bg-navy-900/85">
                        <CardContent className="p-6 lg:p-8">
                            <Handshake className="h-6 w-6 text-gold-400" aria-hidden="true" />
                            <h2 className="mt-5 font-display text-3xl font-bold text-cream-100">
                                Parceria com contexto
                            </h2>
                            <p className="mt-4 text-sm leading-7 text-cream-300">
                                Este destaque existe para parceiros que justificam uma apresentacao maior, sem transformar a vitrine do Resenha em anuncio solto.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-navy-800 bg-navy-900/85">
                        <CardContent className="p-6 lg:p-8">
                            {paragraphs.length > 0 ? (
                                <div className="space-y-4 text-sm leading-7 text-cream-300">
                                    {paragraphs.map((paragraph) => (
                                        <p key={paragraph}>{paragraph}</p>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm leading-7 text-cream-300">
                                    {page.partnerName} aparece como parceiro em destaque do Resenha, com uma pagina propria para organizar apresentacao, contexto e contato oficial.
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </section>
            </Container>
        </div>
    );
}
