import { notFound } from "next/navigation";
import Image from "next/image";
import { Badge, Card, CardContent, Container, shouldBypassNextImageOptimization } from "@resenha/ui";
import { buildScheduleBuckets, buildStandings, db, presentMatches } from "@resenha/db";
import type { MatchPresentation } from "@resenha/db";
import { championshipGroups, championshipParticipants, championships, clubs, matches } from "@resenha/db/schema";
import { asc, eq } from "drizzle-orm";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { toDisplayMatch } from "@/lib/matches";
import {
    fetchPlacarsoftCompetitionData,
    getOfficialPlacarsoftSource,
    type PlacarsoftCompetitionData,
    type PlacarsoftGame,
} from "@/lib/placarsoft";
import { CompetitionSchedulePanel } from "./CompetitionSchedulePanel";

export const dynamic = "force-dynamic";
const DISPLAY_TIMEZONE = "America/Sao_Paulo";

type RecentFormResult = "W" | "D" | "L";
type StandingRowData = ReturnType<typeof buildStandings>[number];
type ChampionshipData = NonNullable<Awaited<ReturnType<typeof db.query.championships.findFirst>>>;
type ClubData = Awaited<ReturnType<typeof db.query.clubs.findMany>>[number];

interface OfficialCompetitionState {
    sourceConfigured: boolean;
    sourcePageUrl: string | null;
    data: PlacarsoftCompetitionData | null;
    failed: boolean;
}

async function loadOfficialCompetitionState(slug: string): Promise<OfficialCompetitionState> {
    const source = getOfficialPlacarsoftSource(slug);

    if (!source) {
        return {
            sourceConfigured: false,
            sourcePageUrl: null,
            data: null,
            failed: false,
        };
    }

    try {
        return {
            sourceConfigured: true,
            sourcePageUrl: source.sourcePageUrl,
            data: await fetchPlacarsoftCompetitionData(source),
            failed: false,
        };
    } catch {
        return {
            sourceConfigured: true,
            sourcePageUrl: source.sourcePageUrl,
            data: null,
            failed: true,
        };
    }
}

function getOfficialMatchType(championship: ChampionshipData): MatchPresentation["type"] {
    return championship.surface === "FUTSAL" ? "FUTSAL" : "CAMPO";
}

function getOfficialCompetitionName(officialData: PlacarsoftCompetitionData) {
    return officialData.competition.commonName ?? officialData.competition.nickname ?? officialData.competition.name;
}

function normalizeClubLookupValue(value?: string | null) {
    const stopWords = new Set(["ac", "club", "da", "das", "de", "do", "dos", "e", "ec", "fc", "futsal", "na", "no", "sc", "sport"]);

    return (value ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, " ")
        .split(/\s+/)
        .filter((token) => token && !stopWords.has(token))
        .map((token) => (token.length > 4 && token.endsWith("s") ? token.slice(0, -1) : token))
        .join(" ")
        .trim();
}

function getLocalClubForOfficialTeam(
    team: { name?: string | null; shortName?: string | null },
    clubsData: ClubData[],
) {
    const officialNameKey = normalizeClubLookupValue(team.name);
    const officialKeys = new Set([
        officialNameKey,
        normalizeClubLookupValue(team.shortName),
    ].filter(Boolean));

    for (const club of clubsData) {
        const localKeys = [
            normalizeClubLookupValue(club.name),
            normalizeClubLookupValue(club.shortName),
            normalizeClubLookupValue(club.slug),
        ].filter(Boolean);

        if (localKeys.some((key) => officialKeys.has(key))) {
            return club;
        }

        if (
            officialNameKey &&
            localKeys.some((key) => key.length >= 6 && (officialNameKey.includes(key) || key.includes(officialNameKey)))
        ) {
            return club;
        }
    }

    return null;
}

function applyLocalLogosToOfficialStandings(
    standings: PlacarsoftCompetitionData["standings"],
    clubsData: ClubData[],
) {
    return standings.map((row) => {
        const localClub = getLocalClubForOfficialTeam(
            { name: row.clubName, shortName: row.clubShortName },
            clubsData,
        );

        return localClub?.logoUrl
            ? {
                ...row,
                clubLogoUrl: localClub.logoUrl,
            }
            : row;
    });
}

