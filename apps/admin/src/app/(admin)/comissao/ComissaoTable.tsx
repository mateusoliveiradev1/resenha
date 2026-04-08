"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Badge, Button, DataTable, type Column, shouldBypassNextImageOptimization } from "@resenha/ui";
import { deleteStaffMember } from "@/app/actions/staff";
import { Edit2, Loader2, Shield, Trash2 } from "lucide-react";

interface StaffData {
    id: string;
    name: string;
    role: string;
    photoUrl: string | null;
    displayOrder: number;
    isActive: boolean;
}

const getInitials = (name: string) =>
    name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((value) => value[0]?.toUpperCase())
        .join("");

export function ComissaoTable({ data }: { data: StaffData[] }) {
    const router = useRouter();
    const [pendingDeleteId, setPendingDeleteId] = React.useState<string | null>(null);
    const emptyState = (
        <div className="flex flex-col items-center gap-3 py-6 text-center">
            <Shield className="h-8 w-8 text-blue-400" />
            <div>
                <p className="font-semibold text-cream-100">Nenhum membro cadastrado.</p>
                <p className="text-sm text-cream-300">Cadastre a diretoria e a comissao tecnica para preencher a pagina publica.</p>
            </div>
        </div>
    );

    const handleDelete = async (member: StaffData) => {
        const shouldDelete = window.confirm(`Excluir ${member.name}? Essa acao remove o membro da pagina de diretoria.`);

        if (!shouldDelete) {
            return;
        }

        setPendingDeleteId(member.id);
        const result = await deleteStaffMember(member.id);
        setPendingDeleteId(null);

        if (!result.success) {
            window.alert(result.error ?? "Nao foi possivel excluir o membro da comissao.");
            return;
        }

        router.refresh();
    };

    const columns: Column<StaffData>[] = [
        {
            header: "Membro",
            accessorKey: "name",
            sortable: true,
            cell: (item) => (
                <div className="flex items-center gap-3">
                    <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-navy-700 bg-navy-950">
                        {item.photoUrl ? (
                            <Image
                                src={item.photoUrl}
                                alt={item.name}
                                fill
                                unoptimized={shouldBypassNextImageOptimization(item.photoUrl)}
                                className="object-cover"
                                sizes="48px"
                            />
                        ) : (
                            <span className="text-xs font-bold text-cream-300">{getInitials(item.name)}</span>
                        )}
                    </div>
                    <div className="flex flex-col">
                        <span className="font-semibold text-cream-100">{item.name}</span>
                        <span className="text-xs text-cream-300">{item.role}</span>
                    </div>
                </div>
            ),
        },
        {
            header: "Cargo",
            accessorKey: "role",
            sortable: true,
            cell: (item) => <Badge variant="outline">{item.role}</Badge>,
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
                        onClick={() => router.push(`/comissao/${item.id}`)}
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
                            <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-navy-700 bg-navy-950">
                                {item.photoUrl ? (
                                    <Image
                                        src={item.photoUrl}
                                        alt={item.name}
                                        fill
                                        unoptimized={shouldBypassNextImageOptimization(item.photoUrl)}
                                        className="object-cover"
                                        sizes="56px"
                                    />
                                ) : (
                                    <span className="text-xs font-bold text-cream-300">{getInitials(item.name)}</span>
                                )}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="line-clamp-2 font-semibold text-cream-100">{item.name}</p>
                                <p className="mt-1 text-sm text-cream-300">{item.role}</p>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    <Badge variant="outline">{item.role}</Badge>
                                    <Badge variant={item.isActive ? "success" : "outline"}>
                                        {item.isActive ? "ATIVO" : "INATIVO"}
                                    </Badge>
                                    <Badge variant="outline">Ordem {item.displayOrder}</Badge>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 flex gap-2">
                            <Button variant="outline" className="flex-1" onClick={() => router.push(`/comissao/${item.id}`)}>
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
