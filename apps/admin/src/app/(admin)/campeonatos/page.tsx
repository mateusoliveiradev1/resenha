import { Button } from "@resenha/ui";
import { db } from "@resenha/db";
import { championshipParticipants, championships } from "@resenha/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { Plus } from "lucide-react";
import Link from "next/link";
import { ChampionshipsTable } from "./ChampionshipsTable";

export const dynamic = "force-dynamic";

export default async function ChampionshipsListPage() {
    const data = await db
        .select({
            id: championships.id,
            name: championships.name,
            seasonLabel: championships.seasonLabel,
            surface: championships.surface,
            status: championships.status,
            participantsCount: sql<number>`count(${championshipParticipants.id})`,
        })
        .from(championships)
        .leftJoin(championshipParticipants, eq(championshipParticipants.championshipId, championships.id))
        .groupBy(championships.id)
        .orderBy(desc(championships.createdAt));

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="font-display text-3xl font-bold tracking-tight text-cream-100">Campeonatos</h1>
                    <p className="mt-2 text-sm text-cream-300">
                        Configure a competicao, a pontuacao e os participantes. Depois basta lancar os resultados das partidas para a tabela se recalcular sozinha.
                    </p>
                </div>

                <Link href="/campeonatos/novo" className="shrink-0">
                    <Button variant="primary">
                        <Plus className="mr-2 h-4 w-4" />
                        Novo Campeonato
                    </Button>
                </Link>
            </div>

            <ChampionshipsTable
                data={data.map((item) => ({
                    ...item,
                    participantsCount: Number(item.participantsCount) || 0,
                }))}
            />
        </div>
    );
}
