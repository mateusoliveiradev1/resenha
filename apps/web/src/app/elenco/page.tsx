import * as React from "react";
import { Container } from "@resenha/ui";
import { db } from "@resenha/db";
import { matchStats, players as playersTable } from "@resenha/db/schema";
import { asc, eq, sql } from "drizzle-orm";
import { type Player } from "@/components/elenco/PlayerCard";
import { ElencoView } from "./ElencoView";

export const dynamic = "force-dynamic";

export default async function ElencoPage() {
    const [dbPlayers, aggregatedStats] = await Promise.all([
        db
            .select()
            .from(playersTable)
            .where(eq(playersTable.isActive, true))
            .orderBy(asc(playersTable.shirtNumber)),
        db
            .select({
                playerId: matchStats.playerId,
                goals: sql<number>`coalesce(sum(${matchStats.goals}), 0)`,
                assists: sql<number>`coalesce(sum(${matchStats.assists}), 0)`,
                matchesPlayed: sql<number>`count(${matchStats.id})`
            })
            .from(matchStats)
            .groupBy(matchStats.playerId)
    ]);

    const statsByPlayer = new Map(
        aggregatedStats.map((item) => [
            item.playerId,
            {
                goals: Number(item.goals) || 0,
                assists: Number(item.assists) || 0,
                matchesPlayed: Number(item.matchesPlayed) || 0
            }
        ])
    );

    const players: Player[] = dbPlayers.map((player) => {
        const totals = statsByPlayer.get(player.id);

        return {
            id: player.id,
            name: player.name,
            nickname: player.nickname,
            position: player.position as "GOL" | "DEF" | "MEI" | "ATA",
            shirtNumber: player.shirtNumber,
            photoUrl: player.photoUrl,
            stats: {
                goals: Math.max(totals?.goals ?? 0, player.goals ?? 0),
                assists: Math.max(totals?.assists ?? 0, player.assists ?? 0),
                matchesPlayed: totals?.matchesPlayed ?? 0,
                age: player.birthDate ? new Date().getFullYear() - new Date(player.birthDate).getFullYear() : 25,
                heightCm: player.heightCm || 175,
                preferredFoot: (player.preferredFoot as "DIREITO" | "ESQUERDO" | "AMBIDESTRO") || "DIREITO"
            }
        };
    });

    return (
        <div className="py-12 lg:py-20 min-h-screen">
            <Container>
                <div className="max-w-2xl">
                    <h1 className="font-display text-4xl font-bold tracking-tight text-cream-100 sm:text-5xl">
                        Nosso Elenco
                    </h1>
                    <p className="mt-4 text-lg text-cream-300">
                        Conheca os guerreiros que vestem o manto sagrado do Resenha RFC.
                    </p>
                </div>

                <ElencoView players={players} />
            </Container>
        </div>
    );
}
