import type { Metadata } from "next";
import Link from "next/link";
import { Badge, Button, Card, CardContent, Container } from "@resenha/ui";
import { db } from "@resenha/db";
import { matchStats, matches, players } from "@resenha/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { type RankItem } from "@/components/estatisticas/RankingList";
import { EstatisticasView } from "./EstatisticasView";
import { createPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = createPageMetadata({
    title: "Estatísticas",
    description:
        "Veja as estatísticas do Resenha RFC com campanha, gols, assistências, rankings do elenco e leitura de desempenho da temporada.",
    path: "/estatisticas",
    keywords: ["estatísticas", "gols", "assistências", "campanha", "desempenho", "ranking"]
});

export default async function EstatisticasPage() {
    const finishedMatches = await db.query.matches.findMany({
        where: eq(matches.status, "FINISHED"),
        orderBy: [desc(matches.date)]
    });

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

    const totalMatches = finishedMatches.length;
    const activePlayers = playerStats.length;
    const wins = finishedMatches.filter((match) => (match.scoreHome ?? 0) > (match.scoreAway ?? 0)).length;
    const draws = finishedMatches.filter((match) => (match.scoreHome ?? 0) === (match.scoreAway ?? 0)).length;
    const losses = Math.max(totalMatches - wins - draws, 0);
    const goalsFor = finishedMatches.reduce((sum, match) => sum + (match.scoreHome ?? 0), 0);
    const goalsAgainst = finishedMatches.reduce((sum, match) => sum + (match.scoreAway ?? 0), 0);
    const distinctSeasons = Array.from(new Set(finishedMatches.map((match) => match.season))).filter(
        (season): season is string => Boolean(season)
    );
    const latestSeason = finishedMatches[0]?.season ?? "temporada atual";
    const points = wins * 3 + draws;
    const totalAvailablePoints = totalMatches * 3;
    const aproveitamento = totalAvailablePoints > 0 ? Math.round((points / totalAvailablePoints) * 100) : 0;
    const goalsAverage = totalMatches > 0 ? (goalsFor / totalMatches).toFixed(1).replace(".", ",") : "0,0";
    const goalBalance = goalsFor - goalsAgainst;

    const highlightCards = [
        {
            label: "Partidas finalizadas",
            value: String(totalMatches).padStart(2, "0"),
            description: "Base real de jogos já encerrados e lançados no painel."
        },
        {
            label: "Jogadores ativos",
            value: String(activePlayers).padStart(2, "0"),
            description: "Atletas disponíveis hoje no elenco principal."
        },
        {
            label: "Gols marcados",
            value: String(goalsFor).padStart(2, "0"),
            description: "Produção ofensiva consolidada nas partidas registradas."
        },
        {
            label: "Média por jogo",
            value: goalsAverage,
            description: "Volume ofensivo médio do time por confronto encerrado."
        }
    ];

    return (
        <div className="min-h-screen py-12 lg:py-20">
            <Container>
                <section className="relative overflow-hidden rounded-[2rem] border border-navy-800 bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.22),_transparent_32%),linear-gradient(180deg,rgba(10,22,40,0.96),rgba(6,14,26,1))] px-6 py-8 shadow-[0_28px_60px_rgba(0,0,0,0.24)] sm:px-8 lg:px-12 lg:py-12">
                    <div className="absolute inset-y-0 right-0 hidden w-1/3 bg-[radial-gradient(circle_at_center,_rgba(212,168,67,0.16),_transparent_62%)] lg:block" />
                    <div className="relative max-w-3xl">
                        <Badge variant="gold" className="mb-5">
                            Radar da temporada
                        </Badge>
                        <h1 className="font-display text-4xl font-bold tracking-tight text-cream-100 sm:text-5xl lg:text-6xl">
                            Estatísticas
                        </h1>
                        <p className="mt-4 max-w-2xl text-lg leading-8 text-cream-300">
                            Um panorama vivo do desempenho do Resenha RFC: produção ofensiva, campanha, líderes do elenco e a leitura dos números que contam a temporada.
                        </p>

                        <div className="mt-7 flex flex-wrap gap-3">
                            <Badge variant="outline" className="border-cream-100/10 bg-navy-950/40 px-3 py-1 text-cream-100">
                                {distinctSeasons.length || 1} temporada{distinctSeasons.length === 1 ? "" : "s"} registrada
                                {distinctSeasons.length === 1 ? "" : "s"}
                            </Badge>
                            <Badge variant="outline" className="border-cream-100/10 bg-navy-950/40 px-3 py-1 text-cream-100">
                                Última base: {latestSeason}
                            </Badge>
                            <Badge variant="outline" className="border-cream-100/10 bg-navy-950/40 px-3 py-1 text-cream-100">
                                Aproveitamento: {aproveitamento}%
                            </Badge>
                        </div>
                    </div>
                </section>

                <section className="mt-8 grid gap-4 lg:grid-cols-4">
                    {highlightCards.map((card) => (
                        <Card key={card.label} variant="glass" className="border-cream-100/8">
                            <CardContent className="p-6">
                                <p className="text-xs uppercase tracking-[0.28em] text-cream-300/60">
                                    {card.label}
                                </p>
                                <p className="mt-4 font-display text-4xl font-black text-cream-100">
                                    {card.value}
                                </p>
                                <p className="mt-3 text-sm leading-6 text-cream-300">
                                    {card.description}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </section>

                <section className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,0.95fr)]">
                    <Card variant="glass" className="border-cream-100/8">
                        <CardContent className="p-6">
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                                <div>
                                    <Badge variant="accent" className="mb-4">
                                        Recorte coletivo
                                    </Badge>
                                    <h2 className="font-display text-3xl font-bold tracking-tight text-cream-100">
                                        Campanha consolidada
                                    </h2>
                                    <p className="mt-3 max-w-2xl text-sm leading-7 text-cream-300">
                                        Resultado acumulado das partidas encerradas e registradas no sistema, com foco em desempenho, saldo e constância competitiva.
                                    </p>
                                </div>

                                <div className="rounded-2xl border border-cream-100/10 bg-navy-950/45 px-4 py-3 text-right">
                                    <p className="text-xs uppercase tracking-[0.26em] text-cream-300/60">
                                        Saldo de gols
                                    </p>
                                    <p className="mt-2 font-display text-3xl font-black text-cream-100">
                                        {goalBalance >= 0 ? "+" : ""}
                                        {goalBalance}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-8 grid gap-3 sm:grid-cols-3">
                                <div className="rounded-2xl border border-cream-100/10 bg-navy-950/50 p-4">
                                    <p className="text-xs uppercase tracking-[0.26em] text-cream-300/60">Vitórias</p>
                                    <p className="mt-3 font-display text-3xl font-bold text-cream-100">{wins}</p>
                                </div>
                                <div className="rounded-2xl border border-cream-100/10 bg-navy-950/50 p-4">
                                    <p className="text-xs uppercase tracking-[0.26em] text-cream-300/60">Empates</p>
                                    <p className="mt-3 font-display text-3xl font-bold text-cream-100">{draws}</p>
                                </div>
                                <div className="rounded-2xl border border-cream-100/10 bg-navy-950/50 p-4">
                                    <p className="text-xs uppercase tracking-[0.26em] text-cream-300/60">Derrotas</p>
                                    <p className="mt-3 font-display text-3xl font-bold text-cream-100">{losses}</p>
                                </div>
                            </div>

                            <div className="mt-6">
                                <div className="mb-3 flex items-center justify-between text-xs uppercase tracking-[0.24em] text-cream-300/60">
                                    <span>Aproveitamento</span>
                                    <span>{aproveitamento}%</span>
                                </div>
                                <div className="h-3 overflow-hidden rounded-full bg-navy-950">
                                    <div
                                        className="h-full rounded-full bg-gradient-to-r from-blue-500 via-blue-400 to-gold-400"
                                        style={{ width: `${Math.max(aproveitamento, 3)}%` }}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card variant="glass" className="border-cream-100/8">
                        <CardContent className="flex h-full flex-col justify-between p-6">
                            <div>
                                <Badge variant="outline" className="mb-4 border-cream-100/10 bg-navy-950/40 text-cream-100">
                                    Leitura rápida
                                </Badge>
                                <h2 className="font-display text-3xl font-bold tracking-tight text-cream-100">
                                    Números que contam o momento
                                </h2>
                            </div>

                            <div className="mt-8 space-y-4">
                                <div className="rounded-2xl border border-cream-100/10 bg-navy-950/50 p-4">
                                    <p className="text-xs uppercase tracking-[0.26em] text-cream-300/60">Gols sofridos</p>
                                    <p className="mt-3 font-display text-3xl font-bold text-cream-100">{goalsAgainst}</p>
                                </div>
                                <div className="rounded-2xl border border-cream-100/10 bg-navy-950/50 p-4">
                                    <p className="text-xs uppercase tracking-[0.26em] text-cream-300/60">Artilheiro atual</p>
                                    <p className="mt-3 font-display text-2xl font-bold text-cream-100">
                                        {goalsRanking[0]?.playerNickname ?? "A definir"}
                                    </p>
                                    <p className="mt-1 text-sm text-cream-300">
                                        {goalsRanking[0] ? `${goalsRanking[0].value} gols` : "Sem gols registrados ainda"}
                                    </p>
                                </div>
                                <div className="rounded-2xl border border-cream-100/10 bg-navy-950/50 p-4">
                                    <p className="text-xs uppercase tracking-[0.26em] text-cream-300/60">Garçom atual</p>
                                    <p className="mt-3 font-display text-2xl font-bold text-cream-100">
                                        {assistsRanking[0]?.playerNickname ?? "A definir"}
                                    </p>
                                    <p className="mt-1 text-sm text-cream-300">
                                        {assistsRanking[0] ? `${assistsRanking[0].value} assistências` : "Sem assistências registradas ainda"}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                <section className="mt-12">
                    <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <div className="max-w-2xl">
                            <Badge variant="outline" className="mb-4 border-cream-100/10 bg-navy-950/40 text-cream-100">
                                Rankings do elenco
                            </Badge>
                            <h2 className="font-display text-3xl font-bold tracking-tight text-cream-100 sm:text-4xl">
                                Quem puxou o time nos números
                            </h2>
                            <p className="mt-3 text-base leading-7 text-cream-300">
                                Os rankings abaixo são atualizados a partir do elenco ativo e das estatísticas registradas por partida.
                            </p>
                        </div>

                        <Button asChild variant="outline" size="lg" className="border-cream-100/10 bg-navy-900/40">
                            <Link href="/jogos">Ver calendário completo</Link>
                        </Button>
                    </div>

                    <EstatisticasView
                        goalsRanking={goalsRanking}
                        assistsRanking={assistsRanking}
                        cardsRanking={cardsRanking}
                    />
                </section>
            </Container>
        </div>
    );
}
