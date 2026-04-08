"use client";

import { Badge, Button, DataTable, type Column } from "@resenha/ui";
import { useRouter } from "next/navigation";

interface AdminMatch {
    id: string;
    scope: "RESHENHA" | "CAMPEONATO";
    displayName: string;
    contextLine?: string | null;
    competitionName?: string | null;
    type: string;
    date: Date;
    location: string;
    status: "SCHEDULED" | "LIVE" | "FINISHED";
    category: string;
    scoreLabel?: string | null;
}

function formatStatus(status: AdminMatch["status"]) {
    switch (status) {
        case "LIVE":
            return "Ao vivo";
        case "FINISHED":
            return "Finalizada";
        default:
            return "Agendada";
    }
}

function formatMatchDate(value: Date) {
    return new Date(value).toLocaleDateString("pt-BR");
}

function formatMatchTime(value: Date) {
    return new Date(value).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export function PartidasTable({
    data,
    emptyState,
}: {
    data: AdminMatch[];
    emptyState?: string;
}) {
    const router = useRouter();
    const resolvedEmptyState = emptyState ?? "Nenhuma partida encontrada.";

    const columns: Column<AdminMatch>[] = [
        {
            header: "Partida",
            accessorKey: "displayName",
            sortable: true,
            cell: (item) => (
                <div className="space-y-1">
                    <span className="font-semibold text-cream-100">{item.displayName}</span>
                    <p className="max-w-[420px] truncate text-xs text-cream-300">
                        {item.contextLine ?? item.competitionName ?? (item.category === "CHAMPIONSHIP" ? "Campeonato" : "Jogo avulso")}
                    </p>
                </div>
            ),
        },
        {
            header: "Data",
            accessorKey: "date",
            sortable: true,
            cell: (item) => (
                <div className="space-y-1">
                    <span>{formatMatchDate(item.date)}</span>
                    <p className="text-xs text-cream-300">
                        {formatMatchTime(item.date)}
                    </p>
                </div>
            ),
        },
        {
            header: "Escopo",
            accessorKey: "scope",
            cell: (item) => (
                <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">{item.type}</Badge>
                    <Badge variant={item.scope === "RESHENHA" ? "gold" : "accent"}>
                        {item.scope === "RESHENHA" ? "Resenha" : "Campeonato"}
                    </Badge>
                </div>
            ),
        },
        {
            header: "Local",
            accessorKey: "location",
            cell: (item) => <span className="max-w-[240px] truncate text-cream-100">{item.location}</span>,
        },
        {
            header: "Status",
            accessorKey: "status",
            cell: (item) => (
                <Badge variant={item.status === "FINISHED" ? "success" : item.status === "LIVE" ? "danger" : "default"}>
                    {formatStatus(item.status)}
                </Badge>
            ),
        },
        {
            header: "Placar",
            cell: (item) => (
                <div className="font-display font-bold">
                    {item.scoreLabel ? (
                        item.scoreLabel
                    ) : (
                        <span className="font-sans text-xs text-cream-300">A definir</span>
                    )}
                </div>
            ),
        },
        {
            header: "Acoes",
            cell: (item) => (
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-3"
                        onClick={(event) => {
                            event.stopPropagation();
                            router.push(`/partidas/${item.id}`);
                        }}
                        title="Editar partida"
                    >
                        Editar
                    </Button>
                </div>
            ),
        },
    ];

    if (data.length === 0) {
        return (
            <div className="rounded-xl border border-dashed border-navy-800 bg-navy-900/80 px-4 py-10 text-center text-sm text-cream-300">
                {resolvedEmptyState}
            </div>
        );
    }

    return (
        <>
            <div className="space-y-3 md:hidden">
                {data.map((item) => (
                    <div
                        key={item.id}
                        className="rounded-2xl border border-navy-800 bg-navy-950/70 p-4 shadow-sm"
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <p className="line-clamp-2 font-semibold text-cream-100">
                                    {item.displayName}
                                </p>
                                <p className="mt-1 line-clamp-2 text-xs text-cream-300">
                                    {item.contextLine ?? item.competitionName ?? (item.category === "CHAMPIONSHIP" ? "Campeonato" : "Jogo avulso")}
                                </p>
                            </div>
                            <Badge variant={item.scope === "RESHENHA" ? "gold" : "accent"} className="shrink-0">
                                {item.scope === "RESHENHA" ? "Resenha" : "Camp."}
                            </Badge>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                            <Badge variant="outline">{item.type}</Badge>
                            <Badge variant={item.status === "FINISHED" ? "success" : item.status === "LIVE" ? "danger" : "default"}>
                                {formatStatus(item.status)}
                            </Badge>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl border border-navy-800 bg-navy-900/60 p-3">
                            <div>
                                <p className="text-[10px] uppercase tracking-[0.2em] text-cream-300/70">Data</p>
                                <p className="mt-2 text-sm font-medium text-cream-100">{formatMatchDate(item.date)}</p>
                                <p className="text-xs text-cream-300">{formatMatchTime(item.date)}</p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase tracking-[0.2em] text-cream-300/70">Placar</p>
                                <p className="mt-2 text-sm font-medium text-cream-100">
                                    {item.scoreLabel ?? "A definir"}
                                </p>
                            </div>
                        </div>

                        <div className="mt-4">
                            <p className="text-[10px] uppercase tracking-[0.2em] text-cream-300/70">Local</p>
                            <p className="mt-2 text-sm text-cream-100">{item.location}</p>
                        </div>

                        <div className="mt-4">
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => router.push(`/partidas/${item.id}`)}
                            >
                                Editar partida
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="hidden md:block">
                <DataTable
                    data={data}
                    columns={columns}
                    keyExtractor={(item) => item.id}
                    emptyState={resolvedEmptyState}
                    onRowClick={(item) => router.push(`/partidas/${item.id}`)}
                />
            </div>
        </>
    );
}
