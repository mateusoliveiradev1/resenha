"use client";

import * as React from "react";
import { Badge, Button, DataTable, type Column } from "@resenha/ui";
import { updateLeadStatus } from "@/actions/leads";
import { leadStatusValues, type LeadJourney, type LeadStatus } from "@resenha/validators";
import { Loader2, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export interface AdminLead {
    id: string;
    journey: LeadJourney;
    source: string;
    status: LeadStatus;
    name: string;
    company: string | null;
    whatsapp: string;
    email: string | null;
    city: string | null;
    supportType: string | null;
    advertisingOption: string | null;
    message: string | null;
    createdAt: Date;
}

export interface AdminLeadFollowUp {
    id: string;
    name: string;
    channel: "whatsapp" | "email" | "crm";
    journey: LeadJourney | null;
    triggerStatus: LeadStatus;
    messageTemplate: string;
    destinationHint: string | null;
}

const statusLabels: Record<LeadStatus, string> = {
    NEW: "Novo",
    CONTACTED: "Contatado",
    QUALIFIED: "Qualificado",
    WON: "Ganho",
    LOST: "Perdido"
};

const statusTone: Record<LeadStatus, "accent" | "outline" | "warning" | "success" | "danger"> = {
    NEW: "accent",
    CONTACTED: "warning",
    QUALIFIED: "outline",
    WON: "success",
    LOST: "danger"
};

const journeyLabels: Record<LeadJourney, string> = {
    support: "Apoio",
    commercial: "Comercial"
};

function formatDate(value: Date) {
    return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit"
    }).format(value);
}

function getInterestLabel(lead: AdminLead) {
    return lead.advertisingOption ?? lead.supportType ?? "conversa inicial";
}

function fillTemplate(template: string, lead: AdminLead) {
    return template
        .replaceAll("{name}", lead.name)
        .replaceAll("{company}", lead.company ?? "sua empresa")
        .replaceAll("{journey}", journeyLabels[lead.journey].toLowerCase())
        .replaceAll("{status}", statusLabels[lead.status].toLowerCase())
        .replaceAll("{interest}", getInterestLabel(lead));
}

function getFollowUpForLead(lead: AdminLead, followUps: AdminLeadFollowUp[]) {
    const candidates = followUps.filter((followUp) =>
        followUp.channel === "whatsapp" &&
        followUp.triggerStatus === lead.status &&
        (!followUp.journey || followUp.journey === lead.journey)
    );

    return candidates.find((followUp) => followUp.journey === lead.journey) ?? candidates[0] ?? null;
}

