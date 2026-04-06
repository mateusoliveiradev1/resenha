"use client";

import * as React from "react";
import Image from "next/image";
import { Card, Badge } from "@resenha/ui";
import type { BadgeProps } from "@resenha/ui";
import { Activity } from "lucide-react";

export interface PlayerStats {
    goals: number;
    assists: number;
    matchesPlayed: number;
    age: number;
    heightCm?: number | null;
    preferredFoot?: string | null;
}

export interface Player {
    id: string;
    name: string;
    nickname: string;
    position: "GOL" | "DEF" | "MEI" | "ATA";
    shirtNumber: number;
    photoUrl?: string | null;
    stats: PlayerStats;
}

export function PlayerCard({ player }: { player: Player }) {
    const isUploadedPhoto = player.photoUrl?.startsWith("/uploads/") ?? false;

    const getPositionColor = (pos: Player["position"]): NonNullable<BadgeProps["variant"]> => {
        switch (pos) {
            case "GOL": return "warning";
            case "DEF": return "accent";
            case "MEI": return "success";
            case "ATA": return "danger";
            default: return "default";
        }
    };

    return (
        <Card className="group relative overflow-hidden h-[400px] cursor-pointer rounded-2xl border border-navy-800 bg-navy-950 transition-all duration-500 hover:border-gold-500/40 hover:shadow-[0_10px_40px_rgba(234,179,8,0.15)] hover:-translate-y-1">
            {/* Background/Photo */}
            <div className="absolute inset-0 z-0 bg-navy-950">
                {player.photoUrl ? (
                    <Image
                        src={player.photoUrl}
                        alt={player.name}
                        fill
                        unoptimized={isUploadedPhoto}
                        sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover object-top transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-navy-800 to-navy-950">
                        <span className="font-display text-[10rem] font-bold text-navy-900/40 select-none">
                            {player.shirtNumber}
                        </span>
                    </div>
                )}
            </div>

            {/* Gradient overlays for readability */}
            <div className="absolute inset-0 z-10 bg-gradient-to-t from-navy-950 via-navy-950/40 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-500" />
            <div className="absolute inset-0 z-10 bg-gradient-to-b from-navy-950/60 to-transparent opacity-80" />

            {/* Hover Data Overlay */}
            <div className="absolute inset-0 z-20 bg-navy-950/90 opacity-0 backdrop-blur-md transition-all duration-500 group-hover:opacity-100 flex flex-col justify-center p-6 text-center transform translate-y-4 group-hover:translate-y-0">

                <div className="mb-2 flex justify-center">
                    <div className="px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-400 text-[10px] font-bold tracking-widest uppercase flex items-center gap-1.5 mb-4">
                        <Activity className="w-3 h-3" />
                        <span>Estatísticas</span>
                    </div>
                </div>

                <h4 className="font-display text-3xl font-bold text-cream-100 mb-6 tracking-tight drop-shadow-md">{player.nickname}</h4>

                <div className="grid grid-cols-2 gap-3 w-full">
                    {[
                        { label: "Gols", value: player.stats.goals },
                        { label: "Assist.", value: player.stats.assists },
                        { label: "Jogos", value: player.stats.matchesPlayed },
                        { label: "Idade", value: player.stats.age },
                    ].map((stat, i) => (
                        <div key={i} className="flex flex-col items-center bg-navy-900/50 p-3 rounded-xl border border-navy-800/80 shadow-inner group/stat hover:bg-navy-800 transition-colors">
                            <span className="text-2xl font-display font-bold text-gold-300 drop-shadow-[0_0_12px_rgba(212,168,67,0.2)]">
                                {stat.value}
                            </span>
                            <span className="text-[10px] uppercase tracking-[0.2em] text-cream-300 font-semibold mt-1">
                                {stat.label}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="mt-6 flex justify-center gap-4 text-xs tracking-wide text-navy-300 font-semibold uppercase">
                    {player.stats.preferredFoot && (
                        <span className="flex flex-col items-center">
                            <span className="text-[9px] text-navy-500 mb-0.5">Pé</span>
                            <span className="text-cream-100">{player.stats.preferredFoot}</span>
                        </span>
                    )}
                    {player.stats.heightCm && (
                        <span className="flex flex-col items-center">
                            <span className="text-[9px] text-navy-500 mb-0.5">Alt</span>
                            <span className="text-cream-100">{player.stats.heightCm}cm</span>
                        </span>
                    )}
                </div>
            </div>

            {/* Persistent Info (Default state) */}
            <div className="absolute inset-0 z-30 flex flex-col justify-between p-5 pointer-events-none">
                <div className="flex justify-between items-start">
                    <Badge variant={getPositionColor(player.position)} className="shadow-lg backdrop-blur-md bg-opacity-90 px-3 py-1 text-xs tracking-widest uppercase ring-1 ring-white/10">
                        {player.position}
                    </Badge>

                    <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-navy-950/80 font-display text-2xl font-black text-white shadow-[0_4px_12px_rgba(0,0,0,0.5)] backdrop-blur-md ring-1 ring-white/10 group-hover:scale-110 transition-transform duration-500">
                        {/* Gold accent ring */}
                        <div className="absolute inset-0 rounded-full border-[1.5px] border-gold-500/50" />
                        {player.shirtNumber}
                    </div>
                </div>

                <div className="transition-all duration-500 transform group-hover:translate-y-8 group-hover:opacity-0">
                    <h3 className="font-display text-3xl font-black uppercase tracking-wider text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                        {player.nickname}
                    </h3>
                    <p className="text-sm font-semibold text-cream-300/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] truncate tracking-wide mt-1">
                        {player.name}
                    </p>
                </div>
            </div>
        </Card>
    );
}
