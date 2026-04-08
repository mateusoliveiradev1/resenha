import * as React from "react";
import Link from "next/link";
import { Badge, Button, Card } from "@resenha/ui";
import { CalendarClock, Handshake, ShieldCheck, Trophy, Users } from "lucide-react";
import { buildStandings, db, presentMatches, type MatchPresentation } from "@resenha/db";
import { championshipGroups, championshipParticipants, championships, clubs, matches, players, sponsors } from "@resenha/db/schema";
import { asc, count, desc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

const DISPLAY_TIMEZONE = "America/Sao_Paulo";

function formatDate(value?: Date | null) {
    if (!value) {
        return "Sem data definida";
    }

    return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: DISPLAY_TIMEZONE,
    }).format(value);
}

function formatStatus(status?: MatchPresentation["status"] | null) {
    switch (status) {
        case "LIVE":
            return "Ao vivo";
        case "FINISHED":
            return "Finalizada";
        default:
            return "Agendada";
    }
}

function formatPlacement(position?: number | null) {
    if (!position) {
        return "--";
    }

    return `${position}o lugar`;
}

function getFixtureLabel(match?: MatchPresentation | null) {
    if (!match) {
        return "Sem confronto definido";
    }

    return `${match.homeTeam.shortName} x ${match.awayTeam.shortName}`;
}

function getMatchContext(match?: MatchPresentation | null) {
    if (!match) {
        return null;
    }

    return [
        match.type,
        match.competitionName,
        match.phaseLabel ?? match.groupName,
        match.roundLabel,
    ]
        .filter(Boolean)
        .join(" - ");
}

function getResenhaPerspective(match?: MatchPresentation | null) {
    if (!match) {
        return null;
    }

    return {
        scoreHome: match.isResenhaHome ? match.scoreHome : match.scoreAway,
        scoreAway: match.isResenhaHome ? match.scoreAway : match.scoreHome,
        tiebreakHome: match.isResenhaHome ? match.tiebreakHome : match.tiebreakAway,
        tiebreakAway: match.isResenhaHome ? match.tiebreakAway : match.tiebreakHome,
    };
}

function getDecidingScores(match?: MatchPresentation | null) {
    const perspective = getResenhaPerspective(match);

    if (!perspective || perspective.scoreHome == null || perspective.scoreAway == null) {
        return null;
    }

    if (perspective.scoreHome !== perspective.scoreAway) {
        return {
            scoreHome: perspective.scoreHome,
            scoreAway: perspective.scoreAway,
            decidedByTiebreak: false,
        };
    }

    if (
        perspective.tiebreakHome == null ||
        perspective.tiebreakAway == null ||
        perspective.tiebreakHome === perspective.tiebreakAway
    ) {
        return {
            scoreHome: perspective.scoreHome,
            scoreAway: perspective.scoreAway,
            decidedByTiebreak: false,
        };
    }

    return {
        scoreHome: perspective.tiebreakHome,
        scoreAway: perspective.tiebreakAway,
        decidedByTiebreak: true,
    };
}

function getMatchTone(match?: MatchPresentation | null) {
    const decidingScores = getDecidingScores(match);

    if (!decidingScores) {
        return { label: "Sem placar", variant: "outline" as const };
    }

    if (decidingScores.scoreHome > decidingScores.scoreAway) {
        return { label: decidingScores.decidedByTiebreak ? "Vitoria no desempate" : "Vitoria", variant: "success" as const };
    }

    if (decidingScores.scoreHome < decidingScores.scoreAway) {
        return { label: decidingScores.decidedByTiebreak ? "Derrota no desempate" : "Derrota", variant: "danger" as const };
    }

    return { label: "Empate", variant: "warning" as const };
}

