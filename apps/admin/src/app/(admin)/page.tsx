import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Badge, Card } from "@resenha/ui";
import {
    ArrowRight,
    CalendarClock,
    CalendarDays,
    FileText,
    Goal,
    Handshake,
    ShieldCheck,
    Users
} from "lucide-react";
import { db } from "@resenha/db";
import { players, matches, posts, sponsors } from "@resenha/db/schema";
import { asc, count, desc, eq, ne } from "drizzle-orm";

export const dynamic = "force-dynamic";

const formatDate = (value?: Date | null) => {
    if (!value) {
        return "Sem data definida";
    }

    return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit"
    }).format(value);
};

const getMatchTone = (scoreHome?: number | null, scoreAway?: number | null) => {
    if (scoreHome == null || scoreAway == null) {
        return { label: "Sem placar", variant: "outline" as const };
    }

    if (scoreHome > scoreAway) {
        return { label: "Vitoria", variant: "success" as const };
    }

    if (scoreHome < scoreAway) {
        return { label: "Derrota", variant: "danger" as const };
    }

    return { label: "Empate", variant: "warning" as const };
};

export default async function AdminDashboardPage() {
    const [
        [totalPlayers],
        [activePlayers],
        [finishedMatches],
        [publishedPosts],
        [activeSponsors],
        nextMatch,
        latestResult,
        topPlayers,
        latestPlayers,
        latestPost
    ] = await Promise.all([
        db.select({ value: count() }).from(players),
        db.select({ value: count() }).from(players).where(eq(players.isActive, true)),
        db.select({ value: count() }).from(matches).where(eq(matches.status, "FINISHED")),
        db.select({ value: count() }).from(posts).where(eq(posts.isPublished, true)),
        db.select({ value: count() }).from(sponsors).where(eq(sponsors.isActive, true)),
        db.query.matches.findFirst({
            where: ne(matches.status, "FINISHED"),
            orderBy: [asc(matches.date)]
        }),
        db.query.matches.findFirst({
            where: eq(matches.status, "FINISHED"),
            orderBy: [desc(matches.date)]
        }),
        db.select({
            id: players.id,
            nickname: players.nickname,
            position: players.position,
            goals: players.goals,
            assists: players.assists,
            photoUrl: players.photoUrl
        })
            .from(players)
            .where(eq(players.isActive, true))
            .orderBy(desc(players.goals), desc(players.assists), asc(players.nickname))
            .limit(3),
        db.select({
            id: players.id,
            nickname: players.nickname,
            createdAt: players.createdAt
        })
            .from(players)
            .orderBy(desc(players.createdAt))
            .limit(3),
        db.query.posts.findFirst({
            orderBy: [desc(posts.createdAt)]
        })
    ]);

    const latestResultTone = getMatchTone(latestResult?.scoreHome, latestResult?.scoreAway);

    const activityItems = [
        nextMatch
            ? {
                id: `match-${nextMatch.id}`,
                title: `Proxima partida contra ${nextMatch.opponent}`,
                detail: `${formatDate(nextMatch.date)} • ${nextMatch.type}`,
                tone: "gold"
            }
            : null,
        latestPost
            ? {
                id: `post-${latestPost.id}`,
                title: latestPost.title,
                detail: latestPost.isPublished ? "Post publicado" : "Post em rascunho",
                tone: "blue"
            }
            : null,
        ...latestPlayers.map((player) => ({
            id: `player-${player.id}`,
            title: `${player.nickname} entrou no elenco`,
            detail: `Cadastro em ${formatDate(player.createdAt)}`,
            tone: "green"
        }))
    ].filter(Boolean) as Array<{ id: string; title: string; detail: string; tone: "gold" | "blue" | "green" }>;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="font-display text-3xl font-bold tracking-tight text-cream-100">
                    Dashboard
                </h1>
                <p className="mt-2 text-cream-300">
                    Visao geral do sistema, atalhos rapidos e leitura real dos dados do Resenha RFC.
                </p>
            </div>

            <Card className="overflow-hidden border-navy-800 bg-[linear-gradient(135deg,rgba(15,23,42,1),rgba(8,15,29,1))]">
                <div className="grid gap-0 lg:grid-cols-[1.4fr_0.9fr]">
                    <div className="border-b border-navy-800 px-6 py-6 lg:border-b-0 lg:border-r">
                        <div className="flex flex-wrap items-center gap-3">
                            <Badge variant="accent">Painel operacional</Badge>
                            <Badge variant="outline">{activePlayers.value} ativos</Badge>
                            <Badge variant="outline">{finishedMatches.value} jogos encerrados</Badge>
                            <Badge variant="outline">{activeSponsors.value} patrocinadores no ar</Badge>
                        </div>

                        <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-400">Proxima movimentacao</p>
                                    <h2 className="mt-2 font-display text-3xl text-cream-100">
                                        {nextMatch ? nextMatch.opponent : "Nenhuma partida pendente"}
                                    </h2>
                                    <p className="mt-2 max-w-xl text-sm text-cream-300">
                                        {nextMatch
                                            ? `${nextMatch.type} • ${nextMatch.season} • ${formatDate(nextMatch.date)}`
                                            : "Cadastre a proxima partida para destravar o radar do painel."}
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-3">
                                    <Link
                                        href="/partidas/novo"
                                        className="inline-flex items-center gap-2 rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-300 transition-colors hover:bg-blue-500/20"
                                    >
                                        Criar partida
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                    <Link
                                        href="/jogadores/novo"
                                        className="inline-flex items-center gap-2 rounded-xl border border-gold-500/30 bg-gold-500/10 px-4 py-2 text-sm font-semibold text-gold-300 transition-colors hover:bg-gold-500/20"
                                    >
                                        Novo jogador
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                    <Link
                                        href="/patrocinadores/novo"
                                        className="inline-flex items-center gap-2 rounded-xl border border-cream-100/15 bg-cream-100/5 px-4 py-2 text-sm font-semibold text-cream-100 transition-colors hover:bg-cream-100/10"
                                    >
                                        Novo patrocinador
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-navy-800 bg-navy-950/70 p-4">
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold-300">Jogo em foco</p>
                                        <p className="mt-2 text-lg font-semibold text-cream-100">
                                            {nextMatch ? nextMatch.location : "Sem local definido"}
                                        </p>
                                    </div>
                                    <div className="relative h-14 w-14 overflow-hidden rounded-full border border-navy-700 bg-navy-900">
                                        {nextMatch?.opponentLogo ? (
                                            <Image
                                                src={nextMatch.opponentLogo}
                                                alt={nextMatch.opponent}
                                                fill
                                                sizes="56px"
                                                className="object-contain p-2"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center font-display text-lg font-bold text-navy-500">
                                                {nextMatch?.opponent?.slice(0, 2).toUpperCase() ?? "--"}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                    <div className="rounded-xl border border-navy-800 bg-navy-900/80 p-3">
                                        <p className="text-[11px] uppercase tracking-[0.22em] text-cream-300">Data</p>
                                        <p className="mt-2 font-semibold text-cream-100">{nextMatch ? formatDate(nextMatch.date) : "A definir"}</p>
                                    </div>
                                    <div className="rounded-xl border border-navy-800 bg-navy-900/80 p-3">
                                        <p className="text-[11px] uppercase tracking-[0.22em] text-cream-300">Status salvo</p>
                                        <p className="mt-2 font-semibold text-cream-100">{nextMatch?.status ?? "SCHEDULED"}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="px-6 py-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-400">Artilharia</p>
                                <h3 className="mt-2 font-display text-2xl text-cream-100">Destaques do elenco</h3>
                            </div>
                            <Goal className="h-5 w-5 text-gold-300" />
                        </div>

                        <div className="mt-5 space-y-3">
                            {topPlayers.length > 0 ? (
                                topPlayers.map((player, index) => (
                                    <div key={player.id} className="flex items-center justify-between rounded-2xl border border-navy-800 bg-navy-950/70 px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-navy-700 bg-navy-900 text-xs font-bold text-cream-100">
                                                {player.photoUrl ? (
                                                    <Image
                                                        src={player.photoUrl}
                                                        alt={player.nickname}
                                                        width={40}
                                                        height={40}
                                                        unoptimized={player.photoUrl.startsWith("/uploads/")}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    player.nickname.slice(0, 2).toUpperCase()
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-cream-100">{player.nickname}</p>
                                                <p className="text-xs uppercase tracking-[0.2em] text-cream-300">{player.position}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-display text-xl text-gold-300">{player.goals}</p>
                                            <p className="text-xs text-cream-300">{player.assists} assist.</p>
                                        </div>
                                        <div className="ml-3 flex h-7 w-7 items-center justify-center rounded-full border border-blue-500/20 bg-blue-500/10 text-xs font-bold text-blue-300">
                                            {index + 1}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="rounded-2xl border border-dashed border-navy-800 bg-navy-950/60 px-4 py-6 text-center text-sm text-cream-300">
                                    Ainda nao ha destaques para mostrar.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
                {[
                    {
                        label: "Jogadores cadastrados",
                        value: totalPlayers.value,
                        detail: `${activePlayers.value} ativos no elenco`,
                        icon: Users
                    },
                    {
                        label: "Jogos finalizados",
                        value: finishedMatches.value,
                        detail: "Placar validado e pronto para historico",
                        icon: CalendarDays
                    },
                    {
                        label: "Posts publicados",
                        value: publishedPosts.value,
                        detail: latestPost ? `Ultimo: ${latestPost.title}` : "Nenhuma noticia ainda",
                        icon: FileText
                    },
                    {
                        label: "Patrocinadores ativos",
                        value: activeSponsors.value,
                        detail: "Parcerias exibidas no site e prontas para destacar a marca",
                        icon: Handshake
                    },
                    {
                        label: "Proxima partida",
                        value: nextMatch ? nextMatch.opponent : "--",
                        detail: nextMatch ? formatDate(nextMatch.date) : "Cadastre uma nova partida",
                        icon: CalendarClock
                    }
                ].map((item) => {
                    const Icon = item.icon;

                    return (
                        <Card key={item.label} className="border-navy-800 bg-navy-900/90 p-5">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-sm text-cream-300">{item.label}</p>
                                    <p className="mt-3 font-display text-3xl text-cream-100">{item.value}</p>
                                </div>
                                <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-3 text-blue-300">
                                    <Icon className="h-5 w-5" />
                                </div>
                            </div>
                            <p className="mt-4 text-sm text-cream-300">{item.detail}</p>
                        </Card>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                <Card className="border-navy-800 bg-navy-900 p-6">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-400">Ultimo resultado</p>
                            <h3 className="mt-2 font-display text-2xl text-cream-100">
                                {latestResult ? latestResult.opponent : "Sem historico ainda"}
                            </h3>
                        </div>
                        <Badge variant={latestResultTone.variant}>{latestResultTone.label}</Badge>
                    </div>

                    {latestResult ? (
                        <>
                            <div className="mt-8 flex items-center justify-center gap-6 rounded-2xl border border-navy-800 bg-navy-950/70 px-6 py-8">
                                <div className="text-center">
                                    <p className="font-display text-5xl text-cream-100">{latestResult.scoreHome ?? 0}</p>
                                    <p className="mt-2 text-xs uppercase tracking-[0.24em] text-cream-300">Resenha</p>
                                </div>
                                <span className="font-display text-3xl text-navy-500">X</span>
                                <div className="text-center">
                                    <p className="font-display text-5xl text-cream-100">{latestResult.scoreAway ?? 0}</p>
                                    <p className="mt-2 text-xs uppercase tracking-[0.24em] text-cream-300">{latestResult.opponent}</p>
                                </div>
                            </div>
                            <p className="mt-4 text-sm text-cream-300">Disputado em {formatDate(latestResult.date)}</p>
                        </>
                    ) : (
                        <div className="mt-6 rounded-2xl border border-dashed border-navy-800 bg-navy-950/60 px-4 py-8 text-center text-sm text-cream-300">
                            O historico vai aparecer assim que o primeiro jogo for encerrado com placar.
                        </div>
                    )}
                </Card>

                <Card className="border-navy-800 bg-navy-900 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-400">Atividade recente</p>
                            <h3 className="mt-2 font-display text-2xl text-cream-100">Radar rapido</h3>
                        </div>
                        <ShieldCheck className="h-5 w-5 text-gold-300" />
                    </div>

                    <div className="mt-6 space-y-3">
                        {activityItems.length > 0 ? (
                            activityItems.map((item) => (
                                <div key={item.id} className="rounded-2xl border border-navy-800 bg-navy-950/70 px-4 py-4">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <p className="font-semibold text-cream-100">{item.title}</p>
                                            <p className="mt-1 text-sm text-cream-300">{item.detail}</p>
                                        </div>
                                        <span
                                            className={`mt-1 h-2.5 w-2.5 rounded-full ${
                                                item.tone === "gold" ? "bg-gold-400" : item.tone === "green" ? "bg-green-400" : "bg-blue-400"
                                            }`}
                                        />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="rounded-2xl border border-dashed border-navy-800 bg-navy-950/60 px-4 py-8 text-center text-sm text-cream-300">
                                Nenhuma atividade recente encontrada.
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
}
