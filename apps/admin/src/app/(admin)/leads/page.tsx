import { Badge, Card } from "@resenha/ui";
import { db } from "@resenha/db";
import { leadFollowUpAutomations, monetizationEvents, monetizationLeads } from "@resenha/db/schema";
import { asc, count, desc, eq } from "drizzle-orm";
import { Inbox, LineChart, MessageCircle, MousePointerClick } from "lucide-react";
import { LeadsTable, type AdminLead } from "./LeadsTable";

export const dynamic = "force-dynamic";

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

export default async function LeadsPage() {
    const [leads, followUps, eventSummary, [totalLeads], [newLeads], [commercialLeads], [supportLeads]] = await Promise.all([
        db.query.monetizationLeads.findMany({
            orderBy: [desc(monetizationLeads.createdAt)]
        }),
        db.query.leadFollowUpAutomations.findMany({
            where: eq(leadFollowUpAutomations.isActive, true),
            orderBy: [desc(leadFollowUpAutomations.journey), asc(leadFollowUpAutomations.name)]
        }),
        db.select({
            eventName: monetizationEvents.eventName,
            source: monetizationEvents.source,
            total: count()
        })
            .from(monetizationEvents)
            .groupBy(monetizationEvents.eventName, monetizationEvents.source)
            .orderBy(desc(count())),
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
        advertisingOption: lead.advertisingOption,
        message: lead.message,
        createdAt: lead.createdAt
    }));

    const focusedEvents = eventSummary.filter((item) => item.eventName in eventLabels).slice(0, 12);

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

            <LeadsTable data={leadRows} followUps={followUps} />

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
