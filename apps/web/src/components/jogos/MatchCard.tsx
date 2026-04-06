"use client";

import * as React from "react";
import Image from "next/image";
import { Card, Badge, shouldBypassNextImageOptimization } from "@resenha/ui";
import { Clock, MapPin } from "lucide-react";

export interface Match {
    id: string;
    opponent: string;
    opponentLogo?: string | null;
    date: Date;
    location: string;
    type: "FUTSAL" | "CAMPO";
    scoreHome?: number | null;
    scoreAway?: number | null;
    status: "SCHEDULED" | "LIVE" | "FINISHED";
}

export function MatchCard({ match }: { match: Match }) {
    const isWin = match.scoreHome != null && match.scoreAway != null && match.scoreHome > match.scoreAway;
    const isLoss = match.scoreHome != null && match.scoreAway != null && match.scoreHome < match.scoreAway;
    const isDraw = match.scoreHome != null && match.scoreAway != null && match.scoreHome === match.scoreAway;

    const resultBadge = React.useMemo(() => {
        if (match.status === "SCHEDULED") return <Badge variant="default" className="bg-navy-800 text-xs px-2 py-0.5">⏳ AGENDADO</Badge>;
        if (match.status === "LIVE") return (
            <Badge variant="danger" className="bg-red-500/20 text-red-400 border border-red-500/30 text-xs px-2 py-0.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                AO VIVO
            </Badge>
        );
        if (isWin) return <Badge variant="success" className="text-xs px-2 py-0.5">✅ VITÓRIA</Badge>;
        if (isDraw) return <Badge variant="warning" className="text-xs px-2 py-0.5">🟡 EMPATE</Badge>;
        if (isLoss) return <Badge variant="danger" className="text-xs px-2 py-0.5">🔴 DERROTA</Badge>;
        return null;
    }, [match.status, isWin, isDraw, isLoss]);

    return (
        <Card className="overflow-hidden hover:-translate-y-1 transition-all duration-300 border-navy-800 bg-navy-900 group rounded-2xl shadow-lg hover:shadow-[0_8px_30px_rgba(59,130,246,0.1)] hover:border-blue-500/30">
            {/* Top row: Date & Status */}
            <div className="bg-navy-950/50 p-4 flex justify-between items-center border-b border-navy-800/80">
                <div className="flex items-center gap-3 text-xs font-semibold text-cream-300 tracking-wide">
                    <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-blue-400" />
                        <span>{match.date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}</span>
                    </div>
                    <span className="w-1 h-1 rounded-full bg-navy-700" />
                    <span>{match.date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold tracking-widest uppercase text-navy-400 bg-navy-900 border border-navy-800 px-2 py-0.5 rounded-md">{match.type}</span>
                    {resultBadge}
                </div>
            </div>

            <div className="p-6 md:p-8">
                <div className="flex items-center justify-between gap-2 md:gap-4 relative">

                    {/* Background VS Watermark */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
                        <span className="text-8xl font-display font-black italic text-white">VS</span>
                    </div>

                    {/* Home (Resenha) */}
                    <div className="flex flex-col items-center flex-1 z-10">
                        <div className="h-16 w-16 md:h-20 md:w-20 relative mb-4 transition-transform duration-500 group-hover:scale-110">
                            <Image
                                src="/logo2.png"
                                alt="Resenha RFC"
                                fill
                                sizes="(max-width: 768px) 64px, 80px"
                                className="object-contain drop-shadow-md"
                            />
                        </div>
                        <span className="text-[11px] md:text-sm uppercase tracking-widest font-bold text-cream-100 text-center truncate w-full">Resenha</span>
                    </div>

                    {/* Score / vs */}
                    <div className="flex flex-col items-center justify-center flex-shrink-0 z-10 w-24 md:w-32">
                        {match.status === "SCHEDULED" ? (
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-navy-950 border border-navy-800 flex items-center justify-center shadow-inner">
                                <span className="font-display text-lg md:text-xl font-bold text-navy-500 italic">VS</span>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center px-4 md:px-5 bg-navy-950 py-3 rounded-xl border border-navy-800 shadow-[inset_0_2px_8px_rgba(0,0,0,0.5)]">
                                <span className="font-display text-3xl md:text-4xl font-bold text-cream-100 min-w-[1ch] text-center text-shadow-sm">
                                    {match.scoreHome}
                                </span>
                                <span className="mx-2 md:mx-3 text-navy-600 font-black">-</span>
                                <span className="font-display text-3xl md:text-4xl font-bold text-cream-100 min-w-[1ch] text-center text-shadow-sm">
                                    {match.scoreAway}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Away (Opponent) */}
                    <div className="flex flex-col items-center flex-1 z-10">
                        <div className="h-16 w-16 md:h-20 md:w-20 relative mb-4 bg-navy-950 border border-navy-800 rounded-full flex items-center justify-center transition-transform duration-500 group-hover:scale-110 shadow-inner overflow-hidden">
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
                                <span className="text-xl md:text-2xl font-display font-black text-navy-700/60 mix-blend-overlay">
                                    {match.opponent.substring(0, 2).toUpperCase()}
                                </span>
                            )}
                        </div>
                        <span className="text-[11px] md:text-sm uppercase tracking-widest font-bold text-cream-100 text-center truncate w-full px-2" title={match.opponent}>
                            {match.opponent}
                        </span>
                    </div>
                </div>
            </div>

            {/* Bottom Row: Location */}
            <div className="bg-navy-900/50 p-3 px-6 flex items-center justify-center border-t border-navy-800/80">
                <div className="flex items-center gap-1.5 text-[11px] text-cream-300 font-semibold uppercase tracking-wider">
                    <MapPin className="w-3.5 h-3.5 text-navy-400" />
                    <span className="truncate max-w-[250px]">{match.location}</span>
                </div>
            </div>
        </Card>
    );
}
