"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button, DataTable, type Column, Badge, shouldBypassNextImageOptimization } from "@resenha/ui";
import { deleteSponsor } from "@/app/actions/sponsors";
import { Edit2, Handshake, Loader2, Trash2 } from "lucide-react";
import type { SponsorTier } from "@resenha/validators";

interface SponsorData {
    id: string;
    name: string;
    logoUrl: string | null;
    websiteUrl: string | null;
    tier: SponsorTier;
    displayOrder: number;
    featuredOnHome: boolean;
    isActive: boolean;
}

const tierTone: Record<SponsorTier, "gold" | "accent" | "outline"> = {
    MASTER: "gold",
    OURO: "accent",
    PRATA: "outline",
    APOIO: "outline"
};

export function PatrocinadoresTable({ data }: { data: SponsorData[] }) {
    const router = useRouter();
    const [pendingDeleteId, setPendingDeleteId] = React.useState<string | null>(null);

    const handleDelete = async (sponsor: SponsorData) => {
        const shouldDelete = window.confirm(`Excluir ${sponsor.name}? Essa acao remove o patrocinador do site.`);

        if (!shouldDelete) {
            return;
        }

        setPendingDeleteId(sponsor.id);
        const result = await deleteSponsor(sponsor.id);
        setPendingDeleteId(null);

        if (!result.success) {
            window.alert(result.error ?? "Nao foi possivel excluir o patrocinador.");
            return;
        }

        router.refresh();
    };

    const columns: Column<SponsorData>[] = [
        {
            header: "Marca",
            accessorKey: "name",
            sortable: true,
            cell: (item) => (
                <div className="flex items-center gap-3">
                    <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-navy-700 bg-navy-950">
                        {item.logoUrl ? (
                            <Image
                                src={item.logoUrl}
                                alt={item.name}
                                fill
                                unoptimized={shouldBypassNextImageOptimization(item.logoUrl)}
                                className="object-contain p-2"
                                sizes="48px"
                            />
                        ) : (
                            <span className="text-xs font-bold text-cream-300">{item.name.slice(0, 2).toUpperCase()}</span>
                        )}
                    </div>
                    <div className="flex flex-col">
                        <span className="font-semibold text-cream-100">{item.name}</span>
                        <span className="text-xs text-cream-300">{item.websiteUrl ?? "Sem link externo"}</span>
                    </div>
                </div>
            ),
        },
        {
            header: "Tier",
            accessorKey: "tier",
            sortable: true,
            cell: (item) => <Badge variant={tierTone[item.tier]}>{item.tier}</Badge>,
        },
        {
            header: "Home",
            accessorKey: "featuredOnHome",
            cell: (item) => (
                <Badge variant={item.featuredOnHome ? "accent" : "outline"}>
                    {item.featuredOnHome ? "EM DESTAQUE" : "SO PAGINA"}
                </Badge>
            ),
        },
        {
            header: "Ordem",
            accessorKey: "displayOrder",
            sortable: true,
            cell: (item) => <span className="font-display text-lg text-cream-100">{item.displayOrder}</span>,
        },
        {
            header: "Status",
            accessorKey: "isActive",
            cell: (item) => (
                <Badge variant={item.isActive ? "success" : "outline"}>
                    {item.isActive ? "ATIVO" : "INATIVO"}
                </Badge>
            ),
        },
        {
            header: "Acoes",
            cell: (item) => (
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        title="Editar"
                        onClick={() => router.push(`/patrocinadores/${item.id}`)}
                    >
                        <Edit2 className="h-4 w-4 text-blue-400" />
                        <span className="sr-only">Editar</span>
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        title="Excluir"
                        onClick={() => void handleDelete(item)}
                        disabled={pendingDeleteId === item.id}
                    >
                        {pendingDeleteId === item.id ? (
                            <Loader2 className="h-4 w-4 animate-spin text-red-400" />
                        ) : (
                            <Trash2 className="h-4 w-4 text-red-400" />
                        )}
                        <span className="sr-only">Excluir</span>
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
            emptyState={
                <div className="flex flex-col items-center gap-3 py-6 text-center">
                    <Handshake className="h-8 w-8 text-blue-400" />
                    <div>
                        <p className="font-semibold text-cream-100">Nenhum patrocinador cadastrado.</p>
                        <p className="text-sm text-cream-300">Crie a primeira parceria para exibir logos na home e na pagina institucional.</p>
                    </div>
                </div>
            }
        />
    );
}
