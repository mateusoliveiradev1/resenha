"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@resenha/ui";

export interface RankItem {
    id: string;
    playerName: string;
    playerNickname: string;
    playerPhotoUrl?: string | null;
    value: number;
}

export interface RankingListProps {
    data: RankItem[];
    valueLabel: string;
}

export function RankingList({ data, valueLabel }: RankingListProps) {
    if (data.length === 0) {
        return (
            <div className="py-12 text-center text-cream-300 bg-navy-900/50 rounded-xl border border-navy-800">
                Nenhum dado registrado para esta estatística ainda.
            </div>
        );
    }

    const maxValue = Math.max(...data.map(d => d.value), 1); // Avoid div by zero

    return (
        <div className="flex flex-col space-y-4">
            {data.map((item, index) => {
                const isFirst = index === 0;
                const widthPercent = Math.max((item.value / maxValue) * 100, 2);
                const isUploadedPhoto = item.playerPhotoUrl?.startsWith("/uploads/") ?? false;

                return (
                    <div
                        key={item.id}
                        className={cn(
                            "flex items-center gap-4 bg-navy-900 rounded-xl p-4 border transition-colors",
                            isFirst ? "border-gold-400 bg-navy-900/80 shadow-[0_0_15px_rgba(212,168,67,0.1)]" : "border-navy-800 hover:border-navy-700"
                        )}
                    >
                        {/* Rank Number */}
                        <div className={cn(
                            "flex items-center justify-center w-8 h-8 rounded-full font-display font-bold text-lg shrink-0",
                            isFirst ? "bg-gold-400 text-navy-950" : "bg-navy-800 text-cream-300"
                        )}>
                            {index + 1}
                        </div>

                        {/* Avatar */}
                        <div className={cn(
                            "relative h-12 w-12 rounded-full overflow-hidden shrink-0 border-2",
                            isFirst ? "border-gold-400" : "border-navy-800"
                        )}>
                            {item.playerPhotoUrl ? (
                                <Image
                                    src={item.playerPhotoUrl}
                                    alt={item.playerName}
                                    fill
                                    unoptimized={isUploadedPhoto}
                                    sizes="48px"
                                    className="object-cover object-top"
                                />
                            ) : (
                                <div className="flex w-full h-full bg-navy-950 items-center justify-center text-xs font-bold text-cream-300">
                                    {item.playerNickname.substring(0, 2).toUpperCase()}
                                </div>
                            )}
                        </div>

                        {/* Info and Bar */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                                <span className={cn(
                                    "font-bold truncate",
                                    isFirst ? "text-cream-100" : "text-cream-300"
                                )}>
                                    {item.playerNickname}
                                </span>
                                <span className={cn(
                                    "font-display text-xl font-bold ml-4 shrink-0",
                                    isFirst ? "text-gold-400" : "text-cream-100"
                                )}>
                                    {item.value} <span className="text-xs font-sans text-navy-700 ml-1">{valueLabel}</span>
                                </span>
                            </div>

                            {/* Visual Bar */}
                            <div className="w-full h-1.5 bg-navy-950 rounded-full overflow-hidden">
                                <div
                                    className={cn(
                                        "h-full rounded-full transition-all duration-1000 ease-out",
                                        isFirst ? "bg-gradient-to-r from-gold-400 to-[#B8941D]" : "bg-blue-500"
                                    )}
                                    style={{ width: `${widthPercent}%` }}
                                />
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
