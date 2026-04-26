import { Badge, Card } from "@resenha/ui";
import { db } from "@resenha/db";
import {
    commercialCampaignPackages,
    commercialOfferContents,
    copyCtaExperiments,
    editorialOfferings,
    leadFollowUpAutomations,
    monetizationEvents,
    monetizationLeads,
    premiumPartnerPages,
    sponsors
} from "@resenha/db/schema";
import { and, asc, count, desc, eq } from "drizzle-orm";
import { Flag, Megaphone, MousePointerClick, Target, TrendingUp } from "lucide-react";
import { CampaignPackagesSection, EditorialOfferingsSection, ExperimentsSection, FollowUpsSection, OffersSection, PremiumPagesSection } from "./_components/CommercialForms";
import { DashboardSection } from "./_components/DashboardSection";
import { ReportsSection } from "./_components/ReportsSection";
import { SectionNav } from "./_components/SectionNav";
import type { PartnerReport } from "./_components/types";

export const dynamic = "force-dynamic";

const minimumReliablePartnerClicks = 3;

function buildReliablePartnerReports(events: Array<typeof monetizationEvents.$inferSelect>): PartnerReport[] {
    const partnerReportMap = new Map<string, { clicks: number; sources: Set<string>; latest: Date; url?: string | null }>();

    events.forEach((event) => {
        if (!event.partnerName) {
            return;
        }

        const current = partnerReportMap.get(event.partnerName) ?? {
            clicks: 0,
            sources: new Set<string>(),
            latest: event.createdAt,
            url: event.url ?? event.destination
        };

        current.clicks += 1;

        if (event.source) {
            current.sources.add(event.source);
        }

        if (event.createdAt > current.latest) {
            current.latest = event.createdAt;
            current.url = event.url ?? event.destination ?? current.url;
        }

        partnerReportMap.set(event.partnerName, current);
    });

    return Array.from(partnerReportMap.entries())
        .map(([partnerName, report]) => ({ partnerName, ...report, sourceCount: report.sources.size }))
        .filter((report) => report.clicks >= minimumReliablePartnerClicks)
        .sort((left, right) => right.clicks - left.clicks)
        .slice(0, 6);
}

export default async function ComercialPage() {
    const [
        offers,
        offerings,
        followUps,
        campaigns,
        premiumPages,
        experiments,
        sponsorsList,
        [commercialLeadTotal],
        [wonCommercialLeadTotal],
        [partnerClickTotal],
        [activeSponsorTotal],
        partnerClickEvents
    ] = await Promise.all([
        db.query.commercialOfferContents.findMany({
            orderBy: [asc(commercialOfferContents.slot), asc(commercialOfferContents.displayOrder)]
        }),
        db.query.editorialOfferings.findMany({
            orderBy: [asc(editorialOfferings.displayOrder), asc(editorialOfferings.partnerName)]
        }),
        db.query.leadFollowUpAutomations.findMany({
            orderBy: [desc(leadFollowUpAutomations.isActive), asc(leadFollowUpAutomations.triggerStatus), asc(leadFollowUpAutomations.name)]
        }),
        db.query.commercialCampaignPackages.findMany({
            orderBy: [desc(commercialCampaignPackages.isActive), asc(commercialCampaignPackages.displayOrder), asc(commercialCampaignPackages.title)]
        }),
        db.query.premiumPartnerPages.findMany({
            orderBy: [desc(premiumPartnerPages.isActive), asc(premiumPartnerPages.displayOrder), asc(premiumPartnerPages.partnerName)]
        }),
        db.query.copyCtaExperiments.findMany({
            orderBy: [desc(copyCtaExperiments.isActive), asc(copyCtaExperiments.surface), asc(copyCtaExperiments.variantLabel)]
        }),
        db.query.sponsors.findMany({
            orderBy: [asc(sponsors.displayOrder), asc(sponsors.name)]
        }),
        db.select({ value: count() }).from(monetizationLeads).where(eq(monetizationLeads.journey, "commercial")),
        db.select({ value: count() }).from(monetizationLeads).where(and(eq(monetizationLeads.journey, "commercial"), eq(monetizationLeads.status, "WON"))),
        db.select({ value: count() }).from(monetizationEvents).where(eq(monetizationEvents.eventName, "partner_logo_click")),
        db.select({ value: count() }).from(sponsors).where(eq(sponsors.isActive, true)),
        db.query.monetizationEvents.findMany({
            where: eq(monetizationEvents.eventName, "partner_logo_click"),
            orderBy: [desc(monetizationEvents.createdAt)],
            limit: 200
        })
    ]);

    const conversionRate = commercialLeadTotal.value > 0
        ? Math.round((wonCommercialLeadTotal.value / commercialLeadTotal.value) * 100)
        : 0;
    const activeCampaigns = campaigns.filter((campaign) => campaign.isActive && campaign.status === "ACTIVE").length;
    const activePlacements =
        activeSponsorTotal.value +
        offerings.filter((offering) => offering.isActive).length +
        premiumPages.filter((page) => page.isActive).length +
        activeCampaigns;
    const dashboardCards = [
        { label: "Leads comerciais", value: commercialLeadTotal.value, helper: "Volume total capturado", icon: Target },
        { label: "Conversao ganha", value: `${conversionRate}%`, helper: `${wonCommercialLeadTotal.value} lead${wonCommercialLeadTotal.value === 1 ? "" : "s"} ganho${wonCommercialLeadTotal.value === 1 ? "" : "s"}`, icon: TrendingUp },
        { label: "Cliques em parceiros", value: partnerClickTotal.value, helper: "Eventos partner_logo_click", icon: MousePointerClick },
        { label: "Placements ativos", value: activePlacements, helper: "Parceiros, ofertas, paginas e campanhas", icon: Flag },
    ];
    const reliablePartnerReports = buildReliablePartnerReports(partnerClickEvents);

    return (
        <div className="space-y-8">
            <div>
                <Badge variant="gold">Comercial</Badge>
                <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-cream-100">
                    Operacao comercial
                </h1>
                <p className="mt-2 max-w-3xl text-sm text-cream-300">
                    Configure oferta, oferecimentos, follow-up, campanhas, paginas premium e experimentos de copy sem tirar o Resenha do eixo editorial.
                </p>
            </div>

            <Card className="overflow-hidden border-navy-800 bg-[linear-gradient(135deg,rgba(15,23,42,1),rgba(8,15,29,1))] p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-4">
                        <div className="rounded-md border border-gold-400/20 bg-gold-400/10 p-3 text-gold-300">
                            <Megaphone className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="font-display text-2xl text-cream-100">Conteudo comercial editavel</h2>
                            <p className="mt-2 text-sm text-cream-300">
                                Se nao houver registros ativos, o site usa a copy padrao definida na primeira fase.
                            </p>
                        </div>
                    </div>
                    <Badge variant="outline">{offers.length} formato{offers.length === 1 ? "" : "s"}</Badge>
                </div>
            </Card>

            <SectionNav />
            <DashboardSection cards={dashboardCards} />
            <ReportsSection reports={reliablePartnerReports} />
            <OffersSection offers={offers} />
            <EditorialOfferingsSection offerings={offerings} />
            <FollowUpsSection followUps={followUps} />
            <CampaignPackagesSection campaigns={campaigns} sponsorsList={sponsorsList} />
            <PremiumPagesSection premiumPages={premiumPages} sponsorsList={sponsorsList} />
            <ExperimentsSection experiments={experiments} />
        </div>
    );
}
