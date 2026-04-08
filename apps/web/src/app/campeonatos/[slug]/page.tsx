import { notFound } from "next/navigation";
import Image from "next/image";
import { Badge, Card, CardContent, Container, shouldBypassNextImageOptimization } from "@resenha/ui";
import { buildStandings, db, presentMatches } from "@resenha/db";
import { championshipGroups, championshipParticipants, championships, clubs, matches } from "@resenha/db/schema";
import { asc, eq } from "drizzle-orm";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { MatchCard } from "@/components/jogos/MatchCard";
import { toDisplayMatch } from "@/lib/matches";

export const dynamic = "force-dynamic";
const DISPLAY_TIMEZONE = "America/Sao_Paulo";

function formatFixtureLabel(match: ReturnType<typeof presentMatches>[number]) {
    return `${match.homeTeam.shortName} x ${match.awayTeam.shortName}`;
}

type RecentFormResult = "W" | "D" | "L";
type StandingRowData = ReturnType<typeof buildStandings>[number];

function getRecentFormMap(
    matchesList: ReturnType<typeof presentMatches>,
    championshipId: string,
    championshipGroupId?: string | null,
) {
    const formMap = new Map<string, RecentFormResult[]>();
    const relevantMatches = [...matchesList]
        .filter((match) =>
            match.championshipId === championshipId &&
            match.category === "CHAMPIONSHIP" &&
            match.status === "FINISHED" &&
            match.homeTeam.id &&
            match.awayTeam.id &&
            match.scoreHome != null &&
            match.scoreAway != null &&
            (!championshipGroupId || match.championshipGroupId === championshipGroupId)
        )
        .sort((left, right) => right.date.getTime() - left.date.getTime());

    for (const match of relevantMatches) {
        const homeClubId = match.homeTeam.id;
        const awayClubId = match.awayTeam.id;

        if (!homeClubId || !awayClubId || match.scoreHome == null || match.scoreAway == null) {
            continue;
        }

        const homeResults = formMap.get(homeClubId) ?? [];
        const awayResults = formMap.get(awayClubId) ?? [];
        const homeResult: RecentFormResult =
            match.scoreHome > match.scoreAway ? "W" : match.scoreHome < match.scoreAway ? "L" : "D";
        const awayResult: RecentFormResult =
            match.scoreAway > match.scoreHome ? "W" : match.scoreAway < match.scoreHome ? "L" : "D";

        if (homeResults.length < 5) {
            homeResults.push(homeResult);
            formMap.set(homeClubId, homeResults);
        }

        if (awayResults.length < 5) {
            awayResults.push(awayResult);
            formMap.set(awayClubId, awayResults);
        }
    }

    return formMap;
}

function getFormDotClasses(result: RecentFormResult) {
    switch (result) {
        case "W":
            return "bg-emerald-400";
        case "L":
            return "bg-red-400";
        default:
            return "bg-gold-300";
    }
}

