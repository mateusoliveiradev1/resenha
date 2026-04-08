import { notFound } from "next/navigation";
import { buildStandings, presentMatches } from "@resenha/db";
import { db } from "@resenha/db";
import { championshipGroups, championshipParticipants, championships, clubs, matches } from "@resenha/db/schema";
import { asc, eq } from "drizzle-orm";
import { EditChampionshipForm } from "./EditChampionshipForm";

export const dynamic = "force-dynamic";

export default async function EditChampionshipPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const [championship, clubsData, participantRows, groupRows, matchRows] = await Promise.all([
        db.query.championships.findFirst({
            where: eq(championships.id, id),
        }),
        db.query.clubs.findMany({
            orderBy: [asc(clubs.name)],
        }),
        db.query.championshipParticipants.findMany({
            where: eq(championshipParticipants.championshipId, id),
            orderBy: [asc(championshipParticipants.displayOrder)],
        }),
        db.query.championshipGroups.findMany({
            where: eq(championshipGroups.championshipId, id),
            orderBy: [asc(championshipGroups.displayOrder), asc(championshipGroups.name)],
        }),
        db.query.matches.findMany({
            where: eq(matches.championshipId, id),
            orderBy: [asc(matches.date)],
        }),
    ]);

    if (!championship) {
        notFound();
    }

    const presentedMatches = presentMatches({
        matches: matchRows,
        clubs: clubsData,
        championships: [championship],
        participants: participantRows,
        groups: groupRows,
    });
    const standingsPreview = buildStandings({
        championship,
        participants: participantRows.map((item) => ({ clubId: item.clubId })),
        matches: presentedMatches,
        clubs: clubsData,
    }).slice(0, 8);

    return (
        <EditChampionshipForm
            championship={championship}
            clubs={clubsData.map((club) => ({
                id: club.id,
                name: club.name,
                shortName: club.shortName,
                isActive: club.isActive,
                isResenha: club.isResenha,
            }))}
            participantIds={participantRows.map((item) => item.clubId)}
            standingsPreview={standingsPreview.map((row) => ({
                position: row.position,
                clubName: row.clubName,
                points: row.points,
                played: row.played,
                goalDifference: row.goalDifference,
            }))}
            totalMatches={matchRows.length}
        />
    );
}
