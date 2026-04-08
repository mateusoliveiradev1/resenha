"use client";

import { Badge, Button, DataTable, type Column } from "@resenha/ui";
import { useRouter } from "next/navigation";

interface ChampionshipRow {
    id: string;
    name: string;
    seasonLabel: string;
    surface: "CAMPO" | "FUTSAL" | "MISTO";
    status: "PLANNED" | "LIVE" | "FINISHED";
    participantsCount: number;
}

export function ChampionshipsTable({ data }: { data: ChampionshipRow[] }) {
    const router = useRouter();

    const columns: Column<ChampionshipRow>[] = [
        {
            header: "Campeonato",
            accessorKey: "name",
            sortable: true,
            cell: (item) => (
                <div>
                    <p className="font-semibold text-cream-100">{item.name}</p>
                    <p className="text-xs uppercase tracking-[0.18em] text-cream-300/70">{item.seasonLabel}</p>
                </div>
            ),
        },
        {
            header: "Modalidade",
            cell: (item) => <Badge variant="outline">{item.surface}</Badge>,
        },
        {
            header: "Status",
            cell: (item) => (
                <Badge variant={item.status === "LIVE" ? "danger" : item.status === "FINISHED" ? "success" : "default"}>
                    {item.status === "PLANNED" ? "Planejado" : item.status === "LIVE" ? "Ao vivo" : "Finalizado"}
                </Badge>
            ),
        },
        {
            header: "Participantes",
            accessorKey: "participantsCount",
            sortable: true,
            cell: (item) => <span className="font-semibold text-cream-100">{item.participantsCount}</span>,
        },
        {
            header: "Acoes",
            cell: (item) => (
                <Button variant="ghost" size="sm" className="h-8 p-2" onClick={() => router.push(`/campeonatos/${item.id}`)}>
                    Editar
                </Button>
            ),
        },
    ];

    if (data.length === 0) {
        return (
            <div className="rounded-xl border border-dashed border-navy-800 bg-navy-900/80 px-4 py-10 text-center text-sm text-cream-300">
                Nenhum campeonato cadastrado.
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
                                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-cream-300/70">{item.seasonLabel}</p>
                            </div>
                            <Badge variant={item.status === "LIVE" ? "danger" : item.status === "FINISHED" ? "success" : "default"}>
                                {item.status === "PLANNED" ? "Planejado" : item.status === "LIVE" ? "Ao vivo" : "Finalizado"}
                            </Badge>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                            <Badge variant="outline">{item.surface}</Badge>
                            <Badge variant="accent">{item.participantsCount} participantes</Badge>
                        </div>

                        <div className="mt-4">
                            <Button variant="outline" className="w-full" onClick={() => router.push(`/campeonatos/${item.id}`)}>
                                Editar campeonato
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
