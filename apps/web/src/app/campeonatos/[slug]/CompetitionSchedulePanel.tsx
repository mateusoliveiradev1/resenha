"use client";

import * as React from "react";
import Image from "next/image";
import { Badge, Card, CardContent, shouldBypassNextImageOptimization } from "@resenha/ui";
import { ChevronLeft, ChevronRight, Clock3, MapPin } from "lucide-react";
import type { Match } from "@/components/jogos/MatchCard";

const DISPLAY_TIMEZONE = "America/Sao_Paulo";

type ScheduleBucket = {
    id: string;
    kind: "MATCHDAY" | "DATE";
    title: string;
    subtitle: string | null;
    matches: Match[];
};

function getDatePartsInTimeZone(date: Date) {
    const formatter = new Intl.DateTimeFormat("en-CA", {
        timeZone: DISPLAY_TIMEZONE,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    });
    const parts = formatter.formatToParts(date);

    return {
        year: Number(parts.find((part) => part.type === "year")?.value ?? "0"),
        month: Number(parts.find((part) => part.type === "month")?.value ?? "0"),
        day: Number(parts.find((part) => part.type === "day")?.value ?? "0"),
    };
}

function getDayDiffInTimeZone(targetDate: Date, referenceDate: Date) {
    const target = getDatePartsInTimeZone(targetDate);
    const reference = getDatePartsInTimeZone(referenceDate);
    const targetUtc = Date.UTC(target.year, target.month - 1, target.day);
    const referenceUtc = Date.UTC(reference.year, reference.month - 1, reference.day);

    return Math.round((targetUtc - referenceUtc) / 86_400_000);
}

function formatCompactDate(date: Date) {
    return date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        timeZone: DISPLAY_TIMEZONE,
    });
}

function formatTime(date: Date) {
    return date.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: DISPLAY_TIMEZONE,
    });
}

function formatWeekday(date: Date) {
    const weekday = new Intl.DateTimeFormat("pt-BR", {
        weekday: "short",
        timeZone: DISPLAY_TIMEZONE,
    }).format(date);

    return weekday.replace(".", "");
}

function getRelativeDayLabel(date: Date, now: Date) {
    const diff = getDayDiffInTimeZone(date, now);

    if (diff === 0) {
        return "Hoje";
    }

    if (diff === 1) {
        return "Amanha";
    }

    if (diff === -1) {
        return "Ontem";
    }

    return formatWeekday(date);
}

function formatMatchDateTime(date: Date, now: Date) {
    return `${formatCompactDate(date)} - ${getRelativeDayLabel(date, now)} - ${formatTime(date)}`;
}

function getCompactTeamLabel(name: string, shortName?: string) {
    const source = (shortName?.trim() || name).toUpperCase();
    const tokens = source
        .replace(/[^\p{L}\p{N}\s]/gu, " ")
        .split(/\s+/)
        .filter(Boolean)
        .filter((token) => !["FC", "EC", "SC", "AC", "RFC", "DA", "DE", "DO", "DAS", "DOS"].includes(token));
    const shortToken = tokens.find((token) => token.length <= 4);

    if (shortToken) {
        return shortToken;
    }

    if (tokens.length === 0) {
        return source.slice(0, 3);
    }

    if (tokens.length >= 2) {
        return `${tokens[0].slice(0, 2)}${tokens[1].slice(0, 1)}`.slice(0, 4);
    }

    return tokens[0].slice(0, 3);
}

function TeamLogo({ name, logo }: { name: string; logo?: string | null }) {
    if (logo) {
        return (
            <div className="relative h-8 w-8 overflow-hidden rounded-full border border-navy-700 bg-navy-950 shadow-[0_10px_24px_rgba(2,6,23,0.32)] sm:h-9 sm:w-9">
                <Image
                    src={logo}
                    alt={name}
                    fill
                    sizes="(max-width: 640px) 32px, 36px"
                    unoptimized={shouldBypassNextImageOptimization(logo)}
                    className="object-contain p-1.5"
                />
            </div>
        );
    }

    return (
        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-navy-700 bg-navy-950 font-display text-[10px] font-black text-cream-100 shadow-[0_10px_24px_rgba(2,6,23,0.32)] sm:h-9 sm:w-9">
            {name.slice(0, 2).toUpperCase()}
        </div>
    );
}

