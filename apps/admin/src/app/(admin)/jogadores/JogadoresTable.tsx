"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button, DataTable, type Column, Badge } from "@resenha/ui";
import { deletePlayer } from "@/app/actions/players";
import { Edit2, Loader2, ShieldCheck, Trash2 } from "lucide-react";

interface PlayerData {
    id: string;
    name: string;
    nickname: string;
    position: string;
    shirtNumber: number | null;
    goals: number;
    assists: number;
    isActive: boolean;
    photoUrl?: string | null;
}

export function JogadoresTable({ data }: { data: PlayerData[] }) {
    const router = useRouter();
    const [pendingDeleteId, setPendingDeleteId] = React.useState<string | null>(null);

    const handleDelete = async (player: PlayerData) => {
        const shouldDelete = window.confirm(`Excluir ${player.nickname}? Essa acao remove o jogador do elenco.`);

        if (!shouldDelete) {
            return;
        }

        setPendingDeleteId(player.id);
        const result = await deletePlayer(player.id);
        setPendingDeleteId(null);

        if (!result.success) {
            window.alert(result.error ?? "Nao foi possivel excluir o jogador.");
            return;
        }

        router.refresh();
    };

    const columns: Column<PlayerData>[] = [
        {
            header: "Jogador",
            accessorKey: "name",
            sortable: true,
            cell: (item) => (
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full border border-navy-700 bg-navy-800 flex items-center justify-center overflow-hidden shrink-0">
                        {item.photoUrl ? (
                            <Image
                                src={item.photoUrl}
                                alt={item.nickname}
                                width={40}
                                height={40}
                                unoptimized={item.photoUrl.startsWith("/uploads/")}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <span className="text-xs font-bold text-cream-300">{item.nickname.substring(0, 2).toUpperCase()}</span>
                        )}
                    </div>
                    <div className="flex flex-col">
                        <span className="font-semibold text-cream-100">{item.nickname}</span>
                        <span className="text-xs text-cream-300">{item.name}</span>
                    </div>
                </div>
            ),
        },
        {
            header: "Posicao",
            accessorKey: "position",
            sortable: true,
            cell: (item) => <Badge variant="outline">{item.position}</Badge>,
        },
        {
            header: "Camisa",
            accessorKey: "shirtNumber",
            sortable: true,
            cell: (item) => <span className="font-display font-bold">{item.shirtNumber ?? "-"}</span>,
        },
        {
            header: "G/A",
            cell: (item) => (
                <div className="flex items-center gap-2 text-xs font-semibold text-cream-300">
                    <span className="rounded-full border border-navy-700 bg-navy-950 px-2 py-1 text-cream-100">
                        {item.goals} G
                    </span>
                    <span className="rounded-full border border-navy-700 bg-navy-950 px-2 py-1 text-cream-100">
                        {item.assists} A
                    </span>
                </div>
            ),
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
                        onClick={() => router.push(`/jogadores/${item.id}`)}
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
                    <ShieldCheck className="h-8 w-8 text-blue-400" />
                    <div>
                        <p className="font-semibold text-cream-100">Nenhum jogador cadastrado.</p>
                        <p className="text-sm text-cream-300">Adicione o primeiro atleta para montar o elenco.</p>
                    </div>
                </div>
            }
        />
    );
}
