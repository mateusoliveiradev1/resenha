"use client";

import * as React from "react";
import { Container } from "@resenha/ui";
import { MatchCard, type Match } from "@/components/jogos/MatchCard";
import { MatchFilters } from "@/components/jogos/MatchFilters";

const statusOrder: Record<Match["status"], number> = {
    LIVE: 0,
    SCHEDULED: 1,
    FINISHED: 2
};

export function JogosClient({ matches }: { matches: Match[] }) {
    const [activeType, setActiveType] = React.useState("TODOS");

    const filteredMatches = React.useMemo(() => {
        return [...matches]
            .filter((match) => activeType === "TODOS" || match.type === activeType)
            .sort((left, right) => {
                const statusDifference = statusOrder[left.status] - statusOrder[right.status];

                if (statusDifference !== 0) {
                    return statusDifference;
                }

                const leftDate = new Date(left.date).getTime();
                const rightDate = new Date(right.date).getTime();

                if (left.status === "FINISHED" && right.status === "FINISHED") {
                    return rightDate - leftDate;
                }

                return leftDate - rightDate;
            });
    }, [activeType, matches]);

    return (
        <div className="min-h-screen py-12 lg:py-20">
            <Container>
                <div className="max-w-2xl">
                    <h1 className="font-display text-4xl font-bold tracking-tight text-cream-100 sm:text-5xl">
                        Nossos Jogos
                    </h1>
                    <p className="mt-4 text-lg text-cream-300">
                        Acompanhe o calendario, resultados e historico de partidas do Resenha RFC.
                    </p>
                </div>

                <MatchFilters activeTab={activeType} onChange={setActiveType} />

                {filteredMatches.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        {filteredMatches.map((match) => (
                            <MatchCard key={match.id} match={match} />
                        ))}
                    </div>
                ) : (
                    <div className="rounded-3xl border border-dashed border-navy-800 bg-navy-900/20 px-6 py-16 text-center">
                        <h2 className="font-display text-2xl font-bold text-cream-100">Nenhuma partida encontrada</h2>
                        <p className="mt-3 text-sm text-cream-300">
                            Ainda nao existem jogos cadastrados para este filtro.
                        </p>
                    </div>
                )}
            </Container>
        </div>
    );
}
