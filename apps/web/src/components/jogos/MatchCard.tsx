"use client";

import * as React from "react";
import Image from "next/image";
import { Card, Badge, shouldBypassNextImageOptimization } from "@resenha/ui";
import { Clock, MapPin } from "lucide-react";

export interface Match {
    id: string;
    opponent: string;
    opponentLogo?: string | null;
    homeTeamName?: string;
    homeTeamLogo?: string | null;
    date: Date;
    location: string;
    type: "FUTSAL" | "CAMPO";
    matchday?: number | null;
    scoreHome?: number | null;
    scoreAway?: number | null;
    tiebreakHome?: number | null;
    tiebreakAway?: number | null;
    status: "SCHEDULED" | "LIVE" | "FINISHED";
    competitionName?: string | null;
    phaseLabel?: string | null;
    roundLabel?: string | null;
    displayMode?: "RESHENHA" | "FIXTURE";
}

const DISPLAY_TIMEZONE = "America/Sao_Paulo";

function getDecidingScores(match: Match) {
    if (match.scoreHome == null || match.scoreAway == null) {
        return null;
    }

    if (match.scoreHome !== match.scoreAway) {
        return {
            home: match.scoreHome,
            away: match.scoreAway,
            decidedByTiebreak: false,
        };
    }

    if (
        match.tiebreakHome == null ||
        match.tiebreakAway == null ||
        match.tiebreakHome === match.tiebreakAway
    ) {
        return {
            home: match.scoreHome,
            away: match.scoreAway,
            decidedByTiebreak: false,
        };
    }

    return {
        home: match.tiebreakHome,
        away: match.tiebreakAway,
        decidedByTiebreak: true,
    };
}

function normalizePhaseLabel(label?: string | null) {
    if (!label) {
        return null;
    }

    return label
        .replace(/unico/i, "Único")
        .replace(/\s+/g, " ")
        .trim();
}

function normalizeRoundLabel(label?: string | null) {
    if (!label) {
        return null;
    }

    const roundMatch = label.match(/^(\d+)a\s+rodada$/i);

    if (roundMatch) {
        return `Rodada ${roundMatch[1]}`;
    }

    return label.replace(/\s+/g, " ").trim();
}

function getMatchContext(match: Match) {
    return [
        match.competitionName,
        normalizePhaseLabel(match.phaseLabel),
        match.matchday ? `Rodada ${match.matchday}` : normalizeRoundLabel(match.roundLabel),
    ].filter(Boolean).join(" - ");
}

function TeamBadge({
    name,
    logo,
}: {
    name: string;
    logo?: string | null;
}) {
    if (logo) {
        return (
            <Image
                src={logo}
                alt={name}
                fill
                sizes="(max-width: 768px) 64px, 80px"
                unoptimized={shouldBypassNextImageOptimization(logo)}
                className="object-contain drop-shadow-md"
            />
        );
    }

    return (
        <div className="flex h-full w-full items-center justify-center rounded-full border border-navy-800 bg-navy-950 text-xl font-display font-black text-navy-700/60">
            {name.substring(0, 2).toUpperCase()}
        </div>
    );
}