function getWhatsappHref(lead: AdminLead, followUps: AdminLeadFollowUp[]) {
    const digits = lead.whatsapp.replace(/\D/g, "");
    const followUp = getFollowUpForLead(lead, followUps);
    const fallbackMessage = `Oi, ${lead.name}! Aqui e o Resenha. Recebemos seu interesse em ${getInterestLabel(lead)} e queremos conversar pelo WhatsApp.`;
    const message = fillTemplate(followUp?.messageTemplate ?? fallbackMessage, lead);

    return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

function StatusSelect({
    leadId,
    status,
    disabled,
    onChange
}: {
    leadId: string;
    status: LeadStatus;
    disabled: boolean;
    onChange: (id: string, status: LeadStatus) => void;
}) {
    return (
        <select
            value={status}
            disabled={disabled}
            onChange={(event) => onChange(leadId, event.target.value as LeadStatus)}
            aria-label="Status do lead"
            className="h-9 rounded-xl border border-navy-700 bg-navy-950 px-3 text-xs font-semibold text-cream-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
            {leadStatusValues.map((value) => (
                <option key={value} value={value}>
                    {statusLabels[value]}
                </option>
            ))}
        </select>
    );
}

export function LeadsTable({ data, followUps }: { data: AdminLead[]; followUps: AdminLeadFollowUp[] }) {
    const router = useRouter();
    const [pendingLeadId, setPendingLeadId] = React.useState<string | null>(null);

    const handleStatusChange = async (id: string, status: LeadStatus) => {
        setPendingLeadId(id);
        const result = await updateLeadStatus(id, status);
        setPendingLeadId(null);

        if (!result.success) {
            window.alert(result.error ?? "Nao foi possivel atualizar o lead.");
            return;
        }

        router.refresh();
    };

    const columns: Column<AdminLead>[] = [
        {
            header: "Lead",
            accessorKey: "name",
            sortable: true,
            cell: (item) => (
                <div className="max-w-[280px]">
                    <p className="truncate font-semibold text-cream-100">{item.name}</p>
                    <p className="mt-1 truncate text-xs text-cream-300">{item.company ?? item.email ?? item.whatsapp}</p>
                </div>
            )
        },
        {
            header: "Jornada",
            accessorKey: "journey",
            cell: (item) => <Badge variant={item.journey === "commercial" ? "gold" : "accent"}>{journeyLabels[item.journey]}</Badge>
        },
        {
            header: "Interesse",
            cell: (item) => (
                <span className="text-sm text-cream-300">
                    {item.advertisingOption ?? item.supportType ?? "Conversa inicial"}
                </span>
            )
        },
        {
            header: "Origem",
            accessorKey: "source",
            sortable: true,
            cell: (item) => <Badge variant="outline">{item.source}</Badge>
        },
        {
            header: "Status",
            accessorKey: "status",
            cell: (item) => (
                <div className="flex items-center gap-2">
                    <Badge variant={statusTone[item.status]}>{statusLabels[item.status]}</Badge>
                    <StatusSelect
                        leadId={item.id}
                        status={item.status}
                        disabled={pendingLeadId === item.id}
                        onChange={(id, status) => void handleStatusChange(id, status)}
                    />
                    {pendingLeadId === item.id ? <Loader2 className="h-4 w-4 animate-spin text-blue-300" /> : null}
                </div>
            )
        },
        {
            header: "Recebido",
            accessorKey: "createdAt",
            sortable: true,
            cell: (item) => <span className="text-sm text-cream-300">{formatDate(item.createdAt)}</span>
        },
        {
            header: "Follow-up",
            cell: (item) => (
                <Button asChild variant="outline" size="sm">
                    <a href={getWhatsappHref(item, followUps)} target="_blank" rel="noopener noreferrer">
                        WhatsApp
                    </a>
                </Button>
            )
        }
    ];

    if (data.length === 0) {
        return (
            <div className="rounded-xl border border-dashed border-navy-800 bg-navy-900/80 px-4 py-10 text-center">
                <MessageCircle className="mx-auto h-8 w-8 text-blue-300" />
                <p className="mt-3 font-semibold text-cream-100">Nenhum lead recebido ainda.</p>
                <p className="mt-1 text-sm text-cream-300">Os formularios de apoio e parceria vao aparecer aqui assim que forem enviados.</p>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-3 md:hidden">
                {data.map((item) => (
                    <div key={item.id} className="rounded-2xl border border-navy-800 bg-navy-950/70 p-4 shadow-sm">
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <p className="line-clamp-2 font-semibold text-cream-100">{item.name}</p>
                                <p className="mt-1 text-sm text-cream-300">{item.company ?? item.whatsapp}</p>
                            </div>
                            <Badge variant={item.journey === "commercial" ? "gold" : "accent"}>
                                {journeyLabels[item.journey]}
                            </Badge>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                            <Badge variant={statusTone[item.status]}>{statusLabels[item.status]}</Badge>
                            <Badge variant="outline">{item.source}</Badge>
                            <Badge variant="outline">{formatDate(item.createdAt)}</Badge>
                        </div>

                        <p className="mt-4 text-sm leading-6 text-cream-300">
                            {item.message ?? item.advertisingOption ?? item.supportType ?? "Lead sem mensagem adicional."}
                        </p>

                        <div className="mt-4 flex items-center gap-2">
                            <StatusSelect
                                leadId={item.id}
                                status={item.status}
                                disabled={pendingLeadId === item.id}
                                onChange={(id, status) => void handleStatusChange(id, status)}
                            />
                            <Button asChild variant="outline" className="flex-1">
                                <a href={getWhatsappHref(item, followUps)} target="_blank" rel="noopener noreferrer">
                                    WhatsApp
                                </a>
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="hidden md:block">
                <DataTable data={data} columns={columns} keyExtractor={(item) => item.id} />
            </div>
        </>
    );
}
