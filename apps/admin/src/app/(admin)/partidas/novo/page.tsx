import { db } from "@resenha/db";
import { championshipGroups, championships, clubs } from "@resenha/db/schema";
import { asc, desc, eq } from "drizzle-orm";
import { NovaPartidaForm } from "./NovaPartidaForm";

export const dynamic = "force-dynamic";

export default async function NovaPartidaPage() {
    const [clubsData, championshipsData, groupRows] = await Promise.all([
        db.query.clubs.findMany({
            where: eq(clubs.isActive, true),
            orderBy: [asc(clubs.name)],
        }),
        db.query.championships.findMany({
            orderBy: [desc(championships.startsAt), asc(championships.name)],
        }),
        db.query.championshipGroups.findMany({
            orderBy: [asc(championshipGroups.displayOrder), asc(championshipGroups.name)],
        }),
    ]);

    return (
        <NovaPartidaForm
            clubs={clubsData.map((club) => ({
                id: club.id,
                name: club.name,
                shortName: club.shortName,
                logoUrl: club.logoUrl,
                isResenha: club.isResenha,
            }))}
            championships={championshipsData.map((championship) => ({
                id: championship.id,
                name: championship.name,
                seasonLabel: championship.seasonLabel,
                status: championship.status,
                format: championship.format,
            }))}
            groups={groupRows.map((group) => ({
                id: group.id,
                championshipId: group.championshipId,
                name: group.name,
            }))}
        />
    );
}