function toOfficialMatchPresentation(args: {
    game: PlacarsoftGame;
    officialData: PlacarsoftCompetitionData;
    championship: ChampionshipData;
    clubsData: ClubData[];
}): MatchPresentation {
    const { game, officialData, championship, clubsData } = args;
    const localHomeClub = getLocalClubForOfficialTeam(
        { name: game.homeTeam.name, shortName: game.homeTeam.shortName },
        clubsData,
    );
    const localAwayClub = getLocalClubForOfficialTeam(
        { name: game.awayTeam.name, shortName: game.awayTeam.shortName },
        clubsData,
    );

    return {
        id: game.id,
        championshipId: championship.id,
        championshipGroupId: `placarsoft:${officialData.group.id}`,
        date: game.date,
        location: game.location,
        type: getOfficialMatchType(championship),
        category: "CHAMPIONSHIP",
        status: game.status,
        matchday: game.matchday,
        scoreHome: game.scoreHome,
        scoreAway: game.scoreAway,
        tiebreakHome: game.tiebreakHome,
        tiebreakAway: game.tiebreakAway,
        competitionName: getOfficialCompetitionName(officialData),
        phaseLabel: officialData.phase.name,
        roundLabel: game.roundName,
        groupName: officialData.group.name,
        resenhaClubId: null,
        isResenhaMatch:
            game.homeTeam.name.toLowerCase().includes("resenha") ||
            game.awayTeam.name.toLowerCase().includes("resenha"),
        isResenhaHome: game.homeTeam.name.toLowerCase().includes("resenha"),
        homeTeam: {
            id: game.homeTeam.sourceTeamId,
            name: game.homeTeam.name,
            shortName: game.homeTeam.shortName,
            logoUrl: localHomeClub?.logoUrl ?? game.homeTeam.logoUrl,
        },
        awayTeam: {
            id: game.awayTeam.sourceTeamId,
            name: game.awayTeam.name,
            shortName: game.awayTeam.shortName,
            logoUrl: localAwayClub?.logoUrl ?? game.awayTeam.logoUrl,
        },
        opponentName: game.awayTeam.name,
        opponentLogo: localAwayClub?.logoUrl ?? game.awayTeam.logoUrl,
    };
}

function buildOfficialRecentFormMap(officialData: PlacarsoftCompetitionData) {
    return new Map<string, RecentFormResult[]>(
        officialData.standings.map((row) => [row.clubId, [...row.recentForm]]),
    );
}

function formatOfficialUpdatedAt(officialData: PlacarsoftCompetitionData) {
    if (officialData.freshness.updatedAtDate) {
        return officialData.freshness.updatedAtDate.toLocaleString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            timeZone: DISPLAY_TIMEZONE,
        });
    }

    return officialData.freshness.updatedAt;
}

function CompetitionSourceNotice({
    officialState,
}: {
    officialState: OfficialCompetitionState;
}) {
    if (!officialState.sourceConfigured) {
        return null;
    }

    if (officialState.data) {
        const updatedAt = formatOfficialUpdatedAt(officialState.data);

        return (
            <section className="mt-6 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-5 py-4 text-sm text-emerald-50">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="font-semibold">Fonte oficial Placarsoft ativa</p>
                        <p className="mt-1 text-emerald-50/80">
                            Classificacao e jogos carregados da fonte oficial da competicao
                            {updatedAt ? `, com ultima atualizacao em ${updatedAt}.` : "."}
                        </p>
                    </div>
                    <a
                        href={officialState.data.sourcePageUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex shrink-0 items-center justify-center rounded-full border border-emerald-300/30 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-50 transition-colors hover:border-emerald-200/70 hover:bg-emerald-300/10"
                    >
                        Abrir fonte
                    </a>
                </div>
            </section>
        );
    }

    if (officialState.failed) {
        return (
            <section className="mt-6 rounded-2xl border border-amber-300/25 bg-amber-400/10 px-5 py-4 text-sm text-amber-50">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="font-semibold">Fonte oficial indisponivel agora</p>
                        <p className="mt-1 text-amber-50/82">
                            O Placarsoft nao respondeu a tempo. A pagina esta exibindo os dados locais cadastrados no site, sem trata-los como atualizacao oficial.
                        </p>
                    </div>
                    {officialState.sourcePageUrl && (
                        <a
                            href={officialState.sourcePageUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex shrink-0 items-center justify-center rounded-full border border-amber-200/30 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-amber-50 transition-colors hover:border-amber-100/70 hover:bg-amber-200/10"
                        >
                            Ver fonte
                        </a>
                    )}
                </div>
            </section>
        );
    }

    return null;
}

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
            return "bg-emerald-400 shadow-[0_0_0_4px_rgba(16,185,129,0.12)]";
        case "L":
            return "bg-red-400 shadow-[0_0_0_4px_rgba(248,113,113,0.12)]";
        default:
            return "bg-slate-400 shadow-[0_0_0_4px_rgba(148,163,184,0.14)]";
    }
}

function getFormLabel(result: RecentFormResult) {
    switch (result) {
        case "W":
            return "Vitoria";
        case "L":
            return "Derrota";
        default:
            return "Empate";
    }
}

