import Link from "next/link";
import { Badge, Button, Card, Container } from "@resenha/ui";
import type { SponsorTier } from "@resenha/validators";
import { ArrowRight, Handshake, HeartHandshake } from "lucide-react";
import { SponsorBrandTile } from "@/components/sponsors/SponsorBrandTile";
import { getSponsorPlacementLabel } from "@/components/sponsors/sponsorBrand";

interface SponsorMarqueeItem {
    id: string;
    name: string;
    logoUrl: string | null;
    websiteUrl: string | null;
    description: string | null;
    tier: SponsorTier;
}

const tierLabels: Record<SponsorTier, string> = {
    MASTER: "Master",
    OURO: "Ouro",
    PRATA: "Prata",
    APOIO: "Apoio"
};

export function SponsorsMarquee({ sponsors }: { sponsors: SponsorMarqueeItem[] }) {
    if (!sponsors.length) {
        return null;
    }

    const repeatedSponsors =
        sponsors.length >= 5
            ? [...sponsors, ...sponsors]
            : [...sponsors, ...sponsors, ...sponsors, ...sponsors];

    return (
        <section className="relative overflow-hidden bg-navy-950 py-16">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-400/40 to-transparent" />
            <div className="absolute left-1/2 top-1/2 h-[240px] w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold-400/6 blur-[120px] pointer-events-none" />

            <Container className="relative z-10">
                <Card className="overflow-hidden border-navy-800 bg-[linear-gradient(135deg,rgba(10,22,40,0.98),rgba(6,14,26,0.96))] p-6 md:p-8">
                    <div className="flex flex-col gap-6 border-b border-navy-800/80 pb-6 md:flex-row md:items-end md:justify-between">
                        <div className="max-w-2xl">
                            <Badge variant="accent" className="mb-4">
                                Vitrine de parceiros
                            </Badge>
                            <h2 className="font-display text-3xl font-bold tracking-tight text-cream-100 md:text-4xl">
                                Parceiros que fortalecem o Resenha
                            </h2>
                            <p className="mt-3 text-sm leading-relaxed text-cream-300 md:text-base">
                                Veja quem caminha com o clube. Para entrar junto, escolha entre apoiar a rotina esportiva do Resenha ou divulgar sua empresa em espacos combinados do site.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <Button asChild variant="outline">
                                <Link
                                    href="/patrocinadores"
                                    data-monetization-event="cta_click"
                                    data-label="Ver parceiros oficiais"
                                    data-journey="commercial"
                                    data-source="home_sponsor_marquee"
                                    data-destination="/patrocinadores"
                                >
                                    Ver parceiros oficiais
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                            <Button asChild variant="outline" className="border-gold-400/25 bg-gold-400/8 hover:bg-gold-400/12">
                                <Link
                                    href="/apoiar-o-resenha"
                                    data-monetization-event="cta_click"
                                    data-label="Apoiar o clube"
                                    data-journey="support"
                                    data-source="home_sponsor_marquee"
                                    data-destination="/apoiar-o-resenha"
                                >
                                    Apoiar o clube
                                    <HeartHandshake className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                            <Button asChild>
                                <Link
                                    href="/seja-parceiro"
                                    data-monetization-event="cta_click"
                                    data-label="Divulgar minha empresa"
                                    data-journey="commercial"
                                    data-source="home_sponsor_marquee"
                                    data-destination="/seja-parceiro"
                                >
                                    Divulgar minha empresa
                                    <Handshake className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                    </div>

                    <div className="relative mt-8 overflow-hidden">
                        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-navy-900 to-transparent" />
                        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-navy-900 to-transparent" />

                        <div className="sponsors-marquee-track flex w-max gap-5 [--marquee-duration:38s]">
                            {repeatedSponsors.map((sponsor, index) => (
                                <div
                                    key={`${sponsor.id}-${index}`}
                                    className="flex min-w-[268px] items-center gap-4 rounded-[24px] border border-navy-800/90 bg-[linear-gradient(145deg,rgba(6,14,26,0.96),rgba(10,22,40,0.92))] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                                >
                                    <SponsorBrandTile name={sponsor.name} logoUrl={sponsor.logoUrl} />

                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-semibold text-cream-100">{sponsor.name}</p>
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            <span className="rounded-full border border-gold-400/25 bg-gold-400/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-gold-300">
                                                {tierLabels[sponsor.tier]}
                                            </span>
                                            <span className="truncate rounded-full border border-blue-400/20 bg-blue-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-200">
                                                {getSponsorPlacementLabel(sponsor.description)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>
            </Container>
        </section>
    );
}
