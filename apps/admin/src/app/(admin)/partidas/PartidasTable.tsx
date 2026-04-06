"use client";

import { Button, DataTable, type Column, Badge } from "@resenha/ui";
import { useRouter } from "next/navigation";

interface AdminMatch {
    id: string;
    opponent: string;
    type: string;
    date: Date;
    status: string;
    scoreHome?: number | null;
    scoreAway?: number | null;
}

export function PartidasTable({ data }: { data: AdminMatch[] }) {
    const router = useRouter();

    const columns: Column<AdminMatch>[] = [
        {
            header: "Adversário",
            accessorKey: "opponent",
            sortable: true,
            cell: (item) => <span className="font-semibold text-cream-100">{item.opponent}</span>,
        },
        {
            header: "Data",
            accessorKey: "date",
            sortable: true,
            cell: (item) => <span>{new Date(item.date).toLocaleDateString("pt-BR")}</span>,
        },
        {
            header: "Tipo",
            accessorKey: "type",
            cell: (item) => <Badge variant="outline">{item.type}</Badge>,
        },
        {
            header: "Status",
            accessorKey: "status",
            cell: (item) => (
                <Badge variant={item.status === "FINISHED" ? "success" : item.status === "LIVE" ? "danger" : "default"}>
                    {item.status}
                </Badge>
            ),
        },
        {
            header: "Placar",
            cell: (item) => (
                <div className="font-display font-bold">
                    {item.scoreHome != null && item.scoreAway != null ? (
                        `${item.scoreHome} - ${item.scoreAway}`
                    ) : (
                        <span className="text-cream-300 font-sans text-xs">A definir</span>
                    )}
                </div>
            ),
        },
        {
            header: "Ações",
            cell: (item) => (
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="h-8 p-2" onClick={() => router.push(`/partidas/${item.id}`)} title="Editar & Stats">
                        Editar & Stats
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <DataTable
            data={data}
            columns={columns}
            keyExtractor={(item) => item.id}
        />
    );
}