function MatchStatusBadge({ match }: { match: Match }) {
    if (match.status === "LIVE") {
        return (
            <Badge variant="danger" className="flex items-center gap-1.5 px-2 py-0.5 text-[10px]">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-400" />
                Ao vivo
            </Badge>
        );
    }

    if (match.status === "FINISHED") {
        return (
            <Badge variant="outline" className="border-navy-700 bg-navy-900 text-[10px] text-cream-200">
                Finalizado
            </Badge>
        );
    }

    return (
        <Badge variant="accent" className="text-[10px]">
            Agendado
        </Badge>
    );
}

function Scoreline({ match, compact = false }: { match: Match; compact?: boolean }) {
    const hasScore = match.scoreHome != null && match.scoreAway != null;

    if (!hasScore) {
        return (
            <span className={`rounded-full border border-navy-700 bg-navy-950/90 font-semibold uppercase text-cream-300/55 ${compact ? "px-2.5 py-1 text-[10px] tracking-[0.22em]" : "px-3 py-1 text-[11px] tracking-[0.28em]"}`}>
                x
            </span>
        );
    }

    return (
        <div className="flex flex-col items-center">
            <div className={`rounded-full border border-navy-700 bg-navy-950 font-display font-bold text-cream-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] ${compact ? "px-2.5 py-1 text-sm" : "px-3 py-1 text-base"}`}>
                {match.scoreHome} <span className="mx-1 text-navy-500">x</span> {match.scoreAway}
            </div>
            {match.tiebreakHome != null && match.tiebreakAway != null && (
                <span className="mt-1 text-[9px] uppercase tracking-[0.18em] text-cream-300/60">
                    Pen. {match.tiebreakHome} x {match.tiebreakAway}
                </span>
            )}
        </div>
    );
}

