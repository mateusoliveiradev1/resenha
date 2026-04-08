import { Button } from "@resenha/ui";
import { db } from "@resenha/db";
import { clubs } from "@resenha/db/schema";
import { desc } from "drizzle-orm";
import { Plus } from "lucide-react";
import Link from "next/link";
import { ClubsTable } from "./ClubsTable";

export const dynamic = "force-dynamic";

export default async function ClubsListPage() {
    const data = await db.select().from(clubs).orderBy(desc(clubs.isResenha), desc(clubs.createdAt));

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="font-display text-3xl font-bold tracking-tight text-cream-100">Clubes</h1>
                    <p className="mt-2 text-sm text-cream-300">
                        Cadastre os escudos e identidades dos clubes uma unica vez para reaproveitar em amistosos, campeonatos e classificacoes.
                    </p>
                </div>

                <Link href="/clubs/novo" className="shrink-0">
                    <Button variant="primary">
                        <Plus className="mr-2 h-4 w-4" />
                        Novo Clube
                    </Button>
                </Link>
            </div>

            <ClubsTable data={data} />
        </div>
    );
}
