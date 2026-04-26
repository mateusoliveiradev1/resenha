import { Badge, Card } from "@resenha/ui";
import { db } from "@resenha/db";
import { leadFollowUpAutomations, monetizationEvents, monetizationLeads } from "@resenha/db/schema";
import { and, asc, count, desc, eq, gte, ilike, or, type SQL } from "drizzle-orm";
import { Inbox, LineChart, MessageCircle, MousePointerClick } from "lucide-react";
import { leadJourneyValues, leadStatusValues, type LeadJourney, type LeadStatus } from "@resenha/validators";
import { LeadsTable, type AdminLead, type LeadFilters, type LeadFilterPeriod } from "./LeadsTable";

export const dynamic = "force-dynamic";

type LeadsSearchParams = {
    status?: string | string[];
    journey?: string | string[];
    source?: string | string[];
    period?: string | string[];
    q?: string | string[];
};

const leadPeriods: Record<Exclude<LeadFilterPeriod, "all">, number> = {
    "7d": 7,
    "30d": 30,
    "90d": 90
};

const eventLabels: Record<string, string> = {
    monetization_cta_click: "Cliques em CTA",
    partner_logo_click: "Cliques em parceiros",
    plan_cta_click: "Cliques em ofertas",
    support_form_success: "Forms de apoio",
    partner_form_success: "Forms comerciais"
};

function getEventLabel(eventName: string) {
    return eventLabels[eventName] ?? eventName;
}

function getSearchValue(value: string | string[] | undefined) {
    if (Array.isArray(value)) {
        return value[0] ?? "";
    }

    return value ?? "";
}

function parseLeadFilters(params: LeadsSearchParams): LeadFilters {
    const statusParam = getSearchValue(params.status);
    const journeyParam = getSearchValue(params.journey);
    const periodParam = getSearchValue(params.period);
    const sourceParam = getSearchValue(params.source).trim();
    const q = getSearchValue(params.q).trim().slice(0, 120);
    const status = leadStatusValues.includes(statusParam as LeadStatus) ? statusParam as LeadStatus : "all";
    const journey = leadJourneyValues.includes(journeyParam as LeadJourney) ? journeyParam as LeadJourney : "all";
    const period = periodParam in leadPeriods ? periodParam as LeadFilterPeriod : "all";
    const source = sourceParam && sourceParam !== "all" ? sourceParam.slice(0, 120) : "all";

    return { status, journey, source, period, q };
}

function getLeadWhere(filters: LeadFilters) {
    const conditions: SQL[] = [];

    if (filters.status !== "all") {
        conditions.push(eq(monetizationLeads.status, filters.status));
    }

    if (filters.journey !== "all") {
        conditions.push(eq(monetizationLeads.journey, filters.journey));
    }

    if (filters.source !== "all") {
        conditions.push(eq(monetizationLeads.source, filters.source));
    }

    if (filters.period !== "all") {
        const startsAt = new Date();
        startsAt.setDate(startsAt.getDate() - leadPeriods[filters.period]);
        conditions.push(gte(monetizationLeads.createdAt, startsAt));
    }

    if (filters.q) {
        const pattern = `%${filters.q}%`;
        const searchCondition = or(
            ilike(monetizationLeads.name, pattern),
            ilike(monetizationLeads.company, pattern),
            ilike(monetizationLeads.whatsapp, pattern),
            ilike(monetizationLeads.email, pattern)
        );

        if (searchCondition) {
            conditions.push(searchCondition);
        }
    }

    return conditions.length > 0 ? and(...conditions) : undefined;
}

function getFilteredLeads(whereClause: SQL | undefined) {
    if (whereClause) {
        return db.select().from(monetizationLeads).where(whereClause).orderBy(desc(monetizationLeads.createdAt));
    }

    return db.select().from(monetizationLeads).orderBy(desc(monetizationLeads.createdAt));
}

function getFilteredCount(whereClause: SQL | undefined) {
    if (whereClause) {
        return db.select({ value: count() }).from(monetizationLeads).where(whereClause);
    }

    return db.select({ value: count() }).from(monetizationLeads);
}

