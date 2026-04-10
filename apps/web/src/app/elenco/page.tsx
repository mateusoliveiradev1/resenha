import type { Metadata } from "next";
import * as React from "react";
import { Container } from "@resenha/ui";
import { buildRosterSummaries, db } from "@resenha/db";
import { matchAppearances, matchStats, players as playersTable } from "@resenha/db/schema";
import { asc, eq, sql } from "drizzle-orm";
import { type Player } from "@/components/elenco/PlayerCard";
import { ElencoView } from "./ElencoView";
import { createPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = createPageMetadata({
    title: "Elenco",
    description:
        "Conheça o elenco do Resenha RFC, com jogadores, posições e informações do grupo que representa o clube no campo e na quadra.",
    path: "/elenco",
    keywords: ["elenco", "jogadores", "time", "futebol amador", "campo", "quadra"]
});

export default async function ElencoPage() {
    const [dbPlayers, aggregatedStats, aggregatedAppearances] = await Promise.all([
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
            })
            .from(matchStats)
            .groupBy(matchStats.playerId),
        db
            .select({
                playerId: matchAppearances.playerId,
                matchesPlayed: sql<number>`count(distinct ${matchAppearances.matchId})`,
            })
            .from(matchAppearances)
            .groupBy(matchAppearances.playerId),
    ]);
    const players: Player[] = buildRosterSummaries({
        players: dbPlayers.map((player) => ({
            id: player.id,
            name: player.name,
            nickname: player.nickname,
            position: player.position as "GOL" | "DEF" | "MEI" | "ATA",
            shirtNumber: player.shirtNumber,
            photoUrl: player.photoUrl,
            birthDate: player.birthDate,
            heightCm: player.heightCm,
            preferredFoot: (player.preferredFoot as "DIREITO" | "ESQUERDO" | "AMBIDESTRO" | null) ?? null,
            goals: player.goals,
            assists: player.assists,
        })),
        statTotals: aggregatedStats.map((item) => ({
            playerId: item.playerId,
            goals: Number(item.goals) || 0,
            assists: Number(item.assists) || 0,
        })),
        appearanceTotals: aggregatedAppearances.map((item) => ({
            playerId: item.playerId,
            matchesPlayed: Number(item.matchesPlayed) || 0,
        })),
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
