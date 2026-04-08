import type { Metadata } from "next";
import { presentMatches } from "@resenha/db";
import { db } from "@resenha/db";
import { championshipGroups, championshipParticipants, championships, clubs, matches } from "@resenha/db/schema";
import { asc, desc } from "drizzle-orm";
import { toDisplayMatch } from "@/lib/matches";
import { JogosClient } from "./JogosClient";
import { createPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = createPageMetadata({
    title: "Jogos",
    description:
        "Acompanhe os jogos do Resenha RFC com agenda, resultados e histórico de partidas de futebol de campo e futsal.",
    path: "/jogos",
    keywords: ["jogos", "agenda", "resultados", "histórico", "futsal", "campo"]
});

export default async function JogosPage() {
    const [matchRows, clubsData, championshipsData, participantRows, groupRows] = await Promise.all([
        db.select().from(matches).orderBy(desc(matches.date)),
        db.query.clubs.findMany({
            orderBy: [asc(clubs.name)],
        }),
        db.query.championships.findMany({
            orderBy: [desc(championships.startsAt), asc(championships.name)],
        }),
        db.query.championshipParticipants.findMany(),
        db.query.championshipGroups.findMany({
            orderBy: [asc(championshipGroups.displayOrder), asc(championshipGroups.name)],
        }),
    ]);

    const matchList = presentMatches({
        matches: matchRows,
        clubs: clubsData,
        championships: championshipsData,
        participants: participantRows,
        groups: groupRows,
    })
        .filter((match) => match.isResenhaMatch)
        .map((match) => toDisplayMatch(match));

    return <JogosClient matches={matchList} />;
}