export function MatchCard({ match }: { match: Match }) {
    const isFixtureMode = match.displayMode === "FIXTURE";
    const homeTeamName = isFixtureMode ? match.homeTeamName ?? "Mandante" : "Resenha";
    const homeTeamLogo = isFixtureMode ? match.homeTeamLogo ?? null : "/logo2.png";
    const hasScore = match.scoreHome != null && match.scoreAway != null;
    const decidingScores = getDecidingScores(match);
    const isWin = decidingScores != null && decidingScores.home > decidingScores.away;
    const isLoss = decidingScores != null && decidingScores.home < decidingScores.away;
    const isDraw = decidingScores != null && decidingScores.home === decidingScores.away;
    const hasTiebreak = match.tiebreakHome != null && match.tiebreakAway != null;

    const resultBadge = React.useMemo(() => {
        if (match.status === "SCHEDULED") {
            return <Badge variant="default" className="bg-navy-800 px-2 py-0.5 text-xs">Agendado</Badge>;
        }

        if (match.status === "LIVE") {
            return (
                <Badge variant="danger" className="flex items-center gap-1.5 border border-red-500/30 bg-red-500/20 px-2 py-0.5 text-xs text-red-400">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
                    Ao vivo
                </Badge>
            );
        }

        if (isFixtureMode) {
            return <Badge variant="outline" className="border-navy-700 bg-navy-900 px-2 py-0.5 text-xs text-cream-200">Finalizado</Badge>;
        }

        if (isWin) return <Badge variant="success" className="px-2 py-0.5 text-xs">Vitoria</Badge>;
        if (isDraw) return <Badge variant="warning" className="px-2 py-0.5 text-xs">Empate</Badge>;
        if (isLoss) return <Badge variant="danger" className="px-2 py-0.5 text-xs">Derrota</Badge>;
        return null;
    }, [isDraw, isFixtureMode, isLoss, isWin, match.status]);

    return (
        <Card className="group overflow-hidden rounded-2xl border-navy-800 bg-navy-900 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/30 hover:shadow-[0_8px_30px_rgba(59,130,246,0.1)]">
            <div className="flex items-center justify-between border-b border-navy-800/80 bg-navy-950/50 p-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-3 text-xs font-semibold tracking-wide text-cream-300">
                        <div className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-blue-400" />
                            <span>{match.date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", timeZone: DISPLAY_TIMEZONE })}</span>
                        </div>
                        <span className="h-1 w-1 rounded-full bg-navy-700" />
                        <span>{match.date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: DISPLAY_TIMEZONE })}</span>
                    </div>
                    {getMatchContext(match) && (
                        <p className="text-[10px] uppercase tracking-[0.2em] text-cream-300/60">
                            {getMatchContext(match)}
                        </p>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <span className="rounded-md border border-navy-800 bg-navy-900 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-navy-400">
                        {match.type}
                    </span>
                    {resultBadge}
                </div>
            </div>

            <div className="p-6 md:p-8">
                <div className="relative flex items-center justify-between gap-2 md:gap-4">
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.03]">
                        <span className="font-display text-8xl font-black italic text-white">VS</span>
                    </div>

                    <div className="z-10 flex flex-1 flex-col items-center">
                        <div className="relative mb-4 h-16 w-16 transition-transform duration-500 group-hover:scale-110 md:h-20 md:w-20">
                            <TeamBadge name={homeTeamName} logo={homeTeamLogo} />
                        </div>
                        <span className="w-full truncate px-2 text-center text-[11px] font-bold uppercase tracking-widest text-cream-100 md:text-sm" title={homeTeamName}>
                            {homeTeamName}
                        </span>
                    </div>

                    <div className="z-10 flex w-24 flex-shrink-0 flex-col items-center justify-center md:w-32">
                        {match.status === "SCHEDULED" || !hasScore ? (
                            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-navy-800 bg-navy-950 shadow-inner md:h-12 md:w-12">
                                <span className="px-2 text-center font-display text-sm font-bold italic text-navy-500 md:text-xl">
                                    {match.status === "SCHEDULED" ? "VS" : "FT"}
                                </span>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-2">
                                <div className="flex items-center justify-center rounded-xl border border-navy-800 bg-navy-950 px-4 py-3 shadow-[inset_0_2px_8px_rgba(0,0,0,0.5)] md:px-5">
                                    <span className="min-w-[1ch] text-center font-display text-3xl font-bold text-cream-100 md:text-4xl">
                                        {match.scoreHome}
                                    </span>
                                    <span className="mx-2 font-black text-navy-600 md:mx-3">-</span>
                                    <span className="min-w-[1ch] text-center font-display text-3xl font-bold text-cream-100 md:text-4xl">
                                        {match.scoreAway}
                                    </span>
                                </div>
                                {hasTiebreak && (
                                    <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cream-300/75">
                                        Pen. {match.tiebreakHome} - {match.tiebreakAway}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="z-10 flex flex-1 flex-col items-center">
                        <div className="relative mb-4 flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-navy-800 bg-navy-950 shadow-inner transition-transform duration-500 group-hover:scale-110 md:h-20 md:w-20">
                            {match.opponentLogo ? (
                                <Image
                                    src={match.opponentLogo}
                                    alt={match.opponent}
                                    fill
                                    sizes="(max-width: 768px) 64px, 80px"
                                    unoptimized={shouldBypassNextImageOptimization(match.opponentLogo)}
                                    className="object-contain p-2"
                                />
                            ) : (
                                <span className="font-display text-xl font-black text-navy-700/60 mix-blend-overlay md:text-2xl">
                                    {match.opponent.substring(0, 2).toUpperCase()}
                                </span>
                            )}
                        </div>
                        <span className="w-full truncate px-2 text-center text-[11px] font-bold uppercase tracking-widest text-cream-100 md:text-sm" title={match.opponent}>
                            {match.opponent}
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-center border-t border-navy-800/80 bg-navy-900/50 p-3 px-6">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-cream-300">
                    <MapPin className="h-3.5 w-3.5 text-navy-400" />
                    <span className="max-w-[250px] truncate">{match.location}</span>
                </div>
            </div>
        </Card>
    );
}