function getDisplayRecentForm(results: RecentFormResult[]) {
    return [...results].reverse();
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
                    <div className="mt-4 flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-[0.18em] text-cream-300/75">
                        <span className="inline-flex items-center gap-2">
                            <span className={`h-2.5 w-2.5 rounded-full ${getFormDotClasses("W")}`} />
                            Vitoria
                        </span>
                        <span className="inline-flex items-center gap-2">
                            <span className={`h-2.5 w-2.5 rounded-full ${getFormDotClasses("D")}`} />
                            Empate
                        </span>
                        <span className="inline-flex items-center gap-2">
                            <span className={`h-2.5 w-2.5 rounded-full ${getFormDotClasses("L")}`} />
                            Derrota
                        </span>
                    </div>
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
                                        const recentForm = getDisplayRecentForm(recentFormMap.get(row.clubId) ?? []);

                                        return (
                                            <tr key={`${row.clubId}-scroll`} className="h-16 border-t border-navy-800 bg-navy-900/60 text-cream-100 transition-colors hover:bg-navy-900/90">
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
                                                                title={getFormLabel(result)}
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
                                const recentForm = getDisplayRecentForm(recentFormMap.get(row.clubId) ?? []);

                                return (
                                    <tr key={row.clubId} className="border-t border-navy-800 bg-navy-900/60 text-cream-100 transition-colors hover:bg-navy-900/90">
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
                                                        title={getFormLabel(result)}
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

    const championship = await db.query.championships.findFirst({
        where: eq(championships.slug, slug),
    });

    if (!championship) {
        notFound();
    }

    const officialStatePromise = loadOfficialCompetitionState(slug);
    const [clubsData, participantRows, groupRows, matchRows, officialState] = await Promise.all([
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
        officialStatePromise,
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
    const officialData = officialState.data;
    const usingOfficialData = Boolean(officialData);
    const officialStandings = officialData
        ? applyLocalLogosToOfficialStandings(officialData.standings, clubsData)
        : null;
    const hasGroupedStandings =
        groupRows.length > 0 && (championship.format === "GROUP_STAGE" || championship.format === "HYBRID");
    const standingsSections = officialData
        ? [
            {
                id: `placarsoft:${officialData.group.id}`,
                badgeLabel: "Fonte oficial",
                title: officialData.group.name,
                description: "Tabela carregada do Placarsoft com a ordem e os numeros oficiais da competicao.",
                standings: officialStandings ?? officialData.standings,
                recentForm: buildOfficialRecentFormMap(officialData),
                positionDeltaMap: new Map<string, number>(),
            },
        ]
        : hasGroupedStandings
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
                        ? "Recorte do grupo com pontuacao, saldo e forma recente de cada clube."
                        : "Leitura rapida da disputa dentro do grupo.",
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
                badgeLabel: "Classificacao",
                title: "Tabela da competicao",
                description:
                    "Pontos, saldo e forma recente para acompanhar quem sobe, quem cai e quem sustenta a campanha.",
                standings,
                recentForm: recentFormMap,
                positionDeltaMap: standingsPositionDeltaMap,
            },
        ];
    const scheduleMatches = officialData
        ? officialData.games.map((game) => toOfficialMatchPresentation({ game, officialData, championship, clubsData }))
        : presentedMatches;
    const scheduleState = buildScheduleBuckets(scheduleMatches);
    const scheduleBuckets = scheduleState.buckets.map((bucket) => ({
        id: bucket.id,
        kind: bucket.kind,
        title: bucket.title,
        subtitle: bucket.subtitle,
        matches: bucket.matches.map((match) => toDisplayMatch(match, { perspective: "FIXTURE" })),
    }));
    const expectedMatchesPerRound =
        championship.format === "KNOCKOUT"
            ? null
            : Math.floor((officialData?.standings.length ?? participantRows.length) / 2);

    return (
        <div className="min-h-screen py-12 lg:py-20">
            <Container>
                <section className="overflow-hidden rounded-[2rem] border border-navy-800 bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.22),_transparent_32%),linear-gradient(180deg,rgba(10,22,40,0.96),rgba(6,14,26,1))] px-6 py-8 shadow-[0_28px_60px_rgba(0,0,0,0.24)] sm:px-8 lg:px-12 lg:py-12">
                    <div className="max-w-3xl">
                        <Badge variant="gold" className="mb-4">
                            Painel do campeonato
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
                                {usingOfficialData ? officialData?.standings.length : participantRows.length} participantes
                            </Badge>
                            <Badge variant="outline" className="border-cream-100/10 bg-navy-950/40 text-cream-100">
                                {usingOfficialData ? officialData?.games.length : matchRows.length} jogos {usingOfficialData ? "oficiais" : "cadastrados"}
                            </Badge>
                        </div>
                    </div>
                </section>

                <CompetitionSourceNotice officialState={officialState} />

                <section className="mt-8 grid items-start gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.95fr)]">
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
                    <CompetitionSchedulePanel
                        buckets={scheduleBuckets}
                        initialBucketId={scheduleState.initialBucketId}
                        expectedMatchesPerRound={expectedMatchesPerRound}
                    />
                </section>
            </Container>
        </div>
    );
}
