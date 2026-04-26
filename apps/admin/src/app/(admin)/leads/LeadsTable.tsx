"use client";

import * as React from "react";
import { Badge, Button, DataTable, Input, Modal, type Column } from "@resenha/ui";
import { updateLeadStatus } from "@/actions/leads";
import {
    leadStatusValues,
    type LeadJourney,
    type LeadStatus
} from "@resenha/validators";
import {
    AlertCircle,
    CheckCircle2,
    Eye,
    Loader2,
    MessageCircle,
    RotateCcw,
    Search
} from "lucide-react";
import { useRouter } from "next/navigation";

export type LeadFilterPeriod = "all" | "7d" | "30d" | "90d";

export interface LeadFilters {
    status: LeadStatus | "all";
    journey: LeadJourney | "all";
    source: string;
    period: LeadFilterPeriod;
    q: string;
}

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
    supportDescription: string | null;
    advertisingOption: string | null;
    businessType: string | null;
    instagramOrSite: string | null;
    message: string | null;
    rawPayload: Record<string, unknown> | null;
    createdAt: Date;
    updatedAt: Date;
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

const selectClassName = "h-10 rounded-md border border-navy-800 bg-navy-900 px-3 py-2 text-sm text-cream-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500";

function formatDate(value: Date) {
    return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit"
    }).format(value);
}

function formatFullDate(value: Date) {
    return new Intl.DateTimeFormat("pt-BR", {
        dateStyle: "short",
        timeStyle: "short"
    }).format(value);
}

function getInterestLabel(lead: AdminLead) {
    return lead.advertisingOption ?? lead.supportType ?? "conversa inicial";
}

function normalizeWhatsappDigits(value: string) {
    const digits = value.replace(/\D/g, "");

    if (digits.length === 10 || digits.length === 11) {
        return `55${digits}`;
    }

    return digits;
}

function getFallbackMessage(lead: AdminLead) {
    if (lead.journey === "commercial") {
        return `Oi, ${lead.name}! Aqui e o Resenha RFC. Recebemos o interesse ${lead.company ? `da ${lead.company}` : "comercial"} em ${getInterestLabel(lead)} e queremos combinar os proximos passos.`;
    }

    return `Oi, ${lead.name}! Aqui e o Resenha RFC. Recebemos seu contato sobre ${getInterestLabel(lead)} e queremos conversar pelo WhatsApp.`;
}

function fillTemplate(template: string, lead: AdminLead) {
    return template
        .replaceAll("{name}", lead.name)
        .replaceAll("{company}", lead.company ?? "sua empresa")
        .replaceAll("{journey}", journeyLabels[lead.journey].toLowerCase())
        .replaceAll("{status}", statusLabels[lead.status].toLowerCase())
        .replaceAll("{interest}", getInterestLabel(lead))
        .replaceAll("{city}", lead.city ?? "")
        .replaceAll("{email}", lead.email ?? "")
        .replaceAll("{phone}", lead.whatsapp)
        .replaceAll("{whatsapp}", lead.whatsapp)
        .replaceAll("{source}", lead.source)
        .replaceAll("{businessType}", lead.businessType ?? "")
        .replaceAll("{business_type}", lead.businessType ?? "")
        .replaceAll("{message}", lead.message ?? "");
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
    const digits = normalizeWhatsappDigits(lead.whatsapp);

    if (digits.length < 10) {
        return null;
    }

    const followUp = getFollowUpForLead(lead, followUps);
    const message = fillTemplate(followUp?.messageTemplate ?? getFallbackMessage(lead), lead);

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
            className="h-9 rounded-md border border-navy-700 bg-navy-950 px-3 text-xs font-semibold text-cream-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
            {leadStatusValues.map((value) => (
                <option key={value} value={value}>
                    {statusLabels[value]}
                </option>
            ))}
        </select>
    );
}

