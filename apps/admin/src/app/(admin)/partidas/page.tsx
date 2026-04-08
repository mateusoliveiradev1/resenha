import * as React from "react";
import { presentMatches } from "@resenha/db";
import { Badge, Button, Card, CardContent } from "@resenha/ui";
import { Plus, Trophy } from "lucide-react";
import Link from "next/link";
import { db } from "@resenha/db";
import { championshipGroups, championshipParticipants, championships, clubs, matches } from "@resenha/db/schema";
import { asc, desc } from "drizzle-orm";
import { PartidasTable } from "./PartidasTable";

export const dynamic = "force-dynamic";

function buildContextLine(parts: Array<string | null | undefined>) {
    return parts.filter(Boolean).join(" - ");
}

export default async function PartidasListPage() {
    const [matchRows, clubsData, championshipsData, participantRows, groupRows] = await Promise.all([
        db.select().from(matches).orderBy(desc(matches.date)),
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
    }).sort((left, right) => right.date.getTime() - left.date.getTime());

    const allMatches = presentedMatches.map((presented) => {
        const leftScore = presented.isResenhaMatch
            ? (presented.isResenhaHome ? presented.scoreHome : presented.scoreAway)
            : presented.scoreHome;
        const rightScore = presented.isResenhaMatch
            ? (presented.isResenhaHome ? presented.scoreAway : presented.scoreHome)
            : presented.scoreAway;
        const leftTiebreak = presented.isResenhaMatch
            ? (presented.isResenhaHome ? presented.tiebreakHome : presented.tiebreakAway)
            : presented.tiebreakHome;
        const rightTiebreak = presented.isResenhaMatch
            ? (presented.isResenhaHome ? presented.tiebreakAway : presented.tiebreakHome)
            : presented.tiebreakAway;

        return {
            id: presented.id,
            scope: presented.isResenhaMatch ? "RESHENHA" as const : "CAMPEONATO" as const,
            displayName: presented.isResenhaMatch
                ? `Resenha x ${presented.opponentName}`
                : `${presented.homeTeam.shortName} x ${presented.awayTeam.shortName}`,
            contextLine: buildContextLine([
                presented.competitionName,
                presented.phaseLabel ?? presented.groupName,
                presented.roundLabel,
                presented.matchday ? `Jogo ${presented.matchday}` : null,
            ]),
            competitionName: presented.competitionName,
            type: presented.type,
            date: presented.date,
            location: presented.location,
            status: presented.status,
            category: presented.category,
            scoreLabel:
                leftScore != null && rightScore != null
                    ? `${leftScore} - ${rightScore}${leftTiebreak != null && rightTiebreak != null ? ` (Pen. ${leftTiebreak} - ${rightTiebreak})` : ""}`
                    : null,
        };
    });

    const resenhaMatches = allMatches.filter((match) => match.scope === "RESHENHA");
    const championshipMatches = allMatches.filter((match) => match.scope === "CAMPEONATO");
    const pendingMatches = allMatches.filter((match) => match.status !== "FINISHED");

    const statCards = [
        {
            label: "Total de partidas",
            value: String(allMatches.length),
            detail: "Tudo o que ja foi salvo no calendario do sistema.",
        },
        {
            label: "Jogos do Resenha",
            value: String(resenhaMatches.length),
            detail: "Partidas que impactam agenda, home e historico do clube.",
        },
        {
            label: "Jogos do campeonato",
            value: String(championshipMatches.length),
            detail: "Confrontos gerais entre clubes da competicao.",
        },
        {
            label: "Pendentes de edicao",
            value: String(pendingMatches.length),
            detail: "Partidas ainda abertas para placar, status ou ajustes.",
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="font-display text-3xl font-bold tracking-tight text-cream-100">
                        Partidas
                    </h1>
                    <p className="mt-2 text-sm text-cream-300">
                        Edite com clareza os jogos do Resenha e os confrontos gerais do campeonato, tudo com nomes e contexto reais.
                    </p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <Link href="/campeonatos" className="shrink-0">
                        <Button variant="outline">
                            <Trophy className="mr-2 h-4 w-4" />
                            Campeonatos
                        </Button>
                    </Link>
                    <Link href="/partidas/novo" className="shrink-0">
                        <Button variant="primary">
                            <Plus className="mr-2 h-4 w-4" />
                            Nova Partida
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                {statCards.map((card) => (
                    <Card key={card.label} className="border-navy-800 bg-navy-900/90">
                        <CardContent className="p-5">
                            <p className="text-sm text-cream-300">{card.label}</p>
                            <p className="mt-3 font-display text-3xl text-cream-100">{card.value}</p>
                            <p className="mt-4 text-sm text-cream-300">{card.detail}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="border-navy-800 bg-navy-900">
                <CardContent className="space-y-5 p-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <div className="flex items-center gap-3">
                                <Badge variant="gold">Resenha</Badge>
                                <p className="text-xs uppercase tracking-[0.22em] text-cream-300/70">
                                    Agenda do clube
                                </p>
                            </div>
                            <h2 className="mt-3 font-display text-2xl text-cream-100">Partidas do Resenha</h2>
                            <p className="mt-2 max-w-3xl text-sm text-cream-300">
                                Aqui ficam os jogos que afetam a agenda, a home, os resultados e as estatisticas do clube.
                            </p>
                        </div>
                    </div>

                    <PartidasTable
                        data={resenhaMatches}
                        emptyState="Nenhuma partida do Resenha foi cadastrada ainda."
                    />
                </CardContent>
            </Card>

            <Card className="border-navy-800 bg-navy-900">
                <CardContent className="space-y-5 p-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <div className="flex items-center gap-3">
                                <Badge variant="accent">Campeonato</Badge>
                                <p className="text-xs uppercase tracking-[0.22em] text-cream-300/70">
                                    Tabela e mata-mata
                                </p>
                            </div>
                            <h2 className="mt-3 font-display text-2xl text-cream-100">Partidas gerais da competicao</h2>
                            <p className="mt-2 max-w-3xl text-sm text-cream-300">
                                Use esta lista para ajustar jogos entre outros clubes e manter classificacao, cruzamentos e fases atualizados com dados reais.
                            </p>
                        </div>
                    </div>

                    <PartidasTable
                        data={championshipMatches}
                        emptyState="Nenhum confronto geral do campeonato foi cadastrado ainda."
                    />
                </CardContent>
            </Card>
        </div>
    );
}