function getDateKeyInSaoPaulo(date: Date) {
    return new Intl.DateTimeFormat("en-CA", {
        timeZone: DISPLAY_TIMEZONE,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(date);
}

function getPositionDeltaMap(args: {
    championship: Awaited<ReturnType<typeof db.query.championships.findFirst>>;
    participants: Array<{ clubId: string }>;
    matches: ReturnType<typeof presentMatches>;
    clubs: Awaited<ReturnType<typeof db.query.clubs.findMany>>;
    currentStandings: ReturnType<typeof buildStandings>;
    championshipGroupId?: string | null;
}) {
    const { championship, participants, matches, clubs, currentStandings, championshipGroupId } = args;

    if (!championship) {
        return new Map<string, number>();
    }

    const completedMatches = matches
        .filter((match) =>
            match.championshipId === championship.id &&
            match.category === "CHAMPIONSHIP" &&
            match.status === "FINISHED" &&
            match.scoreHome != null &&
            match.scoreAway != null &&
            (!championshipGroupId || match.championshipGroupId === championshipGroupId)
        )
        .sort((left, right) => left.date.getTime() - right.date.getTime());

    if (completedMatches.length === 0) {
        return new Map<string, number>();
    }

    let baselineMatches: typeof matches = [];
    const matchesWithMatchday = completedMatches.filter((match) => match.matchday != null);

    if (matchesWithMatchday.length > 0) {
        const currentMatchday = Math.max(...matchesWithMatchday.map((match) => match.matchday ?? 0));
        const previousMatchday = Math.max(
            ...matchesWithMatchday
                .filter((match) => (match.matchday ?? 0) < currentMatchday)
                .map((match) => match.matchday ?? 0),
            -Infinity,
        );

        if (Number.isFinite(previousMatchday)) {
            baselineMatches = matches.filter((match) =>
                match.championshipId === championship.id &&
                (!championshipGroupId || match.championshipGroupId === championshipGroupId) &&
                (match.matchday ?? Infinity) <= previousMatchday
            );
        }
    }

    if (baselineMatches.length === 0) {
        const latestFinishedDay = getDateKeyInSaoPaulo(completedMatches[completedMatches.length - 1].date);
        baselineMatches = matches.filter((match) =>
            match.championshipId === championship.id &&
            (!championshipGroupId || match.championshipGroupId === championshipGroupId) &&
            getDateKeyInSaoPaulo(match.date) < latestFinishedDay
        );
    }

    if (baselineMatches.length === 0) {
        const previousStandings = buildStandings({
            championship,
            participants,
            matches: [],
            clubs,
            championshipGroupId,
        });
        const previousPositions = new Map(previousStandings.map((row) => [row.clubId, row.position]));

        return new Map(
            currentStandings.map((row) => [row.clubId, (previousPositions.get(row.clubId) ?? row.position) - row.position]),
        );
    }

    const previousStandings = buildStandings({
        championship,
        participants,
        matches: baselineMatches,
        clubs,
        championshipGroupId,
    });
    const previousPositions = new Map(previousStandings.map((row) => [row.clubId, row.position]));

    return new Map(
        currentStandings.map((row) => [row.clubId, (previousPositions.get(row.clubId) ?? row.position) - row.position]),
    );
}

function renderPositionDelta(positionDelta: number, compact = false) {
    if (positionDelta > 0) {
        return (
            <span className={`inline-flex items-center gap-1 ${compact ? "text-xs" : "rounded-full bg-emerald-500/10 px-2 py-1 text-xs"} font-semibold text-emerald-300`}>
                <ArrowUpRight className="h-3.5 w-3.5" />
                {positionDelta}
            </span>
        );
    }

    if (positionDelta < 0) {
        return (
            <span className={`inline-flex items-center gap-1 ${compact ? "text-xs" : "rounded-full bg-red-500/10 px-2 py-1 text-xs"} font-semibold text-red-300`}>
                <ArrowDownRight className="h-3.5 w-3.5" />
                {Math.abs(positionDelta)}
            </span>
        );
    }

    return null;
}

function StandingsPanel({
    badgeLabel,
    title,
    description,
    standings,
    positionDeltaMap,
    recentFormMap,
}: {
    badgeLabel: string;
    title: string;
    description: string;
    standings: StandingRowData[];
    positionDeltaMap: Map<string, number>;
    recentFormMap: Map<string, RecentFormResult[]>;
}) {
    return (
        <Card variant="glass" className="border-cream-100/8">
            <CardContent className="p-6">
                <div className="mb-6">
                    <Badge variant="accent" className="mb-4">
                        {badgeLabel}
                    </Badge>
                    <h2 className="font-display text-3xl font-bold tracking-tight text-cream-100">
                        {title}
                    </h2>
                    <p className="mt-3 text-sm leading-7 text-cream-300">
                        {description}
                    </p>
                </div>

                <div className="w-full max-w-full overflow-hidden rounded-3xl border border-navy-800 2xl:hidden">
                    <div className="grid w-full grid-cols-[164px_minmax(0,1fr)]">
                        <div className="border-r border-navy-800 bg-navy-900/95">
                            <table className="w-[164px] table-fixed border-separate border-spacing-0 text-left text-sm">
                                <thead className="bg-navy-950/90 text-cream-300">
                                    <tr>
                                        <th className="h-12 w-[72px] px-3 py-3 align-middle text-xs uppercase tracking-[0.18em]">
                                            Pos
                                        </th>
                                        <th className="h-12 px-3 py-3 align-middle text-xs uppercase tracking-[0.18em]">
                                            Clube
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {standings.map((row) => {
                                        const positionDelta = positionDeltaMap.get(row.clubId) ?? 0;

                                        return (
                                            <tr key={`${row.clubId}-fixed`} className="h-16 border-t border-navy-800 bg-navy-900/95 text-cream-100">
                                                <td className="h-16 w-[72px] px-3 py-4 align-middle">
                                                    <div className="flex items-center gap-1 whitespace-nowrap">
                                                        <span className="font-display text-lg font-bold">{row.position}</span>
                                                        {renderPositionDelta(positionDelta, true)}
                                                    </div>
                                                </td>
                                                <td className="h-16 px-3 py-4 align-middle">
                                                    <p className="truncate whitespace-nowrap font-semibold text-cream-100">{row.clubShortName}</p>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <div className="min-w-0 max-w-full overflow-x-auto overscroll-x-contain">
                            <table className="min-w-[520px] w-max table-fixed border-separate border-spacing-0 text-left text-sm">
                                <thead className="bg-navy-950/90 text-cream-300">
                                    <tr>
                                        <th className="h-12 px-3 py-3 align-middle text-xs uppercase tracking-[0.18em]">P</th>
                                        <th className="h-12 px-3 py-3 align-middle text-xs uppercase tracking-[0.18em]">J</th>
                                        <th className="h-12 px-3 py-3 align-middle text-xs uppercase tracking-[0.18em]">V</th>
                                        <th className="h-12 px-3 py-3 align-middle text-xs uppercase tracking-[0.18em]">E</th>
                                        <th className="h-12 px-3 py-3 align-middle text-xs uppercase tracking-[0.18em]">D</th>
                                        <th className="h-12 px-3 py-3 align-middle text-xs uppercase tracking-[0.18em]">GP</th>
                                        <th className="h-12 px-3 py-3 align-middle text-xs uppercase tracking-[0.18em]">GC</th>
                                        <th className="h-12 px-3 py-3 align-middle text-xs uppercase tracking-[0.18em]">SG</th>
                                        <th className="h-12 px-3 py-3 align-middle text-xs uppercase tracking-[0.18em]">%</th>
                                        <th className="h-12 px-3 py-3 align-middle text-xs uppercase tracking-[0.18em]">Ult. jogos</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {standings.map((row) => {
                                        const recentForm = recentFormMap.get(row.clubId) ?? [];

                                        return (
                                            <tr key={`${row.clubId}-scroll`} className="h-16 border-t border-navy-800 bg-navy-900/60 text-cream-100">
                                                <td className="h-16 whitespace-nowrap px-3 py-4 align-middle">{row.points}</td>
                                                <td className="h-16 whitespace-nowrap px-3 py-4 align-middle">{row.played}</td>
                                                <td className="h-16 whitespace-nowrap px-3 py-4 align-middle">{row.wins}</td>
                                                <td className="h-16 whitespace-nowrap px-3 py-4 align-middle">{row.draws}</td>
                                                <td className="h-16 whitespace-nowrap px-3 py-4 align-middle">{row.losses}</td>
                                                <td className="h-16 whitespace-nowrap px-3 py-4 align-middle">{row.goalsFor}</td>
                                                <td className="h-16 whitespace-nowrap px-3 py-4 align-middle">{row.goalsAgainst}</td>
                                                <td className="h-16 whitespace-nowrap px-3 py-4 align-middle">{row.goalDifference >= 0 ? `+${row.goalDifference}` : row.goalDifference}</td>
                                                <td className="h-16 whitespace-nowrap px-3 py-4 align-middle">{row.efficiency}%</td>
                                                <td className="h-16 whitespace-nowrap px-3 py-4 align-middle">
                                                    <div className="flex items-center gap-2 whitespace-nowrap">
                                                        {recentForm.length > 0 ? recentForm.map((result, index) => (
                                                            <span
                                                                key={`${row.clubId}-mobile-${index}`}
                                                                className={`h-2.5 w-2.5 rounded-full ${getFormDotClasses(result)}`}
                                                            />
                                                        )) : (
                                                            <span className="text-xs text-cream-300/70">Sem jogos</span>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="hidden overflow-hidden rounded-3xl border border-navy-800 2xl:block">
                    <table className="w-full table-fixed text-left text-sm">
                        <colgroup>
                            <col className="w-[7%]" />
                            <col className="w-[31%]" />
                            <col className="w-[4.8%]" />
                            <col className="w-[4.8%]" />
                            <col className="w-[4.8%]" />
                            <col className="w-[4.8%]" />
                            <col className="w-[4.8%]" />
                            <col className="w-[5.5%]" />
                            <col className="w-[5.5%]" />
                            <col className="w-[5.5%]" />
                            <col className="w-[6.5%]" />
                            <col className="w-[14%]" />
                        </colgroup>
                        <thead className="bg-navy-950/80 text-cream-300">
                            <tr>
                                <th className="px-4 py-3 text-xs uppercase tracking-[0.18em]">Pos</th>
                                <th className="px-4 py-3 text-xs uppercase tracking-[0.18em]">Clube</th>
                                <th className="px-2 py-3 text-xs uppercase tracking-[0.18em]">P</th>
                                <th className="px-2 py-3 text-xs uppercase tracking-[0.18em]">J</th>
                                <th className="px-2 py-3 text-xs uppercase tracking-[0.18em]">V</th>
                                <th className="px-2 py-3 text-xs uppercase tracking-[0.18em]">E</th>
                                <th className="px-2 py-3 text-xs uppercase tracking-[0.18em]">D</th>
                                <th className="px-2 py-3 text-xs uppercase tracking-[0.18em]">GP</th>
                                <th className="px-2 py-3 text-xs uppercase tracking-[0.18em]">GC</th>
                                <th className="px-2 py-3 text-xs uppercase tracking-[0.18em]">SG</th>
                                <th className="px-2 py-3 text-xs uppercase tracking-[0.18em]">%</th>
                                <th className="px-4 py-3 text-xs uppercase tracking-[0.18em]">Ult. jogos</th>
                            </tr>
                        </thead>
                        <tbody>
                            {standings.map((row) => {
                                const positionDelta = positionDeltaMap.get(row.clubId) ?? 0;
                                const recentForm = recentFormMap.get(row.clubId) ?? [];

                                return (
                                    <tr key={row.clubId} className="border-t border-navy-800 bg-navy-900/60 text-cream-100">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <span className="font-display text-lg font-bold">{row.position}</span>
                                                {renderPositionDelta(positionDelta, true)}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="relative h-8 w-8 overflow-hidden rounded-full border border-navy-700 bg-navy-950">
                                                    {row.clubLogoUrl ? (
                                                        <Image
                                                            src={row.clubLogoUrl}
                                                            alt={row.clubName}
                                                            fill
                                                            sizes="32px"
                                                            unoptimized={shouldBypassNextImageOptimization(row.clubLogoUrl)}
                                                            className="object-contain p-1"
                                                        />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center font-display text-xs font-black text-cream-100">
                                                            {row.clubShortName.slice(0, 2).toUpperCase()}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="truncate font-semibold">{row.clubName}</p>
                                                    <p className="text-xs uppercase tracking-[0.18em] text-cream-300/70">
                                                        {row.clubShortName}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-2 py-3">{row.points}</td>
                                        <td className="px-2 py-3">{row.played}</td>
                                        <td className="px-2 py-3">{row.wins}</td>
                                        <td className="px-2 py-3">{row.draws}</td>
                                        <td className="px-2 py-3">{row.losses}</td>
                                        <td className="px-2 py-3">{row.goalsFor}</td>
                                        <td className="px-2 py-3">{row.goalsAgainst}</td>
                                        <td className="px-2 py-3">{row.goalDifference >= 0 ? `+${row.goalDifference}` : row.goalDifference}</td>
                                        <td className="px-2 py-3">{row.efficiency}%</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                {recentForm.length > 0 ? recentForm.map((result, index) => (
                                                    <span
                                                        key={`${row.clubId}-${index}`}
                                                        className={`h-2.5 w-2.5 rounded-full ${getFormDotClasses(result)}`}
                                                        title={result === "W" ? "Vitoria" : result === "L" ? "Derrota" : "Empate"}
                                                    />
                                                )) : (
                                                    <span className="text-xs text-cream-300/70">Sem jogos</span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
}

export default async function CampeonatoDetalhePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const now = new Date();

    const championship = await db.query.championships.findFirst({
        where: eq(championships.slug, slug),
    });

    if (!championship) {
        notFound();
    }

    const [clubsData, participantRows, groupRows, matchRows] = await Promise.all([
        db.query.clubs.findMany({
            orderBy: [asc(clubs.name)],
        }),
        db.query.championshipParticipants.findMany({
            where: eq(championshipParticipants.championshipId, championship.id),
            orderBy: [asc(championshipParticipants.displayOrder)],
        }),
        db.query.championshipGroups.findMany({
            where: eq(championshipGroups.championshipId, championship.id),
            orderBy: [asc(championshipGroups.displayOrder), asc(championshipGroups.name)],
        }),
        db.query.matches.findMany({
            where: eq(matches.championshipId, championship.id),
            orderBy: [asc(matches.date)],
        }),
    ]);

    const presentedMatches = presentMatches({
        matches: matchRows,
        clubs: clubsData,
        championships: [championship],
        participants: participantRows,
        groups: groupRows,
    });
    const standings = buildStandings({
        championship,
        participants: participantRows.map((participant) => ({ clubId: participant.clubId })),
        matches: presentedMatches,
        clubs: clubsData,
    });
    const recentFormMap = getRecentFormMap(presentedMatches, championship.id);
    const standingsPositionDeltaMap = getPositionDeltaMap({
        championship,
        participants: participantRows.map((participant) => ({ clubId: participant.clubId })),
        matches: presentedMatches,
        clubs: clubsData,
        currentStandings: standings,
    });
    const hasGroupedStandings =
        groupRows.length > 0 && (championship.format === "GROUP_STAGE" || championship.format === "HYBRID");
    const standingsSections = hasGroupedStandings
        ? groupRows.map((group, index) => {
            const groupParticipants = participantRows
                .filter((participant) => participant.championshipGroupId === group.id)
                .map((participant) => ({ clubId: participant.clubId }));
            const groupStandings = buildStandings({
                championship,
                participants: groupParticipants,
                matches: presentedMatches,
                clubs: clubsData,
                championshipGroupId: group.id,
            });

            return {
                id: group.id,
                badgeLabel: `Grupo ${index + 1}`,
                title: group.name,
                description:
                    index === 0
                        ? "Cada grupo e recalculado automaticamente conforme os placares salvos no admin."
                        : "Posicao, aproveitamento e ultimos jogos atualizados automaticamente.",
                standings: groupStandings,
                recentForm: getRecentFormMap(presentedMatches, championship.id, group.id),
                positionDeltaMap: getPositionDeltaMap({
                    championship,
                    participants: groupParticipants,
                    matches: presentedMatches,
                    clubs: clubsData,
                    currentStandings: groupStandings,
                    championshipGroupId: group.id,
                }),
            };
        }).filter((section) => section.standings.length > 0)
        : [
            {
                id: "overall",
                badgeLabel: "Tabela",
                title: "Classificacao automatica",
                description:
                    "Pontos, saldo, vitorias e ordem da tabela recalculados a partir dos placares lancados no admin.",
                standings,
                recentForm: recentFormMap,
                positionDeltaMap: standingsPositionDeltaMap,
            },
        ];

    const liveOrUpcomingMatches = presentedMatches
        .filter((match) => match.status === "LIVE" || (match.status === "SCHEDULED" && match.date.getTime() >= now.getTime()))
        .sort((left, right) => left.date.getTime() - right.date.getTime());
    const finishedMatches = presentedMatches
        .filter((match) => match.status === "FINISHED")
        .sort((left, right) => right.date.getTime() - left.date.getTime());

    return (
        <div className="min-h-screen py-12 lg:py-20">
            <Container>
                <section className="overflow-hidden rounded-[2rem] border border-navy-800 bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.22),_transparent_32%),linear-gradient(180deg,rgba(10,22,40,0.96),rgba(6,14,26,1))] px-6 py-8 shadow-[0_28px_60px_rgba(0,0,0,0.24)] sm:px-8 lg:px-12 lg:py-12">
                    <div className="max-w-3xl">
                        <Badge variant="gold" className="mb-4">
                            Competicao automatizada
                        </Badge>
                        <h1 className="font-display text-4xl font-bold tracking-tight text-cream-100 sm:text-5xl">
                            {championship.name}
                        </h1>
                        <p className="mt-4 text-lg text-cream-300">
                            {championship.description ?? "Classificacao, jogos, campanha e contexto completo da competicao."}
                        </p>

                        <div className="mt-6 flex flex-wrap gap-3">
                            <Badge variant="outline" className="border-cream-100/10 bg-navy-950/40 text-cream-100">
                                {championship.seasonLabel ?? "Edicao atual"}
                            </Badge>
                            <Badge variant="outline" className="border-cream-100/10 bg-navy-950/40 text-cream-100">
                                {championship.surface}
                            </Badge>
                            <Badge variant="outline" className="border-cream-100/10 bg-navy-950/40 text-cream-100">
                                {participantRows.length} participantes
                            </Badge>
                            <Badge variant="outline" className="border-cream-100/10 bg-navy-950/40 text-cream-100">
                                {matchRows.length} jogos cadastrados
                            </Badge>
                        </div>
                    </div>
                </section>

                <section className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.95fr)]">
                    <div className="space-y-6">
                        {standingsSections.map((section) => (
                            <StandingsPanel
                                key={section.id}
                                badgeLabel={section.badgeLabel}
                                title={section.title}
                                description={section.description}
                                standings={section.standings}
                                positionDeltaMap={section.positionDeltaMap}
                                recentFormMap={section.recentForm}
                            />
                        ))}
                    </div>

                    <Card variant="glass" className="border-cream-100/8">
                        <CardContent className="p-6">
                            <div className="mb-6">
                                <Badge variant="outline" className="mb-4 border-cream-100/10 bg-navy-950/40 text-cream-100">
                                    Resumo
                                </Badge>
                                <h2 className="font-display text-3xl font-bold tracking-tight text-cream-100">
                                    Leitura rapida
                                </h2>
                            </div>

                            <div className="space-y-4">
                                <div className="rounded-2xl border border-navy-800 bg-navy-950/50 p-4">
                                    <p className="text-xs uppercase tracking-[0.22em] text-cream-300/60">Proximo jogo</p>
                                    <p className="mt-3 text-lg font-semibold text-cream-100">
                                        {liveOrUpcomingMatches[0] ? formatFixtureLabel(liveOrUpcomingMatches[0]) : "A definir"}
                                    </p>
                                </div>
                                <div className="rounded-2xl border border-navy-800 bg-navy-950/50 p-4">
                                    <p className="text-xs uppercase tracking-[0.22em] text-cream-300/60">Ultimo resultado</p>
                                    <p className="mt-3 text-lg font-semibold text-cream-100">
                                        {finishedMatches[0] ? formatFixtureLabel(finishedMatches[0]) : "Ainda sem resultado"}
                                    </p>
                                </div>
                                <div className="rounded-2xl border border-navy-800 bg-navy-950/50 p-4">
                                    <p className="text-xs uppercase tracking-[0.22em] text-cream-300/60">Status</p>
                                    <p className="mt-3 text-lg font-semibold text-cream-100">
                                        {championship.status === "LIVE" ? "Competicao em andamento" : championship.status === "FINISHED" ? "Competicao encerrada" : "Competicao planejada"}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                <section className="mt-12">
                    <div className="mb-6">
                        <Badge variant="accent" className="mb-4">
                            Agenda da competicao
                        </Badge>
                        <h2 className="font-display text-3xl font-bold tracking-tight text-cream-100">
                            Jogos e rodadas
                        </h2>
                    </div>

                    {presentedMatches.length > 0 ? (
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                            {presentedMatches.map((match) => (
                                <MatchCard key={match.id} match={toDisplayMatch(match, { perspective: "FIXTURE" })} />
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-3xl border border-dashed border-navy-800 bg-navy-900/20 px-6 py-16 text-center">
                            <h2 className="font-display text-2xl font-bold text-cream-100">Nenhuma partida cadastrada</h2>
                            <p className="mt-3 text-sm text-cream-300">
                                Assim que os confrontos forem lancados no admin, eles aparecem aqui automaticamente.
                            </p>
                        </div>
                    )}
                </section>
            </Container>
        </div>
    );
}
