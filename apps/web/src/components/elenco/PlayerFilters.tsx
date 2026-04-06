"use client";

import * as React from "react";
import { Tabs } from "@resenha/ui";

export function PlayerFilters() {
    const [activeTab, setActiveTab] = React.useState("TODOS");

    const tabs = [
        { id: "TODOS", label: "Todos" },
        { id: "GOL", label: "Goleiros" },
        { id: "DEF", label: "Defensores" },
        { id: "MEI", label: "Meias" },
        { id: "ATA", label: "Atacantes" },
    ];

    return (
        <div className="my-8">
            <Tabs
                tabs={tabs}
                activeId={activeTab}
                onChange={setActiveTab}
                variant="pills"
                className="justify-center sm:justify-start"
            />
        </div>
    );
}
