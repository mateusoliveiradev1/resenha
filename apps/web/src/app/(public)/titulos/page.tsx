import type { Metadata } from "next";
import Link from "next/link";
import { Badge, Button, Card, CardContent, Container } from "@resenha/ui";
import { db } from "@resenha/db";
import { matches } from "@resenha/db/schema";
import { desc, eq } from "drizzle-orm";
import { createPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = createPageMetadata({
    title: "Títulos e Conquistas",
    description:
        "Acompanhe a página de títulos e conquistas do Resenha RFC, com a galeria institucional preparada para registrar troféus e campanhas marcantes do clube.",
    path: "/titulos",
    keywords: ["títulos", "conquistas", "campanhas", "troféus", "história do clube"]
});

interface SeasonSummary {
    season: string;
    matches: number;
    wins: number;
    draws: number;
    losses: number;
    goalsFor: number;
}

export default async function TitulosPage() {
    const finishedMatches = await db.query.matches.findMany({
        where: eq(matches.status, "FINISHED"),
        orderBy: [desc(matches.date)]
    });

    const seasonMap = new Map<string, SeasonSummary>();

    for (const match of finishedMatches) {
        const current = seasonMap.get(match.season) ?? {
            season: match.season,
            matches: 0,
            wins: 0,
            draws: 0,
            losses: 0,
            goalsFor: 0
        };

        current.matches += 1;
        current.goalsFor += match.scoreHome ?? 0;

        if ((match.scoreHome ?? 0) > (match.scoreAway ?? 0)) {
            current.wins += 1;
        } else if ((match.scoreHome ?? 0) === (match.scoreAway ?? 0)) {
            current.draws += 1;
        } else {
            current.losses += 1;
        }

        seasonMap.set(match.season, current);
    }

    const seasonSummaries = Array.from(seasonMap.values());
    const totalMatches = finishedMatches.length;
    const totalWins = seasonSummaries.reduce((sum, item) => sum + item.wins, 0);
    const totalGoals = seasonSummaries.reduce((sum, item) => sum + item.goalsFor, 0);
    const latestSeason = finishedMatches[0]?.season ?? "temporada atual";
    const highlightCards = [
        {
            label: "Temporadas registradas",
            value: String(seasonSummaries.length).padStart(2, "0"),
            description: "Ciclos já documentados no acervo do clube."
        },
        {
            label: "Partidas encerradas",
            value: String(totalMatches).padStart(2, "0"),
            description: "Base histórica disponível hoje no sistema."
        },
        {
            label: "Vitórias somadas",
            value: String(totalWins).padStart(2, "0"),
            description: "Resultados positivos que constroem legado."
        },
        {
            label: "Gols marcados",
            value: String(totalGoals).padStart(2, "0"),
            description: "Produção ofensiva que pavimenta a sala de troféus."
        }
    ];

    return (
        <div className="min-h-screen bg-navy-950 py-16 lg:py-20">
            <Container>
                <section className="relative overflow-hidden rounded-[2rem] border border-navy-800 bg-[radial-gradient(circle_at_top_left,_rgba(212,168,67,0.2),_transparent_34%),linear-gradient(180deg,rgba(10,22,40,0.97),rgba(6,14,26,1))] px-6 py-8 shadow-[0_28px_60px_rgba(0,0,0,0.24)] sm:px-8 lg:px-12 lg:py-12">
                    <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/3 bg-[radial-gradient(circle_at_center,_rgba(37,99,235,0.15),_transparent_62%)] lg:block" />
                    <div className="relative max-w-3xl">
                        <Badge variant="gold" className="mb-5">
                            Sala de legado
                        </Badge>
                        <h1 className="font-display text-4xl font-bold tracking-tight text-cream-100 sm:text-5xl lg:text-6xl">
                            Títulos
                        </h1>
                        <p className="mt-4 text-lg leading-8 text-cream-300">
                            O Resenha RFC está construindo sua galeria com base em história real, temporada por temporada. Aqui entram os títulos oficiais do clube e também o contexto que mostra como esse legado está sendo formado.
                        </p>

                        <div className="mt-7 flex flex-wrap gap-3">
                            <Badge variant="outline" className="border-cream-100/10 bg-navy-950/40 px-3 py-1 text-cream-100">
                                Base atual: {latestSeason}
                            </Badge>
                            <Badge variant="outline" className="border-cream-100/10 bg-navy-950/40 px-3 py-1 text-cream-100">
                                {seasonSummaries.length || 1} temporada{seasonSummaries.length === 1 ? "" : "s"} no acervo
                            </Badge>
                        </div>
                    </div>
                </section>

                <section className="mt-8 grid gap-4 lg:grid-cols-4">
                    {highlightCards.map((card) => (
                        <Card key={card.label} variant="glass" className="border-cream-100/8">
                            <CardContent className="p-6">
                                <p className="text-xs uppercase tracking-[0.28em] text-cream-300/60">
                                    {card.label}
                                </p>
                                <p className="mt-4 font-display text-4xl font-black text-cream-100">
                                    {card.value}
                                </p>
                                <p className="mt-3 text-sm leading-6 text-cream-300">
                                    {card.description}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </section>

                <section className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.95fr)]">
                    <Card variant="glass" className="border-cream-100/8">
                        <CardContent className="p-6">
                            <Badge variant="accent" className="mb-4">
                                Títulos oficiais
                            </Badge>
                            <h2 className="font-display text-3xl font-bold tracking-tight text-cream-100">
                                Espaço pronto para o primeiro troféu e para todos os próximos
                            </h2>
                            <p className="mt-4 max-w-2xl text-base leading-8 text-cream-300">
                                Hoje o site ainda não possui um cadastro específico de títulos conquistados. Por isso, esta página assume uma postura honesta: ela já valoriza a trajetória do clube, mas vai destacar aqui os troféus oficiais assim que forem registrados no acervo administrativo.
                            </p>

                            <div className="mt-8 rounded-[1.75rem] border border-dashed border-cream-100/10 bg-navy-950/45 p-6">
                                <p className="text-xs uppercase tracking-[0.28em] text-cream-300/60">
                                    Status atual
                                </p>
                                <p className="mt-4 font-display text-3xl font-bold text-cream-100">
                                    Galeria oficial em preparação
                                </p>
                                <p className="mt-3 max-w-xl text-sm leading-7 text-cream-300">
                                    Assim que a equipe quiser, o próximo passo é adicionar um módulo próprio de títulos no admin para cadastrar competição, temporada, imagem do troféu, campanha e destaque da conquista.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card variant="glass" className="border-cream-100/8">
                        <CardContent className="flex h-full flex-col justify-between p-6">
                            <div>
                                <Badge variant="outline" className="mb-4 border-cream-100/10 bg-navy-950/40 text-cream-100">
                                    Visão institucional
                                </Badge>
                                <h2 className="font-display text-3xl font-bold tracking-tight text-cream-100">
                                    Antes do troféu, vem a construção
                                </h2>
                            </div>

                            <div className="mt-8 space-y-4">
                                <div className="rounded-2xl border border-cream-100/10 bg-navy-950/50 p-4">
                                    <p className="text-xs uppercase tracking-[0.26em] text-cream-300/60">Regularidade</p>
                                    <p className="mt-3 text-sm leading-7 text-cream-300">
                                        Cada temporada registrada fortalece a memória do clube e prepara o terreno para destacar campanhas marcantes.
                                    </p>
                                </div>
                                <div className="rounded-2xl border border-cream-100/10 bg-navy-950/50 p-4">
                                    <p className="text-xs uppercase tracking-[0.26em] text-cream-300/60">Memória visual</p>
                                    <p className="mt-3 text-sm leading-7 text-cream-300">
                                        A página já está pronta para receber fotos, capas, linhas do tempo e peças comemorativas sem perder o padrão premium do projeto.
                                    </p>
                                </div>
                                <div className="rounded-2xl border border-cream-100/10 bg-navy-950/50 p-4">
                                    <p className="text-xs uppercase tracking-[0.26em] text-cream-300/60">Próximo passo</p>
                                    <p className="mt-3 text-sm leading-7 text-cream-300">
                                        Cadastrar títulos no admin e liberar aqui uma galeria oficial, filtrável por competição e temporada.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                <section className="mt-12">
                    <div className="mb-6 max-w-3xl">
                        <Badge variant="outline" className="mb-4 border-cream-100/10 bg-navy-950/40 text-cream-100">
                            Temporadas registradas
                        </Badge>
                        <h2 className="font-display text-3xl font-bold tracking-tight text-cream-100 sm:text-4xl">
                            Campanhas que constroem a história
                        </h2>
                        <p className="mt-3 text-base leading-7 text-cream-300">
                            Enquanto os títulos oficiais ainda não têm um cadastro dedicado, a base já permite mostrar a evolução competitiva do clube por temporada.
                        </p>
                    </div>

                    {seasonSummaries.length > 0 ? (
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                            {seasonSummaries.map((season) => (
                                <Card key={season.season} variant="glass" className="border-cream-100/8">
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <p className="text-xs uppercase tracking-[0.28em] text-cream-300/60">
                                                    Temporada
                                                </p>
                                                <h3 className="mt-3 font-display text-3xl font-bold text-cream-100">
                                                    {season.season}
                                                </h3>
                                            </div>
                                            <Badge variant="gold">
                                                {season.matches} jogo{season.matches === 1 ? "" : "s"}
                                            </Badge>
                                        </div>

                                        <div className="mt-6 grid grid-cols-3 gap-3">
                                            <div className="rounded-xl border border-cream-100/10 bg-navy-950/45 p-3 text-center">
                                                <p className="text-xs uppercase tracking-[0.22em] text-cream-300/60">V</p>
                                                <p className="mt-2 font-display text-2xl font-bold text-cream-100">{season.wins}</p>
                                            </div>
                                            <div className="rounded-xl border border-cream-100/10 bg-navy-950/45 p-3 text-center">
                                                <p className="text-xs uppercase tracking-[0.22em] text-cream-300/60">E</p>
                                                <p className="mt-2 font-display text-2xl font-bold text-cream-100">{season.draws}</p>
                                            </div>
                                            <div className="rounded-xl border border-cream-100/10 bg-navy-950/45 p-3 text-center">
                                                <p className="text-xs uppercase tracking-[0.22em] text-cream-300/60">D</p>
                                                <p className="mt-2 font-display text-2xl font-bold text-cream-100">{season.losses}</p>
                                            </div>
                                        </div>

                                        <p className="mt-5 text-sm leading-7 text-cream-300">
                                            {season.goalsFor} gol{season.goalsFor === 1 ? "" : "s"} marcados nesta fase registrada do acervo.
                                        </p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card variant="glass" className="border-cream-100/8">
                            <CardContent className="p-8 text-center">
                                <p className="text-xs uppercase tracking-[0.28em] text-cream-300/60">
                                    Acervo em formação
                                </p>
                                <p className="mt-4 font-display text-3xl font-bold text-cream-100">
                                    Ainda não há temporadas finalizadas registradas
                                </p>
                                <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-cream-300">
                                    Assim que as partidas forem sendo concluídas e lançadas no painel, esta página passa a mostrar a evolução histórica do time sem precisar de retrabalho visual.
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </section>

                <section className="mt-12 flex flex-col gap-4 rounded-[2rem] border border-cream-100/8 bg-navy-900/65 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
                    <div className="max-w-2xl">
                        <p className="text-xs uppercase tracking-[0.28em] text-cream-300/60">
                            Próximo avanço recomendado
                        </p>
                        <h2 className="mt-3 font-display text-2xl font-bold text-cream-100">
                            Transformar esta sala em um módulo oficial de troféus
                        </h2>
                        <p className="mt-3 text-sm leading-7 text-cream-300">
                            O visual já está pronto. O passo seguinte é criar a estrutura de cadastro no admin para alimentar a galeria com títulos, capas e detalhes de campanha.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <Button asChild variant="outline" size="lg" className="border-cream-100/10 bg-navy-950/45">
                            <Link href="/estatisticas">Ver estatísticas</Link>
                        </Button>
                        <Button asChild size="lg">
                            <Link href="/jogos">Ver jogos</Link>
                        </Button>
                    </div>
                </section>
            </Container>
        </div>
    );
}
