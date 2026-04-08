"use client";

import { Badge, Button, DataTable, type Column } from "@resenha/ui";
import { useRouter } from "next/navigation";

interface ClubRow {
    id: string;
    name: string;
    shortName: string;
    city: string | null;
    isResenha: boolean;
    isActive: boolean;
}

export function ClubsTable({ data }: { data: ClubRow[] }) {
    const router = useRouter();

    const columns: Column<ClubRow>[] = [
        {
            header: "Clube",
            accessorKey: "name",
            sortable: true,
            cell: (item) => (
                <div>
                    <p className="font-semibold text-cream-100">{item.name}</p>
                    <p className="text-xs uppercase tracking-[0.18em] text-cream-300/70">{item.shortName}</p>
                </div>
            ),
        },
        {
            header: "Cidade",
            accessorKey: "city",
            cell: (item) => item.city ?? <span className="text-xs text-cream-300/70">Nao informada</span>,
        },
        {
            header: "Papel",
            cell: (item) => (
                <Badge variant={item.isResenha ? "gold" : "outline"}>
                    {item.isResenha ? "Resenha RFC" : "Participante"}
                </Badge>
            ),
        },
        {
            header: "Status",
            cell: (item) => (
                <Badge variant={item.isActive ? "success" : "default"}>
                    {item.isActive ? "Ativo" : "Inativo"}
                </Badge>
            ),
        },
        {
            header: "Acoes",
            cell: (item) => (
                <Button variant="ghost" size="sm" className="h-8 p-2" onClick={() => router.push(`/clubs/${item.id}`)}>
                    Editar
                </Button>
            ),
        },
    ];

    if (data.length === 0) {
        return (
            <div className="rounded-xl border border-dashed border-navy-800 bg-navy-900/80 px-4 py-10 text-center text-sm text-cream-300">
                Nenhum clube cadastrado.
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
                                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-cream-300/70">{item.shortName}</p>
                            </div>
                            <Badge variant={item.isActive ? "success" : "default"}>
                                {item.isActive ? "Ativo" : "Inativo"}
                            </Badge>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                            <Badge variant={item.isResenha ? "gold" : "outline"}>
                                {item.isResenha ? "Resenha RFC" : "Participante"}
                            </Badge>
                            <Badge variant="outline">{item.city ?? "Cidade pendente"}</Badge>
                        </div>

                        <div className="mt-4">
                            <Button variant="outline" className="w-full" onClick={() => router.push(`/clubs/${item.id}`)}>
                                Editar clube
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
