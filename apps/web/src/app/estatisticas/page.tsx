import type { Metadata } from "next";
import Link from "next/link";
import { Badge, Button, Card, CardContent, Container } from "@resenha/ui";
import { db, presentMatches } from "@resenha/db";
import { championshipGroups, championshipParticipants, championships, clubs, matches, matchStats, players } from "@resenha/db/schema";
import { asc, desc, eq } from "drizzle-orm";
import { type RankItem } from "@/components/estatisticas/RankingList";
import { toDisplayMatch } from "@/lib/matches";
import { EstatisticasView } from "./EstatisticasView";
import { createPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = createPageMetadata({
    title: "Estatisticas",
    description:
        "Veja as estatisticas do Resenha RFC com campanha, gols, assistencias, rankings do elenco e leitura de desempenho da temporada.",
    path: "/estatisticas",
    keywords: ["estatisticas", "gols", "assistencias", "campanha", "desempenho", "ranking"],
});

type ScopeKey = "GERAL" | "TEMPORADA_ATUAL" | "CAMPO" | "QUADRA";

type ScopeSummary = {
    id: ScopeKey;
    label: string;
    description: string;
    matches: number;
    wins: number;
    draws: number;
    losses: number;
    goalsFor: number;
    goalsAgainst: number;
    goalBalance: number;
    assists: number;
    cards: number;
    minutes: number;
    efficiency: number;
};

type PlayerAggregate = {
    id: string;
    playerName: string;
    playerNickname: string;
    playerPhotoUrl?: string | null;
    goals: number;
    assists: number;
    cards: number;
    minutes: number;
};

const scopeMeta: Record<ScopeKey, { label: string; description: string }> = {
    GERAL: {
        label: "Geral",
        description: "Tudo o que ja foi registrado no sistema, incluindo o historico legado do elenco.",
    },
    TEMPORADA_ATUAL: {
        label: "Temporada atual",
        description: "Recorte automatico do ano corrente para acompanhar a fase mais recente do time.",
    },
    CAMPO: {
        label: "Campo",
        description: "Somente partidas de campo, com leitura propria de campanha e volume ofensivo.",
    },
    QUADRA: {
        label: "Quadra",
        description: "Somente partidas de futsal/quadra, separando o comportamento da equipe na modalidade.",
    },
};

function createPlayerAggregate(player: typeof players.$inferSelect, includeLegacyBaseline: boolean): PlayerAggregate {
    return {
        id: player.id,
        playerName: player.name,
        playerNickname: player.nickname,
        playerPhotoUrl: player.photoUrl,
        goals: includeLegacyBaseline ? player.goals ?? 0 : 0,
        assists: includeLegacyBaseline ? player.assists ?? 0 : 0,
        cards: 0,
        minutes: 0,
    };
}

function buildRanking(data: Map<string, PlayerAggregate>, field: keyof Pick<PlayerAggregate, "goals" | "assists" | "cards" | "minutes">): RankItem[] {
    return [...data.values()]
        .map((item) => ({
            id: item.id,
            playerName: item.playerName,
            playerNickname: item.playerNickname,
            playerPhotoUrl: item.playerPhotoUrl,
            value: item[field],
        }))
        .filter((item) => item.value > 0)
        .sort((left, right) => right.value - left.value || left.playerNickname.localeCompare(right.playerNickname))
        .slice(0, 10);
}

function buildScopeSummary(id: ScopeKey, matchesList: ReturnType<typeof toDisplayMatch>[], assists: number, cards: number, minutes: number): ScopeSummary {
    const wins = matchesList.filter((match) => (match.scoreHome ?? 0) > (match.scoreAway ?? 0)).length;
    const draws = matchesList.filter((match) => (match.scoreHome ?? 0) === (match.scoreAway ?? 0)).length;
    const losses = Math.max(matchesList.length - wins - draws, 0);
    const goalsFor = matchesList.reduce((sum, match) => sum + (match.scoreHome ?? 0), 0);
    const goalsAgainst = matchesList.reduce((sum, match) => sum + (match.scoreAway ?? 0), 0);
    const points = wins * 3 + draws;
    const totalAvailablePoints = matchesList.length * 3;

    return {
        id,
        label: scopeMeta[id].label,
        description: scopeMeta[id].description,
        matches: matchesList.length,
        wins,
        draws,
        losses,
        goalsFor,
        goalsAgainst,
        goalBalance: goalsFor - goalsAgainst,
        assists,
        cards,
        minutes,
        efficiency: totalAvailablePoints > 0 ? Math.round((points / totalAvailablePoints) * 100) : 0,
    };
}

export default async function EstatisticasPage() {
    const currentYear = new Date().getFullYear();

    const [matchRows, playerRows, matchStatsRows, clubsData, championshipsData, participantRows, groupRows] = await Promise.all([
        db.query.matches.findMany({
            where: eq(matches.status, "FINISHED"),
            orderBy: [desc(matches.date)],
        }),
        db.query.players.findMany({
            where: eq(players.isActive, true),
            orderBy: [asc(players.shirtNumber)],
        }),
        db.query.matchStats.findMany(),
        db.query.clubs.findMany({
            orderBy: [asc(clubs.name)],
        }),
        db.query.championships.findMany({
            orderBy: [desc(championships.startsAt), asc(championships.name)],
        }),
        db.query.championshipParticipants.findMany(),
        db.query.championshipGroups.findMany({
            orderBy: [asc(championshipGroups.displayOrder), asc(championshipGroups.name)],
        }),
    ]);

    const presentedMatches = presentMatches({
        matches: matchRows,
        clubs: clubsData,
        championships: championshipsData,
        participants: participantRows,
        groups: groupRows,
    })
        .filter((match) => match.isResenhaMatch && match.scoreHome != null && match.scoreAway != null);

    const displayedMatches = presentedMatches.map((match) => toDisplayMatch(match));
    const displayedMatchById = new Map(displayedMatches.map((match) => [match.id, match]));

    const playerAggregates: Record<ScopeKey, Map<string, PlayerAggregate>> = {
        GERAL: new Map(),
        TEMPORADA_ATUAL: new Map(),
        CAMPO: new Map(),
        QUADRA: new Map(),
    };

    for (const player of playerRows) {
        playerAggregates.GERAL.set(player.id, createPlayerAggregate(player, true));
        playerAggregates.TEMPORADA_ATUAL.set(player.id, createPlayerAggregate(player, false));
        playerAggregates.CAMPO.set(player.id, createPlayerAggregate(player, false));
        playerAggregates.QUADRA.set(player.id, createPlayerAggregate(player, false));
    }

    const scopeMatches: Record<ScopeKey, ReturnType<typeof toDisplayMatch>[]> = {
        GERAL: [],
        TEMPORADA_ATUAL: [],
        CAMPO: [],
        QUADRA: [],
    };
    const scopeAssistTotals: Record<ScopeKey, number> = { GERAL: 0, TEMPORADA_ATUAL: 0, CAMPO: 0, QUADRA: 0 };
    const scopeCardTotals: Record<ScopeKey, number> = { GERAL: 0, TEMPORADA_ATUAL: 0, CAMPO: 0, QUADRA: 0 };
    const scopeMinuteTotals: Record<ScopeKey, number> = { GERAL: 0, TEMPORADA_ATUAL: 0, CAMPO: 0, QUADRA: 0 };

    const scopesByMatchId = new Map<string, ScopeKey[]>();

    for (const match of displayedMatches) {
        const relatedRawMatch = matchRows.find((item) => item.id === match.id);
        const scopes: ScopeKey[] = ["GERAL"];

        if (match.date.getFullYear() === currentYear) {
            scopes.push("TEMPORADA_ATUAL");
        }

        if (relatedRawMatch?.type === "CAMPO") {
            scopes.push("CAMPO");
        } else {
            scopes.push("QUADRA");
        }

        scopesByMatchId.set(match.id, scopes);

        for (const scope of scopes) {
            scopeMatches[scope].push(match);
        }
    }

    const statTotalsByMatchId = new Map<string, { assists: number; cards: number; minutes: number }>();

    for (const stat of matchStatsRows) {
        const current = statTotalsByMatchId.get(stat.matchId) ?? { assists: 0, cards: 0, minutes: 0 };
        current.assists += stat.assists ?? 0;
        current.cards += (stat.yellowCards ?? 0) + (stat.redCards ?? 0);
        current.minutes += stat.minutesPlayed ?? 0;
        statTotalsByMatchId.set(stat.matchId, current);
    }

    for (const stat of matchStatsRows) {
        const match = displayedMatchById.get(stat.matchId);
        const scopes = scopesByMatchId.get(stat.matchId);

        if (!match || !scopes) {
            continue;
        }

        for (const scope of scopes) {
            const aggregate = playerAggregates[scope].get(stat.playerId);

            if (!aggregate) {
                continue;
            }

            aggregate.goals += stat.goals ?? 0;
            aggregate.assists += stat.assists ?? 0;
            aggregate.cards += (stat.yellowCards ?? 0) + (stat.redCards ?? 0);
            aggregate.minutes += stat.minutesPlayed ?? 0;

            scopeAssistTotals[scope] += stat.assists ?? 0;
            scopeCardTotals[scope] += (stat.yellowCards ?? 0) + (stat.redCards ?? 0);
            scopeMinuteTotals[scope] += stat.minutesPlayed ?? 0;
        }
    }

    const scopeSummaries = (Object.keys(scopeMeta) as ScopeKey[]).map((scope) =>
        buildScopeSummary(scope, scopeMatches[scope], scopeAssistTotals[scope], scopeCardTotals[scope], scopeMinuteTotals[scope]),
    );

    const generalSummary = scopeSummaries.find((scope) => scope.id === "GERAL")!;
    const currentSeasonSummary = scopeSummaries.find((scope) => scope.id === "TEMPORADA_ATUAL")!;

    const goalsRanking = buildRanking(playerAggregates.GERAL, "goals");
    const assistsRanking = buildRanking(playerAggregates.GERAL, "assists");
    const cardsRanking = buildRanking(playerAggregates.GERAL, "cards");
    const minutesRanking = buildRanking(playerAggregates.GERAL, "minutes");

    const championshipSummaries = [...presentedMatches]
        .filter((match) => match.category === "CHAMPIONSHIP" && match.competitionName)
        .reduce((map, match) => {
            const displayMatch = toDisplayMatch(match);
            const totals = statTotalsByMatchId.get(match.id) ?? { assists: 0, cards: 0, minutes: 0 };
            const current = map.get(match.competitionName!) ?? {
                name: match.competitionName!,
                matches: 0,
                wins: 0,
                draws: 0,
                losses: 0,
                goalsFor: 0,
                goalsAgainst: 0,
                assists: 0,
                cards: 0,
                minutes: 0,
            };

            current.matches += 1;
            current.goalsFor += displayMatch.scoreHome ?? 0;
            current.goalsAgainst += displayMatch.scoreAway ?? 0;
            current.assists += totals.assists;
            current.cards += totals.cards;
            current.minutes += totals.minutes;

            if ((displayMatch.scoreHome ?? 0) > (displayMatch.scoreAway ?? 0)) {
                current.wins += 1;
            } else if ((displayMatch.scoreHome ?? 0) < (displayMatch.scoreAway ?? 0)) {
                current.losses += 1;
            } else {
                current.draws += 1;
            }

            map.set(match.competitionName!, current);
            return map;
        }, new Map<string, {
            name: string;
            matches: number;
            wins: number;
            draws: number;
            losses: number;
            goalsFor: number;
            goalsAgainst: number;
            assists: number;
            cards: number;
            minutes: number;
        }>());

    const highlightCards = [
        {
            label: "Partidas finalizadas",
            value: String(generalSummary.matches).padStart(2, "0"),
            description: "Base real de jogos encerrados e validados no sistema.",
        },
        {
            label: "Jogadores ativos",
            value: String(playerRows.length).padStart(2, "0"),
            description: "Atletas ativos considerados no ranking atual.",
        },
        {
            label: "Gols marcados",
            value: String(generalSummary.goalsFor).padStart(2, "0"),
            description: "Volume ofensivo consolidado do Resenha em todos os recortes registrados.",
        },
        {
            label: "Assistencias",
            value: String(generalSummary.assists).padStart(2, "0"),
            description: "Contribuicoes diretas para gol somando historico e eventos de partida.",
        },
    ];

    return (
        <div className="min-h-screen py-12 lg:py-20">
            <Container>
                <section className="relative overflow-hidden rounded-[2rem] border border-navy-800 bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.22),_transparent_32%),linear-gradient(180deg,rgba(10,22,40,0.96),rgba(6,14,26,1))] px-6 py-8 shadow-[0_28px_60px_rgba(0,0,0,0.24)] sm:px-8 lg:px-12 lg:py-12">
                    <div className="relative max-w-3xl">
                        <Badge variant="gold" className="mb-5">
                            Radar da temporada
                        </Badge>
                        <h1 className="font-display text-4xl font-bold tracking-tight text-cream-100 sm:text-5xl lg:text-6xl">
                            Estatisticas
                        </h1>
                        <p className="mt-4 max-w-2xl text-lg leading-8 text-cream-300">
                            Um panorama vivo do desempenho do Resenha RFC com recortes gerais, da temporada atual, por modalidade e por campeonato.
                        </p>

                        <div className="mt-7 flex flex-wrap gap-3">
                            <Badge variant="outline" className="border-cream-100/10 bg-navy-950/40 px-3 py-1 text-cream-100">
                                Temporada atual: {currentYear}
                            </Badge>
                            <Badge variant="outline" className="border-cream-100/10 bg-navy-950/40 px-3 py-1 text-cream-100">
                                Aproveitamento atual: {currentSeasonSummary.efficiency}%
                            </Badge>
                            <Badge variant="outline" className="border-cream-100/10 bg-navy-950/40 px-3 py-1 text-cream-100">
                                {championshipSummaries.size} campeonato{championshipSummaries.size === 1 ? "" : "s"} com historico
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

                <section className="mt-8">
                    <div className="mb-6">
                        <Badge variant="accent" className="mb-4">
                            Recortes do time
                        </Badge>
                        <h2 className="font-display text-3xl font-bold tracking-tight text-cream-100">
                            Geral, temporada, campo e quadra
                        </h2>
                    </div>

                    <div className="grid gap-6 xl:grid-cols-2">
                        {scopeSummaries.map((scope) => (
                            <Card key={scope.id} variant="glass" className="border-cream-100/8">
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <h3 className="font-display text-2xl font-bold text-cream-100">{scope.label}</h3>
                                            <p className="mt-2 text-sm leading-6 text-cream-300">{scope.description}</p>
                                        </div>
                                        <div className="rounded-2xl border border-cream-100/10 bg-navy-950/45 px-4 py-3 text-right">
                                            <p className="text-xs uppercase tracking-[0.24em] text-cream-300/60">Aproveitamento</p>
                                            <p className="mt-2 font-display text-3xl font-black text-cream-100">{scope.efficiency}%</p>
                                        </div>
                                    </div>

                                    <div className="mt-6 grid gap-3 sm:grid-cols-4">
                                        <div className="rounded-2xl border border-cream-100/10 bg-navy-950/50 p-4">
                                            <p className="text-xs uppercase tracking-[0.22em] text-cream-300/60">J</p>
                                            <p className="mt-3 font-display text-3xl font-bold text-cream-100">{scope.matches}</p>
                                        </div>
                                        <div className="rounded-2xl border border-cream-100/10 bg-navy-950/50 p-4">
                                            <p className="text-xs uppercase tracking-[0.22em] text-cream-300/60">GP</p>
                                            <p className="mt-3 font-display text-3xl font-bold text-cream-100">{scope.goalsFor}</p>
                                        </div>
                                        <div className="rounded-2xl border border-cream-100/10 bg-navy-950/50 p-4">
                                            <p className="text-xs uppercase tracking-[0.22em] text-cream-300/60">Assist.</p>
                                            <p className="mt-3 font-display text-3xl font-bold text-cream-100">{scope.assists}</p>
                                        </div>
                                        <div className="rounded-2xl border border-cream-100/10 bg-navy-950/50 p-4">
                                            <p className="text-xs uppercase tracking-[0.22em] text-cream-300/60">Cartoes</p>
                                            <p className="mt-3 font-display text-3xl font-bold text-cream-100">{scope.cards}</p>
                                        </div>
                                    </div>

                                    <div className="mt-6 grid gap-3 sm:grid-cols-3">
                                        <div className="rounded-2xl border border-cream-100/10 bg-navy-950/50 p-4">
                                            <p className="text-xs uppercase tracking-[0.22em] text-cream-300/60">Campanha</p>
                                            <p className="mt-3 text-base font-semibold text-cream-100">
                                                {scope.wins}V • {scope.draws}E • {scope.losses}D
                                            </p>
                                        </div>
                                        <div className="rounded-2xl border border-cream-100/10 bg-navy-950/50 p-4">
                                            <p className="text-xs uppercase tracking-[0.22em] text-cream-300/60">Saldo</p>
                                            <p className="mt-3 text-base font-semibold text-cream-100">
                                                {scope.goalBalance >= 0 ? "+" : ""}{scope.goalBalance}
                                            </p>
                                        </div>
                                        <div className="rounded-2xl border border-cream-100/10 bg-navy-950/50 p-4">
                                            <p className="text-xs uppercase tracking-[0.22em] text-cream-300/60">Minutos</p>
                                            <p className="mt-3 text-base font-semibold text-cream-100">
                                                {scope.minutes}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>

                <section className="mt-12">
                    <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <div className="max-w-2xl">
                            <Badge variant="outline" className="mb-4 border-cream-100/10 bg-navy-950/40 text-cream-100">
                                Rankings do elenco
                            </Badge>
                            <h2 className="font-display text-3xl font-bold tracking-tight text-cream-100 sm:text-4xl">
                                Nao so gols: criacao, disciplina e minutagem
                            </h2>
                            <p className="mt-3 text-base leading-7 text-cream-300">
                                O ranking geral mistura o historico legado do elenco com os eventos registrados por partida, sem apagar o que ja existia antes.
                            </p>
                        </div>

                        <Button asChild variant="outline" size="lg" className="border-cream-100/10 bg-navy-900/40">
                            <Link href="/jogos">Ver calendario completo</Link>
                        </Button>
                    </div>

                    <EstatisticasView
                        goalsRanking={goalsRanking}
                        assistsRanking={assistsRanking}
                        cardsRanking={cardsRanking}
                        minutesRanking={minutesRanking}
                    />
                </section>

                <section className="mt-12">
                    <div className="mb-6">
                        <Badge variant="accent" className="mb-4">
                            Por campeonato
                        </Badge>
                        <h2 className="font-display text-3xl font-bold tracking-tight text-cream-100">
                            Historico por competicao
                        </h2>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-2">
                        {[...championshipSummaries.values()].map((competition) => (
                            <Card key={competition.name} variant="glass" className="border-cream-100/8">
                                <CardContent className="p-6">
                                    <h3 className="font-display text-2xl font-bold text-cream-100">{competition.name}</h3>
                                    <div className="mt-5 grid gap-3 sm:grid-cols-4">
                                        <div className="rounded-2xl border border-cream-100/10 bg-navy-950/50 p-4">
                                            <p className="text-xs uppercase tracking-[0.22em] text-cream-300/60">J</p>
                                            <p className="mt-3 font-display text-3xl font-bold text-cream-100">{competition.matches}</p>
                                        </div>
                                        <div className="rounded-2xl border border-cream-100/10 bg-navy-950/50 p-4">
                                            <p className="text-xs uppercase tracking-[0.22em] text-cream-300/60">GP</p>
                                            <p className="mt-3 font-display text-3xl font-bold text-cream-100">{competition.goalsFor}</p>
                                        </div>
                                        <div className="rounded-2xl border border-cream-100/10 bg-navy-950/50 p-4">
                                            <p className="text-xs uppercase tracking-[0.22em] text-cream-300/60">Assist.</p>
                                            <p className="mt-3 font-display text-3xl font-bold text-cream-100">{competition.assists}</p>
                                        </div>
                                        <div className="rounded-2xl border border-cream-100/10 bg-navy-950/50 p-4">
                                            <p className="text-xs uppercase tracking-[0.22em] text-cream-300/60">Cartoes</p>
                                            <p className="mt-3 font-display text-3xl font-bold text-cream-100">{competition.cards}</p>
                                        </div>
                                    </div>

                                    <p className="mt-5 text-sm text-cream-300">
                                        Campanha: {competition.wins}V • {competition.draws}E • {competition.losses}D • SG {competition.goalsFor - competition.goalsAgainst >= 0 ? "+" : ""}{competition.goalsFor - competition.goalsAgainst}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}

                        {championshipSummaries.size === 0 && (
                            <div className="rounded-3xl border border-dashed border-navy-800 bg-navy-900/20 px-6 py-16 text-center lg:col-span-2">
                                <h2 className="font-display text-2xl font-bold text-cream-100">Sem campeonatos finalizados ainda</h2>
                                <p className="mt-3 text-sm text-cream-300">
                                    Assim que os jogos de competicao forem encerrados, este recorte passa a aparecer aqui automaticamente.
                                </p>
                            </div>
                        )}
                    </div>
                </section>
            </Container>
        </div>
    );
}
