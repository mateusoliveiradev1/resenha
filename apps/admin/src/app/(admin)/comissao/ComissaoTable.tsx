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

    return (
        <DataTable
            data={data}
            columns={columns}
            keyExtractor={(item) => item.id}
            emptyState={
                <div className="flex flex-col items-center gap-3 py-6 text-center">
                    <Shield className="h-8 w-8 text-blue-400" />
                    <div>
                        <p className="font-semibold text-cream-100">Nenhum membro cadastrado.</p>
                        <p className="text-sm text-cream-300">Cadastre a diretoria e a comissao tecnica para preencher a pagina publica.</p>
                    </div>
                </div>
            }
        />
    );
}
