"use client";

import { Tabs } from "@resenha/ui";

export function MatchFilters({
    activeTab,
    onChange
}: {
    activeTab: string;
    onChange: (value: string) => void;
}) {
    const tabs = [
        { id: "TODOS", label: "Todas as Partidas" },
        { id: "FUTSAL", label: "Futsal" },
        { id: "CAMPO", label: "Futebol de Campo" },
    ];

    return (
        <div className="my-8">
            <Tabs
                tabs={tabs}
                activeId={activeTab}
                onChange={onChange}
                variant="pills"
                className="justify-center sm:justify-start"
            />
        </div>
    );
}