export default async function AdminDashboardPage() {
    const [
        [totalPlayers],
        [activePlayers],
        [activeSponsors],
        matchRows,
        clubsData,
        championshipsData,
        participantRows,
        groupRows,
    ] = await Promise.all([
        db.select({ value: count() }).from(players),
        db.select({ value: count() }).from(players).where(eq(players.isActive, true)),
        db.select({ value: count() }).from(sponsors).where(eq(sponsors.isActive, true)),
        db.query.matches.findMany({
            orderBy: [asc(matches.date)],
        }),
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
    });

    const sortedMatches = [...presentedMatches].sort((left, right) => left.date.getTime() - right.date.getTime());
    const resenhaClub = clubsData.find((club) => club.isResenha) ?? null;
    const resenhaMatches = sortedMatches.filter((match) => match.isResenhaMatch);
    const nextResenhaMatch = resenhaMatches.find((match) => match.status !== "FINISHED") ?? null;
    const latestResenhaResult =
        [...resenhaMatches]
            .filter((match) => match.status === "FINISHED" && match.scoreHome != null && match.scoreAway != null)
            .sort((left, right) => right.date.getTime() - left.date.getTime())[0] ?? null;

    const featuredChampionship =
        championshipsData.find((championship) => championship.status === "LIVE") ??
        championshipsData.find((championship) => championship.status === "PLANNED") ??
        championshipsData[0] ??
        null;

    const featuredParticipants = featuredChampionship
        ? participantRows.filter((participant) => participant.championshipId === featuredChampionship.id)
        : [];
    const resenhaParticipant = resenhaClub
        ? featuredParticipants.find((participant) => participant.clubId === resenhaClub.id) ?? null
        : null;
    const featuredGroupId = resenhaParticipant?.championshipGroupId ?? null;
    const featuredGroup = featuredGroupId
        ? groupRows.find((group) => group.id === featuredGroupId) ?? null
        : null;
    const featuredChampionshipMatches = featuredChampionship
        ? sortedMatches.filter((match) => match.championshipId === featuredChampionship.id)
        : [];
    const finishedChampionshipMatches = featuredChampionshipMatches.filter((match) => match.status === "FINISHED");
    const nextChampionshipMatch = featuredChampionshipMatches.find((match) => match.status !== "FINISHED") ?? null;
    const standings = featuredChampionship
        ? buildStandings({
            championship: featuredChampionship,
            participants: (featuredGroupId
                ? featuredParticipants.filter((participant) => participant.championshipGroupId === featuredGroupId)
                : featuredParticipants
            ).map((participant) => ({ clubId: participant.clubId })),
            matches: featuredChampionshipMatches,
            clubs: clubsData,
            championshipGroupId: featuredGroupId,
        })
        : [];
    const resenhaStanding = resenhaClub
        ? standings.find((row) => row.clubId === resenhaClub.id) ?? null
        : null;
    const standingsPreview = standings.slice(0, 6);
    const latestResultTone = getMatchTone(latestResenhaResult);
    const latestResultScores = getResenhaPerspective(latestResenhaResult);

    const quickStats = [
        {
            label: "Jogadores ativos",
            value: String(activePlayers.value),
            detail: `${totalPlayers.value} cadastrados no banco`,
            icon: Users,
        },
        {
            label: "Clubes na competicao",
            value: featuredChampionship ? String(featuredParticipants.length) : "--",
            detail: featuredChampionship ? featuredChampionship.name : "Nenhum campeonato em foco",
            icon: Trophy,
        },
        {
            label: "Jogos encerrados",
            value: featuredChampionship ? `${finishedChampionshipMatches.length}/${featuredChampionshipMatches.length}` : "--",
            detail: "Encerrados / cadastrados no campeonato em foco",
            icon: CalendarClock,
        },
        {
            label: "Resenha na tabela",
            value: formatPlacement(resenhaStanding?.position),
            detail: resenhaStanding ? `${resenhaStanding.points} pts - SG ${resenhaStanding.goalDifference}` : "Posicao ainda indisponivel",
            icon: ShieldCheck,
        },
        {
            label: "Patrocinadores ativos",
            value: String(activeSponsors.value),
            detail: "Marcas exibidas no site e no ecossistema do clube",
            icon: Handshake,
        },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="font-display text-3xl font-bold tracking-tight text-cream-100">
                    Dashboard
                </h1>
                <p className="mt-2 text-cream-300">
                    Painel vivo do admin com leitura real das partidas do Resenha e do campeonato atual.
                </p>
            </div>

            <Card className="overflow-hidden border-navy-800 bg-[linear-gradient(135deg,rgba(15,23,42,1),rgba(8,15,29,1))]">
                <div className="grid gap-0 lg:grid-cols-[1.3fr_0.95fr]">
                    <div className="border-b border-navy-800 px-6 py-6 lg:border-b-0 lg:border-r">
                        <div className="flex flex-wrap items-center gap-3">
                            <Badge variant="accent">Painel operacional</Badge>
                            <Badge variant="outline">{activePlayers.value} ativos</Badge>
                            <Badge variant="outline">
                                {featuredChampionship ? `${featuredParticipants.length} clubes no campeonato` : "Sem campeonato em foco"}
                            </Badge>
                            <Badge variant="outline">
                                {featuredChampionship ? `${finishedChampionshipMatches.length} jogos encerrados` : "Nenhum jogo encerrado"}
                            </Badge>
                            <Badge variant="outline">{activeSponsors.value} patrocinadores no ar</Badge>
                        </div>

                        <div className="mt-6 space-y-4">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-400">
                                    Proximo jogo do Resenha
                                </p>
                                <h2 className="mt-2 font-display text-3xl text-cream-100">
                                    {nextResenhaMatch ? `Resenha x ${nextResenhaMatch.opponentName}` : "Nenhuma partida pendente"}
                                </h2>
                                <p className="mt-2 max-w-2xl text-sm text-cream-300">
                                    {nextResenhaMatch
                                        ? `${getMatchContext(nextResenhaMatch) ?? "Partida cadastrada"} - ${formatDate(nextResenhaMatch.date)} - ${nextResenhaMatch.location}`
                                        : "Cadastre a proxima partida do Resenha para destravar a agenda do painel."}
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-3">
                                <Link
                                    href="/partidas/novo"
                                    className="inline-flex items-center gap-2 rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-300 transition-colors hover:bg-blue-500/20"
                                >
                                    Nova partida
                                </Link>
                                <Link
                                    href="/partidas"
                                    className="inline-flex items-center gap-2 rounded-xl border border-gold-500/30 bg-gold-500/10 px-4 py-2 text-sm font-semibold text-gold-300 transition-colors hover:bg-gold-500/20"
                                >
                                    Editar partidas
                                </Link>
                                <Link
                                    href="/campeonatos"
                                    className="inline-flex items-center gap-2 rounded-xl border border-cream-100/15 bg-cream-100/5 px-4 py-2 text-sm font-semibold text-cream-100 transition-colors hover:bg-cream-100/10"
                                >
                                    Campeonatos
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="px-6 py-6">
                        <div className="rounded-2xl border border-navy-800 bg-navy-950/70 p-5">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold-300">
                                        Campeonato em foco
                                    </p>
                                    <h3 className="mt-2 font-display text-2xl text-cream-100">
                                        {featuredChampionship?.name ?? "Nenhum campeonato encontrado"}
                                    </h3>
                                    <p className="mt-2 text-sm text-cream-300">
                                        {featuredChampionship
                                            ? [
                                                featuredChampionship.seasonLabel,
                                                featuredGroup?.name ? `Grupo ${featuredGroup.name}` : null,
                                                featuredChampionship.status === "LIVE" ? "Em andamento" : formatStatus(nextChampionshipMatch?.status ?? "SCHEDULED"),
                                            ]
                                                .filter(Boolean)
                                                .join(" - ")
                                            : "Cadastre ou ative um campeonato para acompanhar a tabela aqui."}
                                    </p>
                                </div>
                                <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 px-4 py-3 text-right">
                                    <p className="text-xs uppercase tracking-[0.24em] text-cream-300/60">Resenha</p>
                                    <p className="mt-2 font-display text-2xl font-black text-cream-100">
                                        {formatPlacement(resenhaStanding?.position)}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-5 rounded-2xl border border-navy-800 bg-navy-900/70 p-4">
                                <p className="text-xs uppercase tracking-[0.22em] text-cream-300/60">Proximo jogo do campeonato</p>
                                <p className="mt-3 text-lg font-semibold text-cream-100">
                                    {getFixtureLabel(nextChampionshipMatch)}
                                </p>
                                <p className="mt-2 text-sm text-cream-300">
                                    {nextChampionshipMatch
                                        ? `${formatDate(nextChampionshipMatch.date)} - ${nextChampionshipMatch.location}`
                                        : "Nenhum jogo pendente nesse campeonato."}
                                </p>
                            </div>

                            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                <div className="rounded-xl border border-navy-800 bg-navy-900/80 p-3">
                                    <p className="text-[11px] uppercase tracking-[0.22em] text-cream-300">Status</p>
                                    <p className="mt-2 font-semibold text-cream-100">
                                        {featuredChampionship ? featuredChampionship.status : "INDISPONIVEL"}
                                    </p>
                                </div>
                                <div className="rounded-xl border border-navy-800 bg-navy-900/80 p-3">
                                    <p className="text-[11px] uppercase tracking-[0.22em] text-cream-300">Jogos</p>
                                    <p className="mt-2 font-semibold text-cream-100">
                                        {featuredChampionship ? `${finishedChampionshipMatches.length}/${featuredChampionshipMatches.length}` : "--"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
                {quickStats.map((item) => {
                    const Icon = item.icon;

                    return (
                        <Card key={item.label} className="border-navy-800 bg-navy-900/90 p-5">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-sm text-cream-300">{item.label}</p>
                                    <p className="mt-3 font-display text-3xl text-cream-100">{item.value}</p>
                                </div>
                                <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-3 text-blue-300">
                                    <Icon className="h-5 w-5" />
                                </div>
                            </div>
                            <p className="mt-4 text-sm text-cream-300">{item.detail}</p>
                        </Card>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.05fr_0.95fr]">
                <Card className="border-navy-800 bg-navy-900 p-6">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-400">Ultimo resultado do Resenha</p>
                            <h3 className="mt-2 font-display text-2xl text-cream-100">
                                {latestResenhaResult ? `Resenha x ${latestResenhaResult.opponentName}` : "Sem historico ainda"}
                            </h3>
                            <p className="mt-2 text-sm text-cream-300">
                                {latestResenhaResult
                                    ? `${getMatchContext(latestResenhaResult) ?? "Partida encerrada"} - ${formatDate(latestResenhaResult.date)}`
                                    : "O historico aparece assim que a primeira partida for encerrada com placar."}
                            </p>
                        </div>
                        <Badge variant={latestResultTone.variant}>{latestResultTone.label}</Badge>
                    </div>

                    {latestResenhaResult && latestResultScores ? (
                        <>
                            <div className="mt-8 flex items-center justify-center gap-6 rounded-2xl border border-navy-800 bg-navy-950/70 px-6 py-8">
                                <div className="text-center">
                                    <p className="font-display text-5xl text-cream-100">{latestResultScores.scoreHome ?? 0}</p>
                                    <p className="mt-2 text-xs uppercase tracking-[0.24em] text-cream-300">Resenha</p>
                                </div>
                                <span className="font-display text-3xl text-navy-500">X</span>
                                <div className="text-center">
                                    <p className="font-display text-5xl text-cream-100">{latestResultScores.scoreAway ?? 0}</p>
                                    <p className="mt-2 text-xs uppercase tracking-[0.24em] text-cream-300">{latestResenhaResult.opponentName}</p>
                                </div>
                            </div>
                            {latestResultScores.tiebreakHome != null && latestResultScores.tiebreakAway != null && (
                                <p className="mt-4 text-sm text-cream-300">
                                    Desempate: {latestResultScores.tiebreakHome} x {latestResultScores.tiebreakAway}
                                </p>
                            )}
                        </>
                    ) : (
                        <div className="mt-6 rounded-2xl border border-dashed border-navy-800 bg-navy-950/60 px-4 py-8 text-center text-sm text-cream-300">
                            Ainda nao existe um resultado validado para mostrar aqui.
                        </div>
                    )}
                </Card>

                <Card className="border-navy-800 bg-navy-900 p-6">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-400">Tabela rapida</p>
                            <h3 className="mt-2 font-display text-2xl text-cream-100">
                                {featuredGroup?.name ? `Grupo ${featuredGroup.name}` : featuredChampionship?.name ?? "Sem tabela"}
                            </h3>
                            <p className="mt-2 text-sm text-cream-300">
                                Posicoes reais calculadas a partir dos jogos finalizados salvos no banco.
                            </p>
                        </div>
                        <ShieldCheck className="h-5 w-5 text-gold-300" />
                    </div>

                    {standingsPreview.length > 0 ? (
                        <div className="mt-6 space-y-3">
                            {standingsPreview.map((row) => {
                                const isResenhaRow = resenhaClub?.id === row.clubId;

                                return (
                                    <div
                                        key={row.clubId}
                                        className={`rounded-2xl border px-4 py-4 ${
                                            isResenhaRow
                                                ? "border-gold-500/30 bg-gold-500/10"
                                                : "border-navy-800 bg-navy-950/70"
                                        }`}
                                    >
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex min-w-0 items-center gap-3">
                                                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-navy-700 bg-navy-900 text-sm font-bold text-cream-100">
                                                    {row.position}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="truncate font-semibold text-cream-100">{row.clubName}</p>
                                                    <p className="text-xs uppercase tracking-[0.2em] text-cream-300">
                                                        {row.played}J - {row.wins}V - {row.draws}E - {row.losses}D
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-display text-2xl text-cream-100">{row.points}</p>
                                                <p className="text-xs uppercase tracking-[0.2em] text-cream-300">
                                                    SG {row.goalDifference >= 0 ? "+" : ""}{row.goalDifference}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="mt-6 rounded-2xl border border-dashed border-navy-800 bg-navy-950/60 px-4 py-8 text-center text-sm text-cream-300">
                            Esse campeonato ainda nao tem tabela disponivel para exibir.
                        </div>
                    )}

                    <div className="mt-6">
                        <Button asChild variant="outline" className="border-cream-100/10 bg-navy-900/40">
                            <Link href="/campeonatos">Abrir campeonatos</Link>
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    );
}
