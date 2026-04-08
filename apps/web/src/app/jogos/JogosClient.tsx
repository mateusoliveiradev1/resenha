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

const MATCHES_PAGE_SIZE = 8;

export function JogosClient({ matches }: { matches: Match[] }) {
    const [activeType, setActiveType] = React.useState("TODOS");
    const [currentPage, setCurrentPage] = React.useState(1);

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

    React.useEffect(() => {
        setCurrentPage(1);
    }, [activeType]);

    const totalPages = Math.max(1, Math.ceil(filteredMatches.length / MATCHES_PAGE_SIZE));
    React.useEffect(() => {
        setCurrentPage((currentValue) => Math.min(currentValue, totalPages));
    }, [totalPages]);
    const paginatedMatches = filteredMatches.slice(
        (currentPage - 1) * MATCHES_PAGE_SIZE,
        currentPage * MATCHES_PAGE_SIZE,
    );

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
                    <>
                        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-sm text-cream-300">
                                {filteredMatches.length} jogo(s) encontrados
                            </p>
                            <p className="text-sm text-cream-300">
                                Pagina {currentPage} de {totalPages}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                            {paginatedMatches.map((match) => (
                                <MatchCard key={match.id} match={match} />
                            ))}
                        </div>

                        {totalPages > 1 && (
                            <div className="mt-8 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setCurrentPage((currentValue) => Math.max(1, currentValue - 1))}
                                    disabled={currentPage === 1}
                                    className="rounded-full border border-navy-700 px-4 py-2 text-sm font-medium text-cream-100 transition-colors hover:border-blue-500/40 hover:text-blue-200 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Pagina anterior
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setCurrentPage((currentValue) => Math.min(totalPages, currentValue + 1))}
                                    disabled={currentPage === totalPages}
                                    className="rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-200 transition-colors hover:border-blue-400/50 hover:bg-blue-500/15 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Proxima pagina
                                </button>
                            </div>
                        )}
                    </>
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
