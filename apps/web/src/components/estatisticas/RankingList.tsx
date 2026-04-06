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
            <div className="rounded-xl border border-navy-800 bg-navy-900/50 py-12 text-center text-cream-300">
                Nenhum dado registrado para esta estatística ainda.
            </div>
        );
    }

    const maxValue = Math.max(...data.map((item) => item.value), 1);

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
                            "flex items-center gap-4 rounded-xl border bg-navy-900 p-4 transition-colors",
                            isFirst
                                ? "border-gold-400 bg-navy-900/80 shadow-[0_0_15px_rgba(212,168,67,0.1)]"
                                : "border-navy-800 hover:border-navy-700"
                        )}
                    >
                        <div
                            className={cn(
                                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-display text-lg font-bold",
                                isFirst ? "bg-gold-400 text-navy-950" : "bg-navy-800 text-cream-300"
                            )}
                        >
                            {index + 1}
                        </div>

                        <div
                            className={cn(
                                "relative h-12 w-12 shrink-0 overflow-hidden rounded-full border-2",
                                isFirst ? "border-gold-400" : "border-navy-800"
                            )}
                        >
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
                                <div className="flex h-full w-full items-center justify-center bg-navy-950 text-xs font-bold text-cream-300">
                                    {item.playerNickname.substring(0, 2).toUpperCase()}
                                </div>
                            )}
                        </div>

                        <div className="min-w-0 flex-1">
                            <div className="mb-2 flex items-center justify-between">
                                <span className={cn("truncate font-bold", isFirst ? "text-cream-100" : "text-cream-300")}>
                                    {item.playerNickname}
                                </span>
                                <span
                                    className={cn(
                                        "ml-4 shrink-0 font-display text-xl font-bold",
                                        isFirst ? "text-gold-400" : "text-cream-100"
                                    )}
                                >
                                    {item.value} <span className="ml-1 text-xs font-sans text-cream-300/80">{valueLabel}</span>
                                </span>
                            </div>

                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-navy-950">
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
