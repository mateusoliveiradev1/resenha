"use client";

import * as React from "react";
import { Container } from "@resenha/ui";
import Image from "next/image";
import { Calendar, MapPin, Radio } from "lucide-react";

export interface NextMatch {
    opponent: string;
    opponentLogo?: string | null;
    date: Date;
    location: string;
    type: string;
    season?: string | null;
}

export function NextMatchBanner({ match }: { match?: NextMatch | null }) {
    const [timeLeft, setTimeLeft] = React.useState({ d: 0, h: 0, m: 0, s: 0 });
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
        if (!match) return;

        const interval = setInterval(() => {
            const now = new Date().getTime();
            const distance = match.date.getTime() - now;

            if (distance < 0) {
                clearInterval(interval);
                return;
            }

            setTimeLeft({
                d: Math.floor(distance / (1000 * 60 * 60 * 24)),
                h: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                m: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
                s: Math.floor((distance % (1000 * 60)) / 1000),
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [match]);

    if (!match) return null;

    const formatDate = (date: Date) => {
        return date.toLocaleDateString("pt-BR", {
            weekday: "short",
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
        }).replace(".", "").toUpperCase();
    };

    return (
        <section className="relative z-20 -mt-24 md:-mt-32 pb-12 px-4 sm:px-0">
            <Container>
                <div className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-navy-900 border border-blue-500/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-80" />
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/20 via-navy-900 to-navy-900/90" />

                    <div className="relative flex flex-col lg:flex-row items-stretch">
                        <div className="flex-1 p-6 sm:p-8 md:p-10 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-navy-800/80 bg-navy-950/20 backdrop-blur-sm">
                            <div className="flex flex-wrap items-center gap-3 mb-6">
                                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] sm:text-xs font-bold tracking-widest uppercase">
                                    <Radio className="w-3 h-3 md:w-3.5 md:h-3.5 animate-pulse" />
                                    <span>Proximo Jogo</span>
                                </div>
                                <span className="text-xs font-bold tracking-widest text-navy-400 uppercase">{match.type}</span>
                            </div>

                            {match.season && (
                                <div className="mb-6 inline-flex max-w-full items-center rounded-full border border-gold-500/20 bg-gold-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-gold-300">
                                    <span className="truncate">{match.season}</span>
                                </div>
                            )}

                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-cream-100 group">
                                    <div className="w-10 h-10 rounded-full bg-navy-800/80 border border-navy-700 flex items-center justify-center shrink-0 group-hover:bg-blue-500/20 group-hover:border-blue-500/40 transition-colors">
                                        <Calendar className="w-4 h-4 text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] sm:text-xs text-navy-400 uppercase tracking-wider font-semibold mb-0.5">Data</p>
                                        <p suppressHydrationWarning className="text-sm sm:text-base font-medium tracking-wide">
                                            {mounted ? formatDate(match.date) : "..."}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 text-cream-100 group">
                                    <div className="w-10 h-10 rounded-full bg-navy-800/80 border border-navy-700 flex items-center justify-center shrink-0 group-hover:bg-gold-500/20 group-hover:border-gold-500/40 transition-colors">
                                        <MapPin className="w-4 h-4 text-gold-400" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] sm:text-xs text-navy-400 uppercase tracking-wider font-semibold mb-0.5">Local</p>
                                        <p className="text-sm sm:text-base font-medium tracking-wide">{match.location}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex-[1.5] p-6 sm:p-8 md:p-10 flex flex-col justify-center items-center bg-navy-900/40 relative">
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
                                <span className="text-[12rem] md:text-[16rem] font-display font-black text-white italic">VS</span>
                            </div>

                            <div className="relative flex items-center justify-center gap-4 sm:gap-8 md:gap-12 w-full">
                                <div className="flex flex-col items-center group">
                                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 transition-transform duration-500 group-hover:scale-110">
                                        <Image
                                            src="/logo2.png"
                                            alt="Resenha RFC"
                                            fill
                                            sizes="(max-width: 640px) 80px, (max-width: 768px) 96px, 128px"
                                            className="object-contain drop-shadow-[0_10px_20px_rgba(59,130,246,0.3)]"
                                        />
                                    </div>
                                    <span className="mt-4 sm:mt-6 font-display font-bold text-cream-100 text-sm sm:text-lg md:text-xl uppercase tracking-wider">Resenha</span>
                                </div>

                                <div className="flex flex-col items-center">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-navy-950 flex items-center justify-center border border-navy-800 shadow-inner z-10">
                                        <span className="font-display font-black text-sm sm:text-base italic text-gold-400">VS</span>
                                    </div>
                                </div>

                                <div className="flex flex-col items-center group">
                                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 flex items-center justify-center bg-navy-950/50 rounded-full border border-navy-800 transition-transform duration-500 group-hover:scale-110 overflow-hidden shadow-inner">
                                        {match.opponentLogo ? (
                                            <Image
                                                src={match.opponentLogo}
                                                alt={match.opponent}
                                                fill
                                                sizes="(max-width: 640px) 80px, (max-width: 768px) 96px, 128px"
                                                className="object-contain p-2"
                                            />
                                        ) : (
                                            <span className="text-3xl sm:text-4xl md:text-5xl font-display font-black text-navy-700/50 mix-blend-overlay">
                                                {match.opponent.substring(0, 2).toUpperCase()}
                                            </span>
                                        )}
                                    </div>
                                    <span className="mt-4 sm:mt-6 font-display font-bold text-cream-100 text-sm sm:text-lg md:text-xl uppercase tracking-wider truncate max-w-[120px] sm:max-w-[160px] text-center">
                                        {match.opponent}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 p-6 sm:p-8 md:p-10 flex flex-col justify-center items-center border-t lg:border-t-0 lg:border-l border-navy-800/80 bg-navy-950/30">
                            <div className="text-center w-full">
                                <span className="inline-block text-[10px] sm:text-xs font-bold tracking-widest text-gold-400/80 uppercase mb-6 bg-gold-400/10 px-4 py-1.5 rounded-full border border-gold-400/20">A bola vai rolar em</span>

                                <div className="flex justify-center gap-3 sm:gap-4 md:gap-6">
                                    {[
                                        { label: "Dias", value: timeLeft.d },
                                        { label: "Horas", value: timeLeft.h },
                                        { label: "Min", value: timeLeft.m },
                                        { label: "Seg", value: timeLeft.s },
                                    ].map((unit, index) => (
                                        <div key={index} className="flex flex-col items-center gap-2">
                                            <div className="relative">
                                                <div className="w-12 h-14 sm:w-14 sm:h-16 md:w-16 md:h-20 rounded-xl bg-navy-950 border border-navy-800 flex items-center justify-center shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]">
                                                    <span className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-cream-100 tabular-nums">
                                                        {unit.value.toString().padStart(2, "0")}
                                                    </span>
                                                </div>
                                                <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-navy-900/50" />
                                            </div>
                                            <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-navy-400 font-bold">{unit.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Container>
        </section>
    );
}
