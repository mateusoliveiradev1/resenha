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

    return <DataTable data={data} columns={columns} keyExtractor={(item) => item.id} />;
}
