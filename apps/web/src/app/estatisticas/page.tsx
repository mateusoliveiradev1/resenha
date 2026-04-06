import * as React from "react";
import { Container } from "@resenha/ui";
import { db } from "@resenha/db";
import { matchStats, players } from "@resenha/db/schema";
import { eq, sql } from "drizzle-orm";
import { type RankItem } from "@/components/estatisticas/RankingList";
import { EstatisticasView } from "./EstatisticasView";

export const dynamic = "force-dynamic";

export default async function EstatisticasPage() {
    const playerStats = await db
        .select({
            id: players.id,
            playerName: players.name,
            playerNickname: players.nickname,
            playerPhotoUrl: players.photoUrl,
            goals: sql<number>`greatest(${players.goals}, coalesce(sum(${matchStats.goals}), 0))`,
            assists: sql<number>`greatest(${players.assists}, coalesce(sum(${matchStats.assists}), 0))`,
            cards: sql<number>`coalesce(sum(${matchStats.yellowCards} + ${matchStats.redCards}), 0)`
        })
        .from(players)
        .leftJoin(matchStats, eq(players.id, matchStats.playerId))
        .where(eq(players.isActive, true))
        .groupBy(players.id, players.name, players.nickname, players.photoUrl, players.goals, players.assists);

    const toRankItem = (value: number, item: typeof playerStats[number]): RankItem => ({
        id: item.id,
        playerName: item.playerName,
        playerNickname: item.playerNickname,
        playerPhotoUrl: item.playerPhotoUrl,
        value
    });

    const goalsRanking = [...playerStats]
        .map((item) => toRankItem(Number(item.goals) || 0, item))
        .filter((item) => item.value > 0)
        .sort((left, right) => right.value - left.value || left.playerNickname.localeCompare(right.playerNickname))
        .slice(0, 10);

    const assistsRanking = [...playerStats]
        .map((item) => toRankItem(Number(item.assists) || 0, item))
        .filter((item) => item.value > 0)
        .sort((left, right) => right.value - left.value || left.playerNickname.localeCompare(right.playerNickname))
        .slice(0, 10);

    const cardsRanking = [...playerStats]
        .map((item) => toRankItem(Number(item.cards) || 0, item))
        .filter((item) => item.value > 0)
        .sort((left, right) => right.value - left.value || left.playerNickname.localeCompare(right.playerNickname))
        .slice(0, 10);

    return (
        <div className="py-12 lg:py-20 min-h-screen">
            <Container>
                <div className="max-w-2xl mb-12">
                    <h1 className="font-display text-4xl font-bold tracking-tight text-cream-100 sm:text-5xl">
                        Estatisticas
                    </h1>
                    <p className="mt-4 text-lg text-cream-300">
                        Acompanhe os numeros da temporada, os maiores goleadores e os garcons do Resenha RFC.
                    </p>
                </div>

                <EstatisticasView
                    goalsRanking={goalsRanking}
                    assistsRanking={assistsRanking}
                    cardsRanking={cardsRanking}
                />
            </Container>
        </div>
    );
}
