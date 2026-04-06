"use client";

import * as React from "react";
import { Container, Card, Badge } from "@resenha/ui";
import Image from "next/image";
import { ChevronRight, Calendar } from "lucide-react";
import Link from "next/link";

export interface MatchResult {
    id: string;
    opponent: string;
    opponentLogo?: string | null;
    date: Date;
    scoreHome: number;
    scoreAway: number;
}

export function LatestResults({ results }: { results?: MatchResult[] }) {
    if (!results || !results.length) return null;

    return (
        <section className="py-20 bg-navy-950/50 relative">
            {/* Soft background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-[300px] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />

            <Container className="relative z-10">
                <div className="flex items-end justify-between border-b border-navy-800/60 pb-6 mb-10">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-display font-bold text-cream-100 flex items-center gap-3">
                            Últimos Resultados
                        </h2>
                        <p className="text-sm md:text-base text-cream-300/80 mt-2 font-light tracking-wide">
                            Histórico recente das nossas batalhas em campo.
                        </p>
                    </div>
                    <Link href="/jogos" className="hidden sm:flex items-center gap-1 text-sm font-bold uppercase tracking-widest text-blue-400 hover:text-blue-300 transition-colors group">
                        Ver Todos
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {results.map((match) => {
                        const isWin = match.scoreHome > match.scoreAway;
                        const isDraw = match.scoreHome === match.scoreAway;

                        const badgeVariant = isWin ? "success" : isDraw ? "warning" : "danger";
                        const badgeLabel = isWin ? "VITÓRIA" : isDraw ? "EMPATE" : "DERROTA";

                        return (
                            <Card key={match.id} className="relative overflow-hidden group hover:-translate-y-1 transition-all duration-300 border border-navy-800 bg-navy-900 rounded-2xl hover:shadow-[0_8px_30px_rgba(59,130,246,0.1)] hover:border-blue-500/30">
                                {/* Status Top Bar */}
                                <div className="bg-navy-950/60 p-3 px-5 flex justify-between items-center border-b border-navy-800/80">
                                    <div className="flex items-center gap-2 text-[11px] font-semibold text-cream-300 uppercase tracking-wider">
                                        <Calendar className="w-3.5 h-3.5 text-navy-400" />
                                        <span>
                                            {match.date.toLocaleDateString("pt-BR", { day: "2-digit", month: "long" }).replace(" de ", " ")}
                                        </span>
                                    </div>
                                    <Badge variant={badgeVariant} className="text-[10px] px-2 py-0.5 shadow-sm">
                                        {badgeLabel}
                                    </Badge>
                                </div>

                                <div className="p-6 md:p-8 flex items-center justify-between gap-4 relative">

                                    {/* Home (Resenha) */}
                                    <div className="flex flex-col items-center flex-1 z-10">
                                        <div className="h-14 w-14 sm:h-16 sm:w-16 relative mb-3 transition-transform duration-500 group-hover:scale-105">
                                            <Image
                                                src="/logo2.png"
                                                alt="Resenha RFC"
                                                fill
                                                sizes="(max-width: 640px) 56px, 64px"
                                                className="object-contain drop-shadow-md"
                                            />
                                        </div>
                                        <span className="text-[10px] sm:text-xs uppercase tracking-widest font-bold text-cream-100 text-center truncate w-full">Resenha</span>
                                    </div>

                                    {/* Score */}
                                    <div className="flex items-center justify-center px-4 sm:px-5 bg-navy-950 py-3 rounded-xl border border-navy-800 shadow-[inset_0_2px_8px_rgba(0,0,0,0.5)] z-10 shrink-0">
                                        <span className="font-display text-3xl sm:text-4xl font-bold text-cream-100 min-w-[1ch] text-center drop-shadow-sm">
                                            {match.scoreHome}
                                        </span>
                                        <span className="mx-2 sm:mx-3 text-navy-600 font-black">-</span>
                                        <span className="font-display text-3xl sm:text-4xl font-bold text-cream-100 min-w-[1ch] text-center drop-shadow-sm">
                                            {match.scoreAway}
                                        </span>
                                    </div>

                                    {/* Away (Opponent) */}
                                    <div className="flex flex-col items-center flex-1 z-10">
                                        <div className="h-14 w-14 sm:h-16 sm:w-16 relative mb-3 bg-navy-950 border border-navy-800 rounded-full flex items-center justify-center transition-transform duration-500 group-hover:scale-105 shadow-inner overflow-hidden">
                                            {match.opponentLogo ? (
                                                <Image
                                                    src={match.opponentLogo}
                                                    alt={match.opponent}
                                                    fill
                                                    sizes="(max-width: 640px) 56px, 64px"
                                                    className="object-contain p-2"
                                                />
                                            ) : (
                                                <span className="text-xl sm:text-2xl font-display font-black text-navy-700/60 mix-blend-overlay">
                                                    {match.opponent.substring(0, 2).toUpperCase()}
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-[10px] sm:text-xs uppercase tracking-widest font-bold text-cream-100 text-center truncate w-full px-1" title={match.opponent}>
                                            {match.opponent}
                                        </span>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>

                {/* Mobile View All */}
                <div className="mt-8 text-center sm:hidden">
                    <Link href="/jogos" className="flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-widest text-blue-400 hover:text-blue-300 transition-colors w-full p-4 bg-navy-900 border border-navy-800 rounded-xl hover:bg-navy-800/80">
                        Ver Todos os Resultados
                        <ChevronRight className="w-4 h-4" />
                    </Link>
                </div>
            </Container>
        </section>
    );
}
