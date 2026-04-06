"use client";

import * as React from "react";
import { PlayerCard, type Player } from "@/components/elenco/PlayerCard";
import { Tabs } from "@resenha/ui";

export function ElencoView({ players }: { players: Player[] }) {
    const [activeTab, setActiveTab] = React.useState("TODOS");

    const tabs = [
        { id: "TODOS", label: "Todos" },
        { id: "GOL", label: "Goleiros" },
        { id: "DEF", label: "Defensores" },
        { id: "MEI", label: "Meias" },
        { id: "ATA", label: "Atacantes" },
    ];

    const filteredPlayers = players.filter(p => {
        if (activeTab === "TODOS") return true;
        return p.position === activeTab;
    });

    return (
        <>
            <div className="my-8">
                <Tabs
                    tabs={tabs}
                    activeId={activeTab}
                    onChange={setActiveTab}
                    variant="pills"
                    className="justify-center sm:justify-start"
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredPlayers.length > 0 ? (
                    filteredPlayers.map((player) => (
                        <PlayerCard key={player.id} player={player} />
                    ))
                ) : (
                    <div className="col-span-full py-12 text-center">
                        <p className="text-cream-300">Nenhum jogador encontrado para esta posição.</p>
                    </div>
                )}
            </div>
        </>
    );
}