export function CompetitionSchedulePanel({
    buckets,
    initialBucketId,
    expectedMatchesPerRound,
}: {
    buckets: ScheduleBucket[];
    initialBucketId: string | null;
    expectedMatchesPerRound?: number | null;
}) {
    const initialIndex = React.useMemo(() => {
        if (buckets.length === 0) {
            return 0;
        }

        const index = buckets.findIndex((bucket) => bucket.id === initialBucketId);
        return index >= 0 ? index : 0;
    }, [buckets, initialBucketId]);

    const [activeIndex, setActiveIndex] = React.useState(initialIndex);
    const [now, setNow] = React.useState(() => new Date());

    React.useEffect(() => {
        setActiveIndex(initialIndex);
    }, [initialIndex]);

    React.useEffect(() => {
        const intervalId = window.setInterval(() => setNow(new Date()), 60_000);

        return () => window.clearInterval(intervalId);
    }, []);

    const activeBucket = buckets[activeIndex];
    const bucketDays = React.useMemo(() => {
        if (!activeBucket) {
            return [];
        }

        const dayMap = new Map<string, Date>();

        for (const match of activeBucket.matches) {
            const key = formatCompactDate(match.date);

            if (!dayMap.has(key)) {
                dayMap.set(key, match.date);
            }
        }

        return [...dayMap.values()].sort((left, right) => left.getTime() - right.getTime());
    }, [activeBucket]);
    const shouldShowExpectedCount =
        activeBucket?.kind === "MATCHDAY" &&
        typeof expectedMatchesPerRound === "number" &&
        expectedMatchesPerRound > 0;
    const missingMatchesCount = shouldShowExpectedCount
        ? Math.max(expectedMatchesPerRound - activeBucket.matches.length, 0)
        : 0;

    return (
        <Card variant="glass" className="h-full border-cream-100/8">
            <CardContent className="flex h-full flex-col p-4 sm:p-6">
                <div className="mb-4 flex items-start justify-between gap-4 sm:mb-5">
                    <div className="min-w-0">
                        <Badge variant="outline" className="border-cream-100/10 bg-navy-950/40 text-cream-100">
                            Jogos
                        </Badge>
                        <h2 className="mt-3 font-display text-[1.7rem] font-bold tracking-tight text-cream-100 sm:mt-4 sm:text-[2rem]">
                            Agenda da competicao
                        </h2>
                        <p className="mt-2 hidden max-w-md text-sm leading-6 text-cream-300/78 sm:block">
                            Rodadas organizadas por janela, com os dias destacados e leitura mais proxima do modelo de agenda.
                        </p>
                    </div>

                    {activeBucket && (
                        <div className="hidden rounded-2xl border border-navy-800 bg-navy-950/80 px-3 py-2 text-right sm:block">
                            <p className="text-[10px] uppercase tracking-[0.22em] text-cream-300/55">
                                Janela
                            </p>
                            <p className="font-display text-xl font-bold text-cream-100">
                                {activeIndex + 1}/{buckets.length}
                            </p>
                        </div>
                    )}
                </div>

                {activeBucket ? (
                    <>
                        <div className="rounded-[1.5rem] border border-navy-800 bg-[linear-gradient(180deg,rgba(8,18,34,0.96),rgba(5,12,24,0.96))] p-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] sm:rounded-[1.75rem] sm:p-3">
                            <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => setActiveIndex((current) => Math.max(0, current - 1))}
                                    disabled={activeIndex === 0}
                                    className="flex h-9 w-9 items-center justify-center rounded-full border border-navy-700 bg-navy-950 text-cream-100 transition-colors hover:border-blue-500/40 hover:text-blue-200 disabled:cursor-not-allowed disabled:opacity-40 sm:h-10 sm:w-10"
                                    aria-label="Rodada anterior"
                                >
                                    <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                                </button>

                                <div className="min-w-0 text-center">
                                    <p className="text-[10px] uppercase tracking-[0.24em] text-cream-300/55">
                                        {activeBucket.kind === "MATCHDAY" ? "Rodada" : "Data"}
                                    </p>
                                    <p className="font-display text-xl font-bold tracking-[0.04em] text-cream-100 sm:text-2xl">
                                        {activeBucket.title}
                                    </p>
                                    {activeBucket.subtitle && (
                                        <p className="mt-1 text-[11px] uppercase tracking-[0.22em] text-cream-300/60">
                                            {activeBucket.subtitle}
                                        </p>
                                    )}
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setActiveIndex((current) => Math.min(buckets.length - 1, current + 1))}
                                    disabled={activeIndex === buckets.length - 1}
                                    className="flex h-9 w-9 items-center justify-center rounded-full border border-navy-700 bg-navy-950 text-cream-100 transition-colors hover:border-blue-500/40 hover:text-blue-200 disabled:cursor-not-allowed disabled:opacity-40 sm:h-10 sm:w-10"
                                    aria-label="Proxima rodada"
                                >
                                    <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
                                </button>
                            </div>

                            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                                {bucketDays.map((day) => (
                                    <span
                                        key={`${activeBucket.id}-${formatCompactDate(day)}`}
                                        className="rounded-full border border-navy-700 bg-navy-950/85 px-3 py-1 text-[9px] uppercase tracking-[0.18em] text-cream-300/75 sm:text-[10px]"
                                    >
                                        {formatCompactDate(day)} - {getRelativeDayLabel(day, now)}
                                    </span>
                                ))}

                                <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-[9px] uppercase tracking-[0.18em] text-blue-100/80 sm:text-[10px]">
                                    {shouldShowExpectedCount
                                        ? `${activeBucket.matches.length}/${expectedMatchesPerRound} jogos`
                                        : `${activeBucket.matches.length} jogos`}
                                </span>
                            </div>

                            {missingMatchesCount > 0 && (
                                <p className="mt-3 text-center text-[11px] text-cream-300/70">
                                    {missingMatchesCount} jogo{missingMatchesCount > 1 ? "s" : ""} ainda nao cadastrado{missingMatchesCount > 1 ? "s" : ""} nesta rodada.
                                </p>
                            )}
                        </div>

                        <div className="mt-3 grid gap-2.5">
                            {activeBucket.matches.map((match) => (
                                <article
                                    key={match.id}
                                    className="rounded-[1.35rem] border border-navy-800/85 bg-navy-950/45 px-3 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] sm:rounded-[1.5rem] sm:px-3.5"
                                >
                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2 text-[10px] text-cream-300/68 sm:flex sm:min-w-0 sm:items-center sm:gap-3 sm:text-[11px]">
                                            <div className="flex items-center gap-1.5">
                                                <MapPin className="h-3.5 w-3.5 shrink-0 text-blue-300/70" />
                                                <span className="truncate">{match.location}</span>
                                            </div>
                                            <div className="flex items-center justify-end gap-1.5 text-right sm:justify-start sm:text-left">
                                                <Clock3 className="h-3.5 w-3.5 shrink-0 text-blue-300/70" />
                                                <span>{formatMatchDateTime(match.date, now)}</span>
                                            </div>
                                        </div>
                                        <div className="flex">
                                            <MatchStatusBadge match={match} />
                                        </div>
                                    </div>

                                    <div className="mt-3 flex items-center justify-between gap-2 sm:hidden">
                                        <span
                                            className="w-[2.7rem] truncate text-left font-display text-sm font-bold uppercase tracking-[0.12em] text-cream-100"
                                            title={match.homeTeamName ?? "Mandante"}
                                        >
                                            {getCompactTeamLabel(match.homeTeamName ?? "Mandante", match.homeTeamShortName)}
                                        </span>

                                        <div className="flex items-center gap-1.5">
                                            <TeamLogo name={match.homeTeamName ?? "Mandante"} logo={match.homeTeamLogo} />
                                            <Scoreline match={match} compact />
                                            <TeamLogo name={match.opponent} logo={match.opponentLogo} />
                                        </div>

                                        <span
                                            className="w-[2.7rem] truncate text-right font-display text-sm font-bold uppercase tracking-[0.12em] text-cream-100"
                                            title={match.opponent}
                                        >
                                            {getCompactTeamLabel(match.opponent, match.opponentShortName)}
                                        </span>
                                    </div>

                                    <div className="mt-3 hidden grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2.5 sm:grid">
                                        <div className="flex min-w-0 items-center justify-end gap-2.5 text-right">
                                            <div className="min-w-0">
                                                <p className="truncate text-[13px] font-semibold leading-tight text-cream-100 sm:text-sm">
                                                    {match.homeTeamName ?? "Mandante"}
                                                </p>
                                            </div>
                                            <TeamLogo name={match.homeTeamName ?? "Mandante"} logo={match.homeTeamLogo} />
                                        </div>

                                        <Scoreline match={match} />

                                        <div className="flex min-w-0 items-center gap-2.5">
                                            <TeamLogo name={match.opponent} logo={match.opponentLogo} />
                                            <div className="min-w-0">
                                                <p className="truncate text-[13px] font-semibold leading-tight text-cream-100 sm:text-sm">
                                                    {match.opponent}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="rounded-3xl border border-dashed border-navy-800 bg-navy-900/20 px-6 py-16 text-center">
                        <h2 className="font-display text-2xl font-bold text-cream-100">Nenhuma partida cadastrada</h2>
                        <p className="mt-3 text-sm text-cream-300">
                            Assim que os confrontos forem lancados no admin, a agenda da competicao aparece aqui.
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
