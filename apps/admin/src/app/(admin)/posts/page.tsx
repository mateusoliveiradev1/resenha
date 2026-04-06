import * as React from "react";
import { Button } from "@resenha/ui";
import { Plus } from "lucide-react";
import Link from "next/link";
import { db } from "@resenha/db";
import { posts } from "@resenha/db/schema";
import { desc } from "drizzle-orm";
import { PostsTable } from "./PostsTable";

export default async function PostsListPage() {
    const data = await db.select().from(posts).orderBy(desc(posts.createdAt));

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="font-display text-3xl font-bold tracking-tight text-cream-100">Blog Posts</h1>
                    <p className="mt-2 text-sm text-cream-300">Escreva notícias, relatos de partidas e avisos.</p>
                </div>
                <Link href="/posts/novo" className="shrink-0">
                    <Button variant="primary">
                        <Plus className="mr-2 h-4 w-4" /> Novo Post
                    </Button>
                </Link>
            </div>

            <PostsTable data={data as any} />
        </div>
    );
}