function LeadFiltersForm({
    filters,
    sourceOptions,
    filteredCount,
    totalCount
}: {
    filters: LeadFilters;
    sourceOptions: string[];
    filteredCount: number;
    totalCount: number;
}) {
    const hasActiveFilters = hasFilters(filters);
    const sources = filters.source !== "all" && !sourceOptions.includes(filters.source)
        ? [filters.source, ...sourceOptions]
        : sourceOptions;

    return (
        <div className="rounded-xl border border-navy-800 bg-navy-900/90 p-4">
            <form action="/leads" className="grid gap-3 lg:grid-cols-[minmax(220px,1.4fr)_repeat(4,minmax(130px,1fr))_auto]">
                <label className="space-y-1 text-sm text-cream-300">
                    Busca
                    <div className="relative">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-300" />
                        <Input
                            name="q"
                            defaultValue={filters.q}
                            placeholder="Nome, empresa, email ou WhatsApp"
                            autoComplete="off"
                            className="pl-9"
                        />
                    </div>
                </label>

                <label className="space-y-1 text-sm text-cream-300">
                    Status
                    <select name="status" defaultValue={filters.status} className={selectClassName}>
                        <option value="all">Todos</option>
                        {leadStatusValues.map((status) => (
                            <option key={status} value={status}>
                                {statusLabels[status]}
                            </option>
                        ))}
                    </select>
                </label>

                <label className="space-y-1 text-sm text-cream-300">
                    Jornada
                    <select name="journey" defaultValue={filters.journey} className={selectClassName}>
                        <option value="all">Todas</option>
                        <option value="commercial">{journeyLabels.commercial}</option>
                        <option value="support">{journeyLabels.support}</option>
                    </select>
                </label>

                <label className="space-y-1 text-sm text-cream-300">
                    Origem
                    <select name="source" defaultValue={filters.source} className={selectClassName}>
                        <option value="all">Todas</option>
                        {sources.map((source) => (
                            <option key={source} value={source}>
                                {source}
                            </option>
                        ))}
                    </select>
                </label>

                <label className="space-y-1 text-sm text-cream-300">
                    Periodo
                    <select name="period" defaultValue={filters.period} className={selectClassName}>
                        <option value="all">Todo periodo</option>
                        <option value="7d">7 dias</option>
                        <option value="30d">30 dias</option>
                        <option value="90d">90 dias</option>
                    </select>
                </label>

                <div className="flex flex-col gap-2 lg:pt-6">
                    <Button type="submit" size="sm">
                        <Search className="mr-2 h-4 w-4" />
                        Filtrar
                    </Button>
                    {hasActiveFilters ? (
                        <Button asChild variant="outline" size="sm">
                            <a href="/leads">
                                <RotateCcw className="mr-2 h-4 w-4" />
                                Limpar
                            </a>
                        </Button>
                    ) : null}
                </div>
            </form>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm text-cream-300">
                <span>{filteredCount} de {totalCount} leads exibidos</span>
                {hasActiveFilters ? <Badge variant="outline">Filtros ativos</Badge> : null}
            </div>
        </div>
    );
}

function hasFilters(filters: LeadFilters) {
    return Boolean(
        filters.q ||
        filters.status !== "all" ||
        filters.journey !== "all" ||
        filters.source !== "all" ||
        filters.period !== "all"
    );
}

