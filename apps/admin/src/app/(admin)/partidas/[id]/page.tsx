import { notFound } from "next/navigation";
import { db } from "@resenha/db";
import { championships, clubs, matches, matchStats, players } from "@resenha/db/schema";
import { asc, desc, eq } from "drizzle-orm";
import { EditarPartidaForm } from "./EditarPartidaForm";

export const dynamic = "force-dynamic";

export default async function EditarPartidaPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const [matchData, statsData, playersData, clubsData, championshipsData] = await Promise.all([
        db.query.matches.findFirst({
            where: eq(matches.id, id),
        }),
        db.query.matchStats.findMany({
            where: eq(matchStats.matchId, id),
        }),
        db.query.players.findMany({
            where: eq(players.isActive, true),
            orderBy: [asc(players.shirtNumber)],
        }),
        db.query.clubs.findMany({
            where: eq(clubs.isActive, true),
            orderBy: [asc(clubs.name)],
        }),
        db.query.championships.findMany({
            orderBy: [desc(championships.startsAt), asc(championships.name)],
        }),
    ]);

    if (!matchData) {
        notFound();
    }

    return (
        <EditarPartidaForm
            match={matchData}
            stats={statsData}
            players={playersData}
            clubs={clubsData.map((club) => ({
                id: club.id,
                name: club.name,
                shortName: club.shortName,
                isResenha: club.isResenha,
            }))}
            championships={championshipsData.map((championship) => ({
                id: championship.id,
                name: championship.name,
                seasonLabel: championship.seasonLabel,
                status: championship.status,
            }))}
        />
    );
}