export default async function LeadsPage({
    searchParams
}: {
    searchParams: Promise<LeadsSearchParams>;
}) {
    const filters = parseLeadFilters(await searchParams);
    const whereClause = getLeadWhere(filters);
    const [
        leads,
        followUps,
        sourceRows,
        eventSummary,
        [filteredLeads],
        [totalLeads],
        [newLeads],
        [commercialLeads],
        [supportLeads]
    ] = await Promise.all([
        getFilteredLeads(whereClause),
        db.query.leadFollowUpAutomations.findMany({
            where: eq(leadFollowUpAutomations.isActive, true),
            orderBy: [asc(leadFollowUpAutomations.journey), asc(leadFollowUpAutomations.triggerStatus), asc(leadFollowUpAutomations.name)]
        }),
        db.selectDistinct({ value: monetizationLeads.source })
            .from(monetizationLeads)
            .orderBy(asc(monetizationLeads.source)),
        db.select({
            eventName: monetizationEvents.eventName,
            source: monetizationEvents.source,
            total: count()
        })
            .from(monetizationEvents)
            .groupBy(monetizationEvents.eventName, monetizationEvents.source)
            .orderBy(desc(count())),
        getFilteredCount(whereClause),
        db.select({ value: count() }).from(monetizationLeads),
        db.select({ value: count() }).from(monetizationLeads).where(eq(monetizationLeads.status, "NEW")),
        db.select({ value: count() }).from(monetizationLeads).where(eq(monetizationLeads.journey, "commercial")),
        db.select({ value: count() }).from(monetizationLeads).where(eq(monetizationLeads.journey, "support")),
    ]);

    const leadRows: AdminLead[] = leads.map((lead) => ({
        id: lead.id,
        journey: lead.journey,
        source: lead.source,
        status: lead.status,
        name: lead.name,
        company: lead.company,
        whatsapp: lead.whatsapp,
        email: lead.email,
        city: lead.city,
        supportType: lead.supportType,
        supportDescription: lead.supportDescription,
        advertisingOption: lead.advertisingOption,
        businessType: lead.businessType,
        instagramOrSite: lead.instagramOrSite,
        message: lead.message,
        rawPayload: lead.rawPayload ?? null,
        createdAt: lead.createdAt,
        updatedAt: lead.updatedAt
    }));

    const focusedEvents = eventSummary.filter((item) => item.eventName in eventLabels).slice(0, 12);
    const sourceOptions = sourceRows
        .map((row) => row.value)
        .filter((source): source is string => Boolean(source));

    const statCards = [
        { label: "Leads totais", value: totalLeads.value, icon: Inbox },
        { label: "Novos", value: newLeads.value, icon: MessageCircle },
        { label: "Comerciais", value: commercialLeads.value, icon: MousePointerClick },
        { label: "Apoio", value: supportLeads.value, icon: LineChart },
    ];

    return (
        <div className="space-y-6">
            <div>
                <Badge variant="accent">Fase 2</Badge>
                <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-cream-100">
                    Leads e conversoes
                </h1>
                <p className="mt-2 max-w-3xl text-sm text-cream-300">
                    Acompanhe contatos de apoio e parceria, avance o status comercial e veja quais origens geram cliques ou conversoes.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {statCards.map((item) => {
                    const Icon = item.icon;

                    return (
                        <Card key={item.label} className="border-navy-800 bg-navy-900/90 p-5">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-sm text-cream-300">{item.label}</p>
                                    <p className="mt-3 font-display text-3xl text-cream-100">{item.value}</p>
                                </div>
                                <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-3 text-blue-300">
                                    <Icon className="h-5 w-5" />
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>

            <LeadsTable
                data={leadRows}
                followUps={followUps}
                filters={filters}
                sourceOptions={sourceOptions}
                filteredCount={filteredLeads.value}
                totalCount={totalLeads.value}
            />

            <Card className="border-navy-800 bg-navy-900/90 p-6">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-400">
                            Relatorio comercial
                        </p>
                        <h2 className="mt-2 font-display text-2xl text-cream-100">
                            Cliques em parceiros e conversoes por origem
                        </h2>
                    </div>
                    <Badge variant="outline">Eventos persistidos</Badge>
                </div>

                {focusedEvents.length > 0 ? (
                    <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                        {focusedEvents.map((item) => (
                            <div key={`${item.eventName}-${item.source ?? "sem-origem"}`} className="rounded-2xl border border-navy-800 bg-navy-950/70 p-4">
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-300">
                                    {getEventLabel(item.eventName)}
                                </p>
                                <p className="mt-3 font-display text-3xl text-cream-100">{item.total}</p>
                                <p className="mt-2 text-sm text-cream-300">
                                    Origem: {item.source ?? "sem origem"}
                                </p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="mt-6 rounded-2xl border border-dashed border-navy-800 bg-navy-950/70 px-4 py-8 text-center text-sm text-cream-300">
                        Nenhum clique ou envio registrado ainda para relatorio.
                    </div>
                )}
            </Card>
        </div>
    );
}
