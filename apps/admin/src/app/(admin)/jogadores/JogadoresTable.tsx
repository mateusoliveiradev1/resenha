"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button, DataTable, type Column, Badge, shouldBypassNextImageOptimization } from "@resenha/ui";
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
    const emptyState = (
        <div className="flex flex-col items-center gap-3 py-6 text-center">
            <ShieldCheck className="h-8 w-8 text-blue-400" />
            <div>
                <p className="font-semibold text-cream-100">Nenhum jogador cadastrado.</p>
                <p className="text-sm text-cream-300">Adicione o primeiro atleta para montar o elenco.</p>
            </div>
        </div>
    );

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
                                unoptimized={shouldBypassNextImageOptimization(item.photoUrl)}
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

    if (data.length === 0) {
        return (
            <div className="rounded-xl border border-dashed border-navy-800 bg-navy-900/80 px-4 py-6">
                {emptyState}
            </div>
        );
    }

    return (
        <>
            <div className="space-y-3 md:hidden">
                {data.map((item) => (
                    <div key={item.id} className="rounded-2xl border border-navy-800 bg-navy-950/70 p-4 shadow-sm">
                        <div className="flex items-start gap-3">
                            <div className="h-14 w-14 rounded-full border border-navy-700 bg-navy-800 flex items-center justify-center overflow-hidden shrink-0">
                                {item.photoUrl ? (
                                    <Image
                                        src={item.photoUrl}
                                        alt={item.nickname}
                                        width={56}
                                        height={56}
                                        unoptimized={shouldBypassNextImageOptimization(item.photoUrl)}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <span className="text-xs font-bold text-cream-300">{item.nickname.substring(0, 2).toUpperCase()}</span>
                                )}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="line-clamp-1 font-semibold text-cream-100">{item.nickname}</p>
                                <p className="mt-1 text-sm text-cream-300">{item.name}</p>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    <Badge variant="outline">{item.position}</Badge>
                                    <Badge variant="outline">Camisa {item.shirtNumber ?? "-"}</Badge>
                                    <Badge variant={item.isActive ? "success" : "outline"}>
                                        {item.isActive ? "ATIVO" : "INATIVO"}
                                    </Badge>
                                </div>
                                <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-cream-300">
                                    <span className="rounded-full border border-navy-700 bg-navy-950 px-2 py-1 text-cream-100">
                                        {item.goals} G
                                    </span>
                                    <span className="rounded-full border border-navy-700 bg-navy-950 px-2 py-1 text-cream-100">
                                        {item.assists} A
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 flex gap-2">
                            <Button variant="outline" className="flex-1" onClick={() => router.push(`/jogadores/${item.id}`)}>
                                Editar
                            </Button>
                            <Button
                                variant="ghost"
                                className="flex-1 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                                onClick={() => void handleDelete(item)}
                                disabled={pendingDeleteId === item.id}
                            >
                                {pendingDeleteId === item.id ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Trash2 className="mr-2 h-4 w-4" />
                                )}
                                Excluir
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
                    emptyState={emptyState}
                />
            </div>
        </>
    );
}
