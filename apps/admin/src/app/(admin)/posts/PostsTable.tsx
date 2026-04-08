"use client";

import { Button, DataTable, type Column, Badge } from "@resenha/ui";
import { useRouter } from "next/navigation";

interface AdminPost {
    id: string;
    title: string;
    category: string;
    publishedAt?: Date | null;
    readingTimeMin: number;
}

export type { AdminPost };

export function PostsTable({ data }: { data: AdminPost[] }) {
    const router = useRouter();

    const columns: Column<AdminPost>[] = [
        {
            header: "Título",
            accessorKey: "title",
            sortable: true,
            cell: (item) => (
                <span className="font-semibold text-cream-100 max-w-[300px] truncate block" title={item.title}>
                    {item.title}
                </span>
            ),
        },
        {
            header: "Categoria",
            accessorKey: "category",
            cell: (item) => <Badge variant="outline">{item.category}</Badge>,
        },
        {
            header: "Status",
            accessorKey: "publishedAt",
            cell: (item) => (
                <Badge variant={item.publishedAt ? "success" : "warning"}>
                    {item.publishedAt ? "PUBLICADO" : "RASCUNHO"}
                </Badge>
            ),
        },
        {
            header: "Ações",
            cell: (item) => (
                <Button variant="ghost" size="sm" onClick={() => router.push(`/posts/${item.id}`)}>Editar</Button>
            ),
        },
    ];

    if (data.length === 0) {
        return (
            <div className="rounded-xl border border-dashed border-navy-800 bg-navy-900/80 px-4 py-10 text-center text-sm text-cream-300">
                Nenhum post cadastrado.
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
                                <p className="line-clamp-2 font-semibold text-cream-100">{item.title}</p>
                                <p className="mt-1 text-xs text-cream-300">{item.readingTimeMin} min de leitura</p>
                            </div>
                            <Badge variant={item.publishedAt ? "success" : "warning"}>
                                {item.publishedAt ? "Publicado" : "Rascunho"}
                            </Badge>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                            <Badge variant="outline">{item.category}</Badge>
                            {item.publishedAt ? (
                                <Badge variant="outline">
                                    {new Date(item.publishedAt).toLocaleDateString("pt-BR")}
                                </Badge>
                            ) : null}
                        </div>

                        <div className="mt-4">
                            <Button variant="outline" className="w-full" onClick={() => router.push(`/posts/${item.id}`)}>
                                Editar post
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
