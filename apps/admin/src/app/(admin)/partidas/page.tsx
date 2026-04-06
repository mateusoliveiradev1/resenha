import * as React from "react";
import { Button } from "@resenha/ui";
import { Plus } from "lucide-react";
import Link from "next/link";
import { db } from "@resenha/db";
import { matches } from "@resenha/db/schema";
import { desc } from "drizzle-orm";
import { PartidasTable } from "./PartidasTable";

export const dynamic = "force-dynamic";

export default async function PartidasListPage() {
    const data = await db.select().from(matches).orderBy(desc(matches.date));

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="font-display text-3xl font-bold tracking-tight text-cream-100">
                        Partidas
                    </h1>
                    <p className="mt-2 text-sm text-cream-300">
                        Gerencie as partidas, placares e as estatísticas individuais (gols/assistências).
                    </p>
                </div>
                <Link href="/partidas/novo" className="shrink-0">
                    <Button variant="primary">
                        <Plus className="mr-2 h-4 w-4" />
                        Nova Partida
                    </Button>
                </Link>
            </div>

            <PartidasTable data={data} />
        </div>
    );
}
