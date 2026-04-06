"use client";

import * as React from "react";
import { Tabs } from "@resenha/ui";
import { RankingList, type RankItem } from "@/components/estatisticas/RankingList";

interface EstatisticasViewProps {
    goalsRanking: RankItem[];
    assistsRanking: RankItem[];
    cardsRanking: RankItem[];
}

export function EstatisticasView({ goalsRanking, assistsRanking, cardsRanking }: EstatisticasViewProps) {
    const [activeTab, setActiveTab] = React.useState("GOLS");

    const tabs = [
        { id: "GOLS", label: "Artilharia" },
        { id: "ASSISTENCIAS", label: "Assistencias" },
        { id: "CARTOES", label: "Cartoes" },
    ];

    return (
        <>
            <Tabs
                tabs={tabs}
                activeId={activeTab}
                onChange={setActiveTab}
                variant="pills"
                className="mb-10 justify-center sm:justify-start"
            />

            <div className="max-w-3xl">
                {activeTab === "GOLS" && <RankingList data={goalsRanking} valueLabel="gols" />}
                {activeTab === "ASSISTENCIAS" && <RankingList data={assistsRanking} valueLabel="assist." />}
                {activeTab === "CARTOES" && <RankingList data={cardsRanking} valueLabel="cartoes" />}
            </div>
        </>
    );
}
