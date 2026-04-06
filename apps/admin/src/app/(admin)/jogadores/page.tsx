import * as React from "react";
import { Button } from "@resenha/ui";
import { Plus } from "lucide-react";
import Link from "next/link";
import { db } from "@resenha/db";
import { players } from "@resenha/db/schema";
import { desc } from "drizzle-orm";
import { JogadoresTable } from "./JogadoresTable";

export default async function JogadoresListPage() {
    // Busca dados reais do banco
    const playersData = await db.select().from(players).orderBy(desc(players.createdAt));

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="font-display text-3xl font-bold tracking-tight text-cream-100">
                        Jogadores
                    </h1>
                    <p className="mt-2 text-sm text-cream-300">
                        Gerencie o elenco do Resenha RFC. Adicione, edite ou inative jogadores.
                    </p>
                </div>
                <Link href="/jogadores/novo" className="shrink-0">
                    <Button variant="primary">
                        <Plus className="mr-2 h-4 w-4" />
                        Novo Jogador
                    </Button>
                </Link>
            </div>

            <JogadoresTable data={playersData} />
        </div>
    );
}