function StatusFeedback({
    feedback,
    leadId
}: {
    feedback: { type: "success" | "error"; leadId: string; message: string } | null;
    leadId?: string;
}) {
    if (!feedback || (leadId && feedback.leadId !== leadId)) {
        return null;
    }

    const Icon = feedback.type === "success" ? CheckCircle2 : AlertCircle;
    const colorClass = feedback.type === "success"
        ? "border-green-500/30 bg-green-500/10 text-green-300"
        : "border-red-500/30 bg-red-500/10 text-red-300";

    return (
        <div className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm ${colorClass}`} role="status" aria-live="polite">
            <Icon className="h-4 w-4 shrink-0" />
            <span>{feedback.message}</span>
        </div>
    );
}

function WhatsappButton({
    lead,
    followUps,
    className,
    size = "sm"
}: {
    lead: AdminLead;
    followUps: AdminLeadFollowUp[];
    className?: string;
    size?: "sm" | "md";
}) {
    const href = getWhatsappHref(lead, followUps);

    if (!href) {
        return (
            <Button variant="outline" size={size} className={className} disabled>
                <MessageCircle className="mr-2 h-4 w-4" />
                WhatsApp
            </Button>
        );
    }

    return (
        <Button asChild variant="outline" size={size} className={className}>
            <a href={href} target="_blank" rel="noopener noreferrer" onClick={(event) => event.stopPropagation()}>
                <MessageCircle className="mr-2 h-4 w-4" />
                WhatsApp
            </a>
        </Button>
    );
}

function EmptyLeadState({ filtered }: { filtered: boolean }) {
    return (
        <div className="rounded-xl border border-dashed border-navy-800 bg-navy-900/80 px-4 py-10 text-center">
            <MessageCircle className="mx-auto h-8 w-8 text-blue-300" />
            <p className="mt-3 font-semibold text-cream-100">
                {filtered ? "Nenhum lead encontrado para estes filtros." : "Nenhum lead recebido ainda."}
            </p>
            <p className="mt-1 text-sm text-cream-300">
                {filtered
                    ? "Ajuste a busca ou limpe os filtros para voltar para a inbox completa."
                    : "Os formularios de apoio e parceria vao aparecer aqui assim que forem enviados."}
            </p>
        </div>
    );
}

function DetailItem({
    label,
    value,
    wide = false
}: {
    label: string;
    value: React.ReactNode;
    wide?: boolean;
}) {
    const isEmpty = value === null || value === undefined || value === "";

    return (
        <div className={wide ? "sm:col-span-2" : undefined}>
            <p className="text-xs font-semibold uppercase text-cream-300">{label}</p>
            <div className="mt-1 break-words text-sm leading-6 text-cream-100">
                {isEmpty ? <span className="text-cream-300">Nao informado</span> : value}
            </div>
        </div>
    );
}

function LeadDetailModal({
    lead,
    followUps,
    onClose
}: {
    lead: AdminLead | null;
    followUps: AdminLeadFollowUp[];
    onClose: () => void;
}) {
    const rawPayload = lead?.rawPayload ? JSON.stringify(lead.rawPayload, null, 2) : null;

    return (
        <Modal
            isOpen={Boolean(lead)}
            onClose={onClose}
            title={lead?.name}
            description={lead ? `${journeyLabels[lead.journey]} | ${statusLabels[lead.status]} | ${lead.source}` : undefined}
            className="max-h-[90vh] max-w-3xl overflow-y-auto"
        >
            {lead ? (
                <div className="space-y-6">
                    <div className="flex flex-wrap gap-2">
                        <Badge variant={lead.journey === "commercial" ? "gold" : "accent"}>
                            {journeyLabels[lead.journey]}
                        </Badge>
                        <Badge variant={statusTone[lead.status]}>{statusLabels[lead.status]}</Badge>
                        <Badge variant="outline">{lead.source}</Badge>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <DetailItem label="ID" value={lead.id} wide />
                        <DetailItem label="Nome" value={lead.name} />
                        <DetailItem label="Empresa" value={lead.company} />
                        <DetailItem label="WhatsApp" value={lead.whatsapp} />
                        <DetailItem label="Email" value={lead.email} />
                        <DetailItem label="Cidade" value={lead.city} />
                        <DetailItem label="Instagram ou site" value={lead.instagramOrSite} />
                    </div>

                    <div className="grid gap-4 rounded-xl border border-navy-800 bg-navy-950/60 p-4 sm:grid-cols-2">
                        <DetailItem label="Tipo de apoio" value={lead.supportType} />
                        <DetailItem label="Opcao comercial" value={lead.advertisingOption} />
                        <DetailItem label="Tipo de negocio" value={lead.businessType} />
                        <DetailItem label="Interesse" value={getInterestLabel(lead)} />
                        <DetailItem label="Descricao de apoio" value={lead.supportDescription} wide />
                        <DetailItem label="Mensagem" value={lead.message} wide />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <DetailItem label="Criado em" value={formatFullDate(lead.createdAt)} />
                        <DetailItem label="Atualizado em" value={formatFullDate(lead.updatedAt)} />
                    </div>

                    <div>
                        <p className="text-xs font-semibold uppercase text-cream-300">Payload original</p>
                        {rawPayload ? (
                            <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap rounded-xl border border-navy-800 bg-navy-950/70 p-4 text-xs leading-5 text-cream-100">
                                {rawPayload}
                            </pre>
                        ) : (
                            <p className="mt-2 rounded-xl border border-navy-800 bg-navy-950/70 p-4 text-sm text-cream-300">
                                Nao informado
                            </p>
                        )}
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                        <WhatsappButton lead={lead} followUps={followUps} className="sm:w-auto" size="md" />
                        <Button type="button" variant="secondary" onClick={onClose}>
                            Fechar
                        </Button>
                    </div>
                </div>
            ) : null}
        </Modal>
    );
}

export function LeadsTable({
    data,
    followUps,
    filters,
    sourceOptions,
    filteredCount,
    totalCount
}: {
    data: AdminLead[];
    followUps: AdminLeadFollowUp[];
    filters: LeadFilters;
    sourceOptions: string[];
    filteredCount: number;
    totalCount: number;
}) {
    const router = useRouter();
    const [pendingLeadId, setPendingLeadId] = React.useState<string | null>(null);
    const [selectedLead, setSelectedLead] = React.useState<AdminLead | null>(null);
    const [optimisticStatuses, setOptimisticStatuses] = React.useState<Record<string, LeadStatus>>({});
    const [statusFeedback, setStatusFeedback] = React.useState<{ type: "success" | "error"; leadId: string; message: string } | null>(null);
    const filtersActive = hasFilters(filters);

    const withCurrentStatus = React.useCallback((lead: AdminLead): AdminLead => ({
        ...lead,
        status: optimisticStatuses[lead.id] ?? lead.status
    }), [optimisticStatuses]);

    const handleStatusChange = async (id: string, status: LeadStatus) => {
        const currentLead = data.find((lead) => lead.id === id);
        const currentStatus = currentLead ? optimisticStatuses[id] ?? currentLead.status : null;

        if (currentStatus === status) {
            return;
        }

        setPendingLeadId(id);
        setStatusFeedback(null);

        try {
            const result = await updateLeadStatus(id, status);

            const updatedStatus = result.lead?.status;

            if (!result.success || !updatedStatus) {
                setStatusFeedback({
                    type: "error",
                    leadId: id,
                    message: result.error ?? "Nao foi possivel atualizar o lead."
                });
                return;
            }

            setOptimisticStatuses((current) => ({ ...current, [id]: updatedStatus }));
            setStatusFeedback({
                type: "success",
                leadId: id,
                message: `Status atualizado para ${statusLabels[updatedStatus]}.`
            });
            router.refresh();
        } catch {
            setStatusFeedback({
                type: "error",
                leadId: id,
                message: "Nao foi possivel atualizar o lead."
            });
        } finally {
            setPendingLeadId(null);
        }
    };

    const selectedLeadWithStatus = selectedLead ? withCurrentStatus(selectedLead) : null;

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
            cell: (item) => {
                const lead = withCurrentStatus(item);

                return (
                    <div className="flex min-w-[220px] flex-col gap-2">
                        <div className="flex items-center gap-2">
                            <Badge variant={statusTone[lead.status]}>{statusLabels[lead.status]}</Badge>
                            <StatusSelect
                                leadId={lead.id}
                                status={lead.status}
                                disabled={pendingLeadId === lead.id}
                                onChange={(id, status) => void handleStatusChange(id, status)}
                            />
                            {pendingLeadId === lead.id ? <Loader2 className="h-4 w-4 animate-spin text-blue-300" /> : null}
                        </div>
                        <StatusFeedback feedback={statusFeedback} leadId={lead.id} />
                    </div>
                );
            }
        },
        {
            header: "Recebido",
            accessorKey: "createdAt",
            sortable: true,
            cell: (item) => <span className="text-sm text-cream-300">{formatDate(item.createdAt)}</span>
        },
        {
            header: "Acoes",
            cell: (item) => {
                const lead = withCurrentStatus(item);

                return (
                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={(event) => {
                                event.stopPropagation();
                                setSelectedLead(lead);
                            }}
                        >
                            <Eye className="mr-2 h-4 w-4" />
                            Detalhes
                        </Button>
                        <WhatsappButton lead={lead} followUps={followUps} />
                    </div>
                );
            }
        }
    ];

    return (
        <div className="space-y-4">
            <LeadFiltersForm
                filters={filters}
                sourceOptions={sourceOptions}
                filteredCount={filteredCount}
                totalCount={totalCount}
            />

            <StatusFeedback feedback={statusFeedback} />

            {data.length === 0 ? (
                <EmptyLeadState filtered={filtersActive} />
            ) : (
                <>
                    <div className="space-y-3 md:hidden">
                        {data.map((item) => {
                            const lead = withCurrentStatus(item);

                            return (
                                <div key={lead.id} className="rounded-xl border border-navy-800 bg-navy-950/70 p-4 shadow-sm">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="line-clamp-2 font-semibold text-cream-100">{lead.name}</p>
                                            <p className="mt-1 text-sm text-cream-300">{lead.company ?? lead.whatsapp}</p>
                                        </div>
                                        <Badge variant={lead.journey === "commercial" ? "gold" : "accent"}>
                                            {journeyLabels[lead.journey]}
                                        </Badge>
                                    </div>

                                    <div className="mt-4 flex flex-wrap gap-2">
                                        <Badge variant={statusTone[lead.status]}>{statusLabels[lead.status]}</Badge>
                                        <Badge variant="outline">{lead.source}</Badge>
                                        <Badge variant="outline">{formatDate(lead.createdAt)}</Badge>
                                    </div>

                                    <p className="mt-4 text-sm leading-6 text-cream-300">
                                        {lead.message ?? lead.advertisingOption ?? lead.supportType ?? "Lead sem mensagem adicional."}
                                    </p>

                                    <div className="mt-4 space-y-3">
                                        <div className="flex items-center gap-2">
                                            <StatusSelect
                                                leadId={lead.id}
                                                status={lead.status}
                                                disabled={pendingLeadId === lead.id}
                                                onChange={(id, status) => void handleStatusChange(id, status)}
                                            />
                                            {pendingLeadId === lead.id ? <Loader2 className="h-4 w-4 animate-spin text-blue-300" /> : null}
                                        </div>
                                        <StatusFeedback feedback={statusFeedback} leadId={lead.id} />
                                        <div className="grid gap-2 sm:grid-cols-2">
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                onClick={() => setSelectedLead(lead)}
                                            >
                                                <Eye className="mr-2 h-4 w-4" />
                                                Detalhes
                                            </Button>
                                            <WhatsappButton lead={lead} followUps={followUps} className="w-full" size="md" />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="hidden md:block">
                        <DataTable data={data} columns={columns} keyExtractor={(item) => item.id} />
                    </div>
                </>
            )}

            <LeadDetailModal
                lead={selectedLeadWithStatus}
                followUps={followUps}
                onClose={() => setSelectedLead(null)}
            />
        </div>
    );
}
