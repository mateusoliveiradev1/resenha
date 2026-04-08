import { db } from "@resenha/db";
import { championships, clubs } from "@resenha/db/schema";
import { asc, desc, eq } from "drizzle-orm";
import { NovaPartidaForm } from "./NovaPartidaForm";

export const dynamic = "force-dynamic";

export default async function NovaPartidaPage() {
    const [clubsData, championshipsData] = await Promise.all([
        db.query.clubs.findMany({
            where: eq(clubs.isActive, true),
            orderBy: [asc(clubs.name)],
        }),
        db.query.championships.findMany({
            orderBy: [desc(championships.startsAt), asc(championships.name)],
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
            }))}
        />
    );
}
