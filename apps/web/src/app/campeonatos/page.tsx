import Link from "next/link";
import { Badge, Card, CardContent, Container } from "@resenha/ui";
import { db, presentMatches } from "@resenha/db";
import { championshipGroups, championshipParticipants, championships, clubs, matches } from "@resenha/db/schema";
import { asc, desc } from "drizzle-orm";
import { createPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata = createPageMetadata({
    title: "Campeonatos",
    description: "Acompanhe os campeonatos do Resenha RFC com tabelas, rodadas, jogos e campanha atualizada automaticamente.",
    path: "/campeonatos",
    keywords: ["campeonatos", "tabela", "classificacao", "rodadas", "resenha rfc"],
});

const statusLabel = {
    PLANNED: "Planejado",
    LIVE: "Em andamento",
    FINISHED: "Encerrado",
} as const;

function formatFixtureLabel(match: { homeTeam: { shortName: string }; awayTeam: { shortName: string } }) {
    return `${match.homeTeam.shortName} x ${match.awayTeam.shortName}`;
}

export default async function CampeonatosPage() {
    const [championshipRows, participantRows, groupRows, matchRows, clubsData] = await Promise.all([
        db.query.championships.findMany({
            orderBy: [desc(championships.startsAt), asc(championships.name)],
        }),
        db.query.championshipParticipants.findMany(),
        db.query.championshipGroups.findMany({
            orderBy: [asc(championshipGroups.displayOrder), asc(championshipGroups.name)],
        }),
        db.query.matches.findMany({
            orderBy: [desc(matches.date)],
        }),
        db.query.clubs.findMany({
            orderBy: [asc(clubs.name)],
        }),
    ]);

    const participantsByChampionship = new Map<string, number>();
    for (const participant of participantRows) {
        participantsByChampionship.set(
            participant.championshipId,
            (participantsByChampionship.get(participant.championshipId) ?? 0) + 1,
        );
    }

    const presentedMatches = presentMatches({
        matches: matchRows,
        clubs: clubsData,
        championships: championshipRows,
        participants: participantRows,
        groups: groupRows,
    });
    const matchesByChampionship = new Map<string, typeof presentedMatches>();

    for (const match of presentedMatches) {
        const championshipId = match.championshipId;

        if (!championshipId) {
            continue;
        }

        const current = matchesByChampionship.get(championshipId) ?? [];
        current.push(match);
        matchesByChampionship.set(championshipId, current);
    }

    return (
        <div className="min-h-screen py-12 lg:py-20">
            <Container>
                <div className="max-w-3xl">
                    <Badge variant="gold" className="mb-4">
                        Modulo de competicoes
                    </Badge>
                    <h1 className="font-display text-4xl font-bold tracking-tight text-cream-100 sm:text-5xl">
                        Campeonatos
                    </h1>
                    <p className="mt-4 text-lg text-cream-300">
                        Tabelas, fases, jogos e campanha do Resenha RFC centralizados em um unico motor de competicao.
                    </p>
                </div>

                <div className="mt-10 grid gap-6 lg:grid-cols-2">
                    {championshipRows.map((championship) => {
                        const competitionMatches = matchesByChampionship.get(championship.id) ?? [];
                        const upcomingMatch = competitionMatches
                            .filter((match) => match.status !== "FINISHED")
                            .sort((left, right) => left.date.getTime() - right.date.getTime())[0];
                        const latestFinishedMatch = competitionMatches
                            .filter((match) => match.status === "FINISHED")
                            .sort((left, right) => right.date.getTime() - left.date.getTime())[0];

                        return (
                            <Link key={championship.id} href={`/campeonatos/${championship.slug}`}>
                                <Card className="h-full border-navy-800 bg-navy-900/90 transition-all hover:-translate-y-1 hover:border-blue-500/30 hover:shadow-[0_12px_40px_rgba(37,99,235,0.12)]">
                                    <CardContent className="space-y-6 p-6">
                                        <div className="flex flex-wrap items-start justify-between gap-3">
                                            <div>
                                                <h2 className="font-display text-3xl font-bold text-cream-100">
                                                    {championship.name}
                                                </h2>
                                                <p className="mt-2 text-sm text-cream-300">
                                                    {championship.seasonLabel ?? "Edicao atual"} • {championship.surface}
                                                </p>
                                            </div>
                                            <Badge variant={championship.status === "LIVE" ? "danger" : championship.status === "FINISHED" ? "outline" : "accent"}>
                                                {statusLabel[championship.status]}
                                            </Badge>
                                        </div>

                                        <div className="grid gap-3 sm:grid-cols-3">
                                            <div className="rounded-2xl border border-navy-800 bg-navy-950/50 p-4">
                                                <p className="text-xs uppercase tracking-[0.22em] text-cream-300/60">Participantes</p>
                                                <p className="mt-3 font-display text-3xl font-bold text-cream-100">
                                                    {participantsByChampionship.get(championship.id) ?? 0}
                                                </p>
                                            </div>
                                            <div className="rounded-2xl border border-navy-800 bg-navy-950/50 p-4">
                                                <p className="text-xs uppercase tracking-[0.22em] text-cream-300/60">Jogos</p>
                                                <p className="mt-3 font-display text-3xl font-bold text-cream-100">
                                                    {competitionMatches.length}
                                                </p>
                                            </div>
                                            <div className="rounded-2xl border border-navy-800 bg-navy-950/50 p-4">
                                                <p className="text-xs uppercase tracking-[0.22em] text-cream-300/60">Formato</p>
                                                <p className="mt-3 text-sm font-semibold uppercase tracking-[0.18em] text-cream-100">
                                                    {championship.format.replaceAll("_", " ")}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            {upcomingMatch ? (
                                                <div className="rounded-2xl border border-blue-500/15 bg-blue-500/5 p-4">
                                                    <p className="text-xs uppercase tracking-[0.22em] text-blue-300/70">Proximo compromisso</p>
                                                    <p className="mt-2 text-lg font-semibold text-cream-100">
                                                        {formatFixtureLabel(upcomingMatch)}
                                                    </p>
                                                    <p className="mt-1 text-sm text-cream-300">
                                                        {upcomingMatch.date.toLocaleDateString("pt-BR")} • {upcomingMatch.location}
                                                    </p>
                                                </div>
                                            ) : latestFinishedMatch ? (
                                                <div className="rounded-2xl border border-gold-500/15 bg-gold-500/5 p-4">
                                                    <p className="text-xs uppercase tracking-[0.22em] text-gold-300/70">Ultimo resultado</p>
                                                    <p className="mt-2 text-lg font-semibold text-cream-100">
                                                        {formatFixtureLabel(latestFinishedMatch)}
                                                    </p>
                                                    <p className="mt-1 text-sm text-cream-300">
                                                        {latestFinishedMatch.date.toLocaleDateString("pt-BR")} • {latestFinishedMatch.location}
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="rounded-2xl border border-dashed border-navy-700 bg-navy-950/40 p-4 text-sm text-cream-300">
                                                    Ainda nao ha jogos cadastrados para esta competicao.
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        );
                    })}
                </div>
            </Container>
        </div>
    );
}
