import * as React from "react";
import { notFound } from "next/navigation";
import { db } from "@resenha/db";
import { matches, matchStats, players } from "@resenha/db/schema";
import { asc, eq } from "drizzle-orm";
import { EditarPartidaForm } from "./EditarPartidaForm";

export const dynamic = "force-dynamic";

export default async function EditarPartidaPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    // Fetch real match data
    const matchData = await db.query.matches.findFirst({
        where: eq(matches.id, id),
    });

    if (!matchData) {
        notFound();
    }

    // Fetch related player stats
    const statsData = await db.query.matchStats.findMany({
        where: eq(matchStats.matchId, id),
    });

    const playersData = await db.query.players.findMany({
        where: eq(players.isActive, true),
        orderBy: [asc(players.shirtNumber)]
    });

    return <EditarPartidaForm match={matchData} stats={statsData} players={playersData} />;
}
