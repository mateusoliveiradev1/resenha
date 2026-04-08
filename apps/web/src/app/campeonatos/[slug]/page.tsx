import { notFound } from "next/navigation";
import { Badge, Card, CardContent, Container } from "@resenha/ui";
import { buildStandings, db, presentMatches } from "@resenha/db";
import { championshipGroups, championshipParticipants, championships, clubs, matches } from "@resenha/db/schema";
import { asc, eq } from "drizzle-orm";
import { MatchCard } from "@/components/jogos/MatchCard";
import { toDisplayMatch } from "@/lib/matches";

export const dynamic = "force-dynamic";

function formatFixtureLabel(match: ReturnType<typeof presentMatches>[number]) {
    return `${match.homeTeam.shortName} x ${match.awayTeam.shortName}`;
}

export default async function CampeonatoDetalhePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const now = new Date();

    const championship = await db.query.championships.findFirst({
        where: eq(championships.slug, slug),
    });

    if (!championship) {
        notFound();
    }

    const [clubsData, participantRows, groupRows, matchRows] = await Promise.all([
        db.query.clubs.findMany({
            orderBy: [asc(clubs.name)],
        }),
        db.query.championshipParticipants.findMany({
            where: eq(championshipParticipants.championshipId, championship.id),
            orderBy: [asc(championshipParticipants.displayOrder)],
        }),
        db.query.championshipGroups.findMany({
            where: eq(championshipGroups.championshipId, championship.id),
            orderBy: [asc(championshipGroups.displayOrder), asc(championshipGroups.name)],
        }),
        db.query.matches.findMany({
            where: eq(matches.championshipId, championship.id),
            orderBy: [asc(matches.date)],
        }),
    ]);

    const presentedMatches = presentMatches({
        matches: matchRows,
        clubs: clubsData,
        championships: [championship],
        participants: participantRows,
        groups: groupRows,
    });
    const standings = buildStandings({
        championship,
        participants: participantRows.map((participant) => ({ clubId: participant.clubId })),
        matches: presentedMatches,
        clubs: clubsData,
    });

    const liveOrUpcomingMatches = presentedMatches
        .filter((match) => match.status === "LIVE" || (match.status === "SCHEDULED" && match.date.getTime() >= now.getTime()))
        .sort((left, right) => left.date.getTime() - right.date.getTime());
    const finishedMatches = presentedMatches
        .filter((match) => match.status === "FINISHED")
        .sort((left, right) => right.date.getTime() - left.date.getTime());

    return (
        <div className="min-h-screen py-12 lg:py-20">
            <Container>
                <section className="overflow-hidden rounded-[2rem] border border-navy-800 bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.22),_transparent_32%),linear-gradient(180deg,rgba(10,22,40,0.96),rgba(6,14,26,1))] px-6 py-8 shadow-[0_28px_60px_rgba(0,0,0,0.24)] sm:px-8 lg:px-12 lg:py-12">
                    <div className="max-w-3xl">
                        <Badge variant="gold" className="mb-4">
                            Competicao automatizada
                        </Badge>
                        <h1 className="font-display text-4xl font-bold tracking-tight text-cream-100 sm:text-5xl">
                            {championship.name}
                        </h1>
                        <p className="mt-4 text-lg text-cream-300">
                            {championship.description ?? "Classificacao, jogos, campanha e contexto completo da competicao."}
                        </p>

                        <div className="mt-6 flex flex-wrap gap-3">
                            <Badge variant="outline" className="border-cream-100/10 bg-navy-950/40 text-cream-100">
                                {championship.seasonLabel ?? "Edicao atual"}
                            </Badge>
                            <Badge variant="outline" className="border-cream-100/10 bg-navy-950/40 text-cream-100">
                                {championship.surface}
                            </Badge>
                            <Badge variant="outline" className="border-cream-100/10 bg-navy-950/40 text-cream-100">
                                {participantRows.length} participantes
                            </Badge>
                            <Badge variant="outline" className="border-cream-100/10 bg-navy-950/40 text-cream-100">
                                {matchRows.length} jogos cadastrados
                            </Badge>
                        </div>
                    </div>
                </section>

                <section className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.95fr)]">
                    <Card variant="glass" className="border-cream-100/8">
                        <CardContent className="p-6">
                            <div className="mb-6">
                                <Badge variant="accent" className="mb-4">
                                    Tabela
                                </Badge>
                                <h2 className="font-display text-3xl font-bold tracking-tight text-cream-100">
                                    Classificacao automatica
                                </h2>
                                <p className="mt-3 text-sm leading-7 text-cream-300">
                                    Pontos, saldo, vitorias e ordem da tabela recalculados a partir dos placares lancados no admin.
                                </p>
                            </div>

                            <div className="overflow-hidden rounded-3xl border border-navy-800">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-navy-950/80 text-cream-300">
                                        <tr>
                                            <th className="px-4 py-3 text-xs uppercase tracking-[0.18em]">Pos</th>
                                            <th className="px-4 py-3 text-xs uppercase tracking-[0.18em]">Clube</th>
                                            <th className="px-3 py-3 text-xs uppercase tracking-[0.18em]">P</th>
                                            <th className="px-3 py-3 text-xs uppercase tracking-[0.18em]">J</th>
                                            <th className="px-3 py-3 text-xs uppercase tracking-[0.18em]">V</th>
                                            <th className="px-3 py-3 text-xs uppercase tracking-[0.18em]">E</th>
                                            <th className="px-3 py-3 text-xs uppercase tracking-[0.18em]">D</th>
                                            <th className="px-3 py-3 text-xs uppercase tracking-[0.18em]">SG</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {standings.map((row) => (
                                            <tr key={row.clubId} className="border-t border-navy-800 bg-navy-900/60 text-cream-100">
                                                <td className="px-4 py-3 font-display text-lg font-bold">{row.position}</td>
                                                <td className="px-4 py-3 font-semibold">{row.clubShortName}</td>
                                                <td className="px-3 py-3">{row.points}</td>
                                                <td className="px-3 py-3">{row.played}</td>
                                                <td className="px-3 py-3">{row.wins}</td>
                                                <td className="px-3 py-3">{row.draws}</td>
                                                <td className="px-3 py-3">{row.losses}</td>
                                                <td className="px-3 py-3">{row.goalDifference >= 0 ? `+${row.goalDifference}` : row.goalDifference}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>

                    <Card variant="glass" className="border-cream-100/8">
                        <CardContent className="p-6">
                            <div className="mb-6">
                                <Badge variant="outline" className="mb-4 border-cream-100/10 bg-navy-950/40 text-cream-100">
                                    Resumo
                                </Badge>
                                <h2 className="font-display text-3xl font-bold tracking-tight text-cream-100">
                                    Leitura rapida
                                </h2>
                            </div>

                            <div className="space-y-4">
                                <div className="rounded-2xl border border-navy-800 bg-navy-950/50 p-4">
                                    <p className="text-xs uppercase tracking-[0.22em] text-cream-300/60">Proximo jogo</p>
                                    <p className="mt-3 text-lg font-semibold text-cream-100">
                                        {liveOrUpcomingMatches[0] ? formatFixtureLabel(liveOrUpcomingMatches[0]) : "A definir"}
                                    </p>
                                </div>
                                <div className="rounded-2xl border border-navy-800 bg-navy-950/50 p-4">
                                    <p className="text-xs uppercase tracking-[0.22em] text-cream-300/60">Ultimo resultado</p>
                                    <p className="mt-3 text-lg font-semibold text-cream-100">
                                        {finishedMatches[0] ? formatFixtureLabel(finishedMatches[0]) : "Ainda sem resultado"}
                                    </p>
                                </div>
                                <div className="rounded-2xl border border-navy-800 bg-navy-950/50 p-4">
                                    <p className="text-xs uppercase tracking-[0.22em] text-cream-300/60">Status</p>
                                    <p className="mt-3 text-lg font-semibold text-cream-100">
                                        {championship.status === "LIVE" ? "Competicao em andamento" : championship.status === "FINISHED" ? "Competicao encerrada" : "Competicao planejada"}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                <section className="mt-12">
                    <div className="mb-6">
                        <Badge variant="accent" className="mb-4">
                            Agenda da competicao
                        </Badge>
                        <h2 className="font-display text-3xl font-bold tracking-tight text-cream-100">
                            Jogos e rodadas
                        </h2>
                    </div>

                    {presentedMatches.length > 0 ? (
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                            {presentedMatches.map((match) => (
                                <MatchCard key={match.id} match={toDisplayMatch(match, { perspective: "FIXTURE" })} />
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-3xl border border-dashed border-navy-800 bg-navy-900/20 px-6 py-16 text-center">
                            <h2 className="font-display text-2xl font-bold text-cream-100">Nenhuma partida cadastrada</h2>
                            <p className="mt-3 text-sm text-cream-300">
                                Assim que os confrontos forem lancados no admin, eles aparecem aqui automaticamente.
                            </p>
                        </div>
                    )}
                </section>
            </Container>
        </div>
    );
}
