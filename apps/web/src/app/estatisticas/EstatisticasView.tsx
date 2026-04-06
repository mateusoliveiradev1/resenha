"use client";

import * as React from "react";
import { Badge, Card, CardContent, Tabs } from "@resenha/ui";
import { RankingList, type RankItem } from "@/components/estatisticas/RankingList";

interface EstatisticasViewProps {
    goalsRanking: RankItem[];
    assistsRanking: RankItem[];
    cardsRanking: RankItem[];
}

type TabId = "GOLS" | "ASSISTENCIAS" | "CARTOES";

interface TabConfig {
    label: string;
    valueLabel: string;
    eyebrow: string;
    description: string;
    data: RankItem[];
    badgeVariant: "gold" | "accent" | "warning";
    gradientClass: string;
}

export function EstatisticasView({ goalsRanking, assistsRanking, cardsRanking }: EstatisticasViewProps) {
    const [activeTab, setActiveTab] = React.useState<TabId>("GOLS");

    const tabConfigs: Record<TabId, TabConfig> = {
        GOLS: {
            label: "Artilharia",
            valueLabel: "gols",
            eyebrow: "Impacto ofensivo",
            description: "Os jogadores que mais decidiram o placar e puxaram a produção ofensiva do Resenha.",
            data: goalsRanking,
            badgeVariant: "gold",
            gradientClass: "from-gold-400/18 via-gold-400/8 to-transparent"
        },
        ASSISTENCIAS: {
            label: "Assistências",
            valueLabel: "assist.",
            eyebrow: "Criação de jogadas",
            description: "Quem mais serviu o time e acelerou as conexões entre construção e finalização.",
            data: assistsRanking,
            badgeVariant: "accent",
            gradientClass: "from-blue-500/18 via-blue-500/8 to-transparent"
        },
        CARTOES: {
            label: "Cartões",
            valueLabel: "cartões",
            eyebrow: "Disciplina competitiva",
            description: "Leitura de intensidade e controle emocional ao longo da temporada.",
            data: cardsRanking,
            badgeVariant: "warning",
            gradientClass: "from-yellow-500/18 via-yellow-500/8 to-transparent"
        }
    };

    const tabs = [
        { id: "GOLS", label: "Artilharia" },
        { id: "ASSISTENCIAS", label: "Assistências" },
        { id: "CARTOES", label: "Cartões" }
    ];

    const activeTabConfig = tabConfigs[activeTab];
    const leader = activeTabConfig.data[0];
    const podium = activeTabConfig.data.slice(0, 3);

    return (
        <>
            <Tabs
                tabs={tabs}
                activeId={activeTab}
                onChange={(id) => setActiveTab(id as TabId)}
                variant="pills"
                className="mb-10 justify-center sm:justify-start"
            />

            <div className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.45fr)]">
                <Card variant="glass" className="relative overflow-hidden border-cream-100/10">
                    <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${activeTabConfig.gradientClass}`} />
                    <CardContent className="relative flex h-full flex-col justify-between p-6">
                        <div>
                            <Badge variant={activeTabConfig.badgeVariant} className="mb-4">
                                {activeTabConfig.eyebrow}
                            </Badge>
                            <h2 className="font-display text-3xl font-bold tracking-tight text-cream-100">
                                {activeTabConfig.label}
                            </h2>
                            <p className="mt-3 max-w-md text-sm leading-6 text-cream-300">
                                {activeTabConfig.description}
                            </p>
                        </div>

                        {leader ? (
                            <div className="mt-10 rounded-[1.75rem] border border-cream-100/10 bg-navy-950/60 p-5 shadow-[0_18px_40px_rgba(0,0,0,0.24)]">
                                <p className="text-xs uppercase tracking-[0.28em] text-cream-300/70">
                                    Líder atual
                                </p>
                                <div className="mt-3 flex items-end justify-between gap-4">
                                    <div className="min-w-0">
                                        <p className="truncate font-display text-2xl font-bold text-cream-100">
                                            {leader.playerNickname}
                                        </p>
                                        <p className="mt-1 text-sm text-cream-300">
                                            {leader.playerName}
                                        </p>
                                    </div>
                                    <div className="shrink-0 text-right">
                                        <p className="font-display text-4xl font-black text-cream-100">
                                            {leader.value}
                                        </p>
                                        <p className="text-xs uppercase tracking-[0.24em] text-cream-300/70">
                                            {activeTabConfig.valueLabel}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="mt-10 rounded-[1.75rem] border border-dashed border-cream-100/10 bg-navy-950/35 p-5 text-sm leading-6 text-cream-300">
                                Os números dessa aba vão aparecer automaticamente quando a comissão registrar os dados das partidas.
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    {podium.length > 0 && (
                        <div className="grid gap-3 sm:grid-cols-3">
                            {podium.map((item, index) => (
                                <div
                                    key={item.id}
                                    className="rounded-2xl border border-navy-800 bg-navy-900/80 p-4 shadow-[0_16px_32px_rgba(0,0,0,0.18)]"
                                >
                                    <p className="text-xs uppercase tracking-[0.26em] text-cream-300/60">
                                        Top {index + 1}
                                    </p>
                                    <p className="mt-3 truncate font-display text-xl font-bold text-cream-100">
                                        {item.playerNickname}
                                    </p>
                                    <p className="mt-1 text-sm text-cream-300">
                                        {item.value} {activeTabConfig.valueLabel}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}

                    <RankingList data={activeTabConfig.data} valueLabel={activeTabConfig.valueLabel} />
                </div>
            </div>
        </>
    );
}
