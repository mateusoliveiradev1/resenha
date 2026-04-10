"use client";

import * as React from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    UpdateMatchSchema,
    type UpdateMatchInput,
} from "@resenha/validators";
import { Button, Card, CardContent, FormField, Tabs } from "@resenha/ui";
import { ArrowLeft, Building2, Save, Trophy } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { updateMatch, upsertMatchAppearances, upsertMatchStats } from "@/actions/matches";
import { formatDateTimeLocalValue, parseDateTimeLocalToIso } from "@/lib/dateTimeLocal";

type MatchData = {
    id: string;
    date: Date;
    opponent: string;
    matchCategory: "CHAMPIONSHIP" | "FRIENDLY";
    homeClubId?: string | null;
    awayClubId?: string | null;
    homeLabel?: string | null;
    awayLabel?: string | null;
    championshipId?: string | null;
    championshipGroupId?: string | null;
    phaseLabel?: string | null;
    roundLabel?: string | null;
    matchday?: number | null;
    location: string;
    status: "SCHEDULED" | "LIVE" | "FINISHED";
    scoreHome?: number | null;
    scoreAway?: number | null;
    tiebreakHome?: number | null;
    tiebreakAway?: number | null;
    type: "FUTSAL" | "CAMPO";
    autoStatus: boolean;
    durationMinutes?: number | null;
    summary?: string | null;
    season?: string | null;
};

type MatchStatsData = {
    playerId: string;
    goals: number;
    assists: number;
    yellowCards: number;
    redCards: number;
    minutesPlayed?: number | null;
};

type MatchAppearanceData = {
    playerId: string;
    minutesPlayed?: number | null;
};

type PlayerOption = {
    id: string;
    name: string;
    nickname: string;
    shirtNumber: number;
};

type ClubOption = {
    id: string;
    name: string;
    shortName?: string | null;
    isResenha: boolean;
};

type ChampionshipOption = {
    id: string;
    name: string;
    seasonLabel?: string | null;
    status: "PLANNED" | "LIVE" | "FINISHED";
    format: "LEAGUE" | "GROUP_STAGE" | "KNOCKOUT" | "HYBRID";
};

type ChampionshipGroupOption = {
    id: string;
    championshipId: string;
    name: string;
};

type AppearanceRowFormValue = {
    playerId: string;
    appeared: boolean;
    minutesPlayed: number | null;
};

type AppearanceFormValues = {
    rows: AppearanceRowFormValue[];
};

type StatsFormValues = {
    stats: Array<{
        playerId: string;
        goals: number;
        assists: number;
        yellowCards: number;
        redCards: number;
    }>;
};

const parseOptionalNumber = (value: unknown) => {
    if (value === "" || value == null) {
        return null;
    }

    const parsedValue = Number(value);
    return Number.isNaN(parsedValue) ? null : parsedValue;
};

export function EditarPartidaForm({
    match,
    stats,
    appearances,
    players,
    canEditPlayerStats,
    clubs,
    championships,
    groups,
}: {
    match: MatchData;
    stats: MatchStatsData[];
    appearances: MatchAppearanceData[];
    players: PlayerOption[];
    canEditPlayerStats: boolean;
    clubs: ClubOption[];
    championships: ChampionshipOption[];
    groups: ChampionshipGroupOption[];
}) {
    const router = useRouter();
    const [activeTab, setActiveTab] = React.useState("GERAL");
    const [isSavingGeneral, setIsSavingGeneral] = React.useState(false);
    const [isSavingAppearances, setIsSavingAppearances] = React.useState(false);
    const [isSavingStats, setIsSavingStats] = React.useState(false);
    const [generalFeedback, setGeneralFeedback] = React.useState<string | null>(null);
    const [appearancesFeedback, setAppearancesFeedback] = React.useState<string | null>(null);
    const [statsFeedback, setStatsFeedback] = React.useState<string | null>(null);
    const appearanceMap = React.useMemo(
        () => new Map(appearances.map((item) => [item.playerId, item])),
        [appearances],
    );
    const statsMap = React.useMemo(
        () => new Map(stats.map((item) => [item.playerId, item])),
        [stats],
    );

    const {
        register: registerMatch,
        handleSubmit: submitMatch,
        watch,
        setValue,
        formState: { errors: matchErrs },
    } = useForm<UpdateMatchInput>({
        resolver: zodResolver(UpdateMatchSchema) as Resolver<UpdateMatchInput>,
        defaultValues: {
            date: formatDateTimeLocalValue(match.date),
            opponent: match.opponent || "",
            matchCategory: match.matchCategory || "FRIENDLY",
            homeClubId: match.homeClubId ?? null,
            awayClubId: match.awayClubId ?? null,
            homeLabel: match.homeLabel ?? "",
            awayLabel: match.awayLabel ?? "",
            championshipId: match.championshipId ?? null,
            championshipGroupId: match.championshipGroupId ?? null,
            phaseLabel: match.phaseLabel ?? "",
            roundLabel: match.roundLabel ?? "",
            matchday: match.matchday ?? null,
            location: match.location || "",
            status: match.status || "SCHEDULED",
            scoreHome: match.scoreHome ?? undefined,
            scoreAway: match.scoreAway ?? undefined,
            tiebreakHome: match.tiebreakHome ?? undefined,
            tiebreakAway: match.tiebreakAway ?? undefined,
            type: match.type || "FUTSAL",
            autoStatus: match.autoStatus ?? true,
            durationMinutes: match.durationMinutes ?? undefined,
            summary: match.summary || "",
            season: match.season || "",
        }
    });

    const {
        register: registerAppearances,
        handleSubmit: submitAppearances,
        watch: watchAppearances,
        getValues: getAppearanceValues,
        setValue: setAppearanceValue,
    } = useForm<AppearanceFormValues>({
        defaultValues: {
            rows: players.map((player) => {
                const appearance = appearanceMap.get(player.id);
                const stat = statsMap.get(player.id);

                return {
                    playerId: player.id,
                    appeared: Boolean(appearance || stat),
                    minutesPlayed: appearance?.minutesPlayed ?? stat?.minutesPlayed ?? null,
                };
            }),
        },
    });

    const { register: registerStats, handleSubmit: submitStats } = useForm<StatsFormValues>({
        defaultValues: {
            stats: players.map((player) => {
                const currentStats = statsMap.get(player.id);

                return {
                    playerId: player.id,
                    goals: currentStats?.goals ?? 0,
                    assists: currentStats?.assists ?? 0,
                    yellowCards: currentStats?.yellowCards ?? 0,
                    redCards: currentStats?.redCards ?? 0,
                };
            }),
        },
    });

    const matchCategory = watch("matchCategory");
    const autoStatus = watch("autoStatus");
    const selectedChampionshipId = watch("championshipId");
    const appearanceRows = watchAppearances("rows");
    const selectedPlayerIds = React.useMemo(
        () => new Set((appearanceRows ?? []).filter((row) => row.appeared).map((row) => row.playerId)),
        [appearanceRows],
    );
    const selectedAppearanceCount = selectedPlayerIds.size;
    const availableGroups = React.useMemo(
        () => groups.filter((group) => group.championshipId === selectedChampionshipId),
        [groups, selectedChampionshipId]
    );

    const setAllAppearanceRows = (appeared: boolean) => {
        getAppearanceValues("rows").forEach((_, index) => {
            setAppearanceValue(`rows.${index}.appeared`, appeared, {
                shouldDirty: true,
                shouldTouch: true,
            });

            if (!appeared) {
                setAppearanceValue(`rows.${index}.minutesPlayed`, null, {
                    shouldDirty: true,
                    shouldTouch: true,
                });
            }
        });
    };

    React.useEffect(() => {
        if (matchCategory === "FRIENDLY") {
            setValue("championshipId", null);
            setValue("championshipGroupId", null);
            setValue("phaseLabel", "");
            setValue("roundLabel", "");
            setValue("matchday", null);
        }
    }, [matchCategory, setValue]);

    React.useEffect(() => {
        if (matchCategory !== "CHAMPIONSHIP") {
            return;
        }

        if (availableGroups.length === 0) {
            setValue("championshipGroupId", null);
        }
    }, [availableGroups.length, matchCategory, setValue]);

    const onMatchSubmit = async (data: UpdateMatchInput) => {
        setIsSavingGeneral(true);
        setGeneralFeedback(null);

        const result = await updateMatch(match.id, {
            ...data,
            date: data.date ? (parseDateTimeLocalToIso(data.date) ?? data.date) : undefined,
        });

        setIsSavingGeneral(false);

        if (result.success) {
            router.push("/partidas");
            router.refresh();
            return;
        }

        setGeneralFeedback(result.error ?? "Nao foi possivel atualizar a partida.");
    };

    const onAppearancesSubmit = async (data: AppearanceFormValues) => {
        setIsSavingAppearances(true);
        setAppearancesFeedback(null);

        const result = await upsertMatchAppearances({
            matchId: match.id,
            appearances: data.rows
                .filter((item) => item.appeared)
                .map((item) => ({
                    playerId: item.playerId,
                    minutesPlayed: item.minutesPlayed ?? null,
                })),
        });

        setIsSavingAppearances(false);

        if (result.success) {
            setAppearancesFeedback("Participacao salva com sucesso.");
            router.refresh();
            return;
        }

        setAppearancesFeedback(result.error ?? "Nao foi possivel salvar a participacao da partida.");
    };

    const onStatsSubmit = async (data: StatsFormValues) => {
        setIsSavingStats(true);
        setStatsFeedback(null);
        const selectedIds = new Set(
            getAppearanceValues("rows")
                .filter((row) => row.appeared)
                .map((row) => row.playerId),
        );

        const result = await upsertMatchStats({
            matchId: match.id,
            stats: data.stats
                .filter((item) => selectedIds.has(item.playerId))
                .filter((item) => item.goals > 0 || item.assists > 0 || item.yellowCards > 0 || item.redCards > 0)
                .map((item) => ({
                    playerId: item.playerId,
                    goals: item.goals,
                    assists: item.assists,
                    yellowCards: item.yellowCards,
                    redCards: item.redCards,
                    minutesPlayed: null,
                })),
        });

        setIsSavingStats(false);

        if (result.success) {
            setStatsFeedback("Estatisticas salvas com sucesso.");
            router.refresh();
            return;
        }

        setStatsFeedback(result.error ?? "Nao foi possivel salvar as estatisticas.");
    };

    return (
        <div className="mx-auto max-w-5xl space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/partidas" className="rounded-full p-2 text-cream-300 transition-colors hover:bg-navy-800 hover:text-cream-100">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                    <h1 className="font-display text-2xl font-bold tracking-tight text-cream-100">Editar Partida</h1>
                    <p className="mt-1 text-sm text-cream-300">
                        Atualize confronto, campeonato, status e estatisticas sem quebrar os automatismos do site.
                    </p>
                </div>
            </div>

            <Tabs
                tabs={
                    canEditPlayerStats
                        ? [
                            { id: "GERAL", label: "Dados Gerais" },
                            { id: "APPEARANCES", label: "Participacao" },
                            { id: "STATS", label: "Eventos" }
                        ]
                        : [{ id: "GERAL", label: "Dados Gerais" }]
                }
                activeId={activeTab}
                onChange={setActiveTab}
                variant="underline"
            />

            <div className="mt-6">
                {activeTab === "GERAL" && (
                    <form onSubmit={submitMatch(onMatchSubmit)}>
                        <Card className="border-navy-800 bg-navy-900">
                            <CardContent className="space-y-8 p-6">
                                <div className="space-y-4">
                                    <div className="flex flex-col gap-3 border-b border-navy-800 pb-3 sm:flex-row sm:items-center sm:justify-between">
                                        <div>
                                            <h3 className="text-sm font-semibold uppercase tracking-wider text-blue-400">
                                                Estrutura da partida
                                            </h3>
                                            <p className="mt-1 text-xs text-cream-300">
                                                Ajuste o contexto competitivo e mantenha a home, agenda e campeonatos sincronizados.
                                            </p>
                                        </div>

                                        <div className="flex flex-wrap gap-2 text-xs">
                                            <Link
                                                href="/clubs/novo"
                                                className="inline-flex items-center gap-2 rounded-full border border-navy-700 px-3 py-1.5 text-cream-300 transition-colors hover:border-blue-500/40 hover:text-cream-100"
                                            >
                                                <Building2 className="h-3.5 w-3.5" />
                                                Novo clube
                                            </Link>
                                            <Link
                                                href="/campeonatos/novo"
                                                className="inline-flex items-center gap-2 rounded-full border border-navy-700 px-3 py-1.5 text-cream-300 transition-colors hover:border-blue-500/40 hover:text-cream-100"
                                            >
                                                <Trophy className="h-3.5 w-3.5" />
                                                Novo campeonato
                                            </Link>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <label htmlFor="matchCategory" className="text-sm font-medium leading-none text-cream-100">
                                                Tipo de cadastro
                                            </label>
                                            <select
                                                id="matchCategory"
                                                {...registerMatch("matchCategory")}
                                                className="flex h-10 w-full rounded-md border border-navy-800 bg-navy-900 px-3 py-2 text-sm text-cream-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                                            >
                                                <option value="FRIENDLY">Jogo avulso / amistoso</option>
                                                <option value="CHAMPIONSHIP">Partida de campeonato</option>
                                            </select>
                                        </div>

                                        <div className="space-y-2">
                                            <label htmlFor="type" className="text-sm font-medium leading-none text-cream-100">
                                                Modalidade
                                            </label>
                                            <select
                                                id="type"
                                                {...registerMatch("type")}
                                                className="flex h-10 w-full rounded-md border border-navy-800 bg-navy-900 px-3 py-2 text-sm text-cream-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                                            >
                                                <option value="FUTSAL">Quadra / futsal</option>
                                                <option value="CAMPO">Campo</option>
                                            </select>
                                        </div>

                                        {matchCategory === "CHAMPIONSHIP" ? (
                                            <div className="space-y-2 sm:col-span-2">
                                                <label htmlFor="championshipId" className="text-sm font-medium leading-none text-cream-100">
                                                    Campeonato
                                                </label>
                                                <select
                                                    id="championshipId"
                                                    {...registerMatch("championshipId")}
                                                    className="flex h-10 w-full rounded-md border border-navy-800 bg-navy-900 px-3 py-2 text-sm text-cream-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                                                >
                                                    <option value="">Selecione um campeonato</option>
                                                    {championships.map((championship) => (
                                                        <option key={championship.id} value={championship.id}>
                                                            {championship.name}
                                                            {championship.seasonLabel ? ` • ${championship.seasonLabel}` : ""}
                                                        </option>
                                                    ))}
                                                </select>
                                                {matchErrs.championshipId?.message && (
                                                    <p className="text-[0.8rem] font-medium text-red-500">
                                                        {matchErrs.championshipId.message}
                                                    </p>
                                                )}
                                            </div>
                                        ) : (
                                            <FormField
                                                id="season"
                                                label="Contexto / serie da partida"
                                                {...registerMatch("season")}
                                                error={!!matchErrs.season}
                                                errorMessage={matchErrs.season?.message}
                                            />
                                        )}

                                        <FormField
                                            id="date"
                                            label="Data e hora"
                                            type="datetime-local"
                                            {...registerMatch("date")}
                                            error={!!matchErrs.date}
                                            errorMessage={matchErrs.date?.message}
                                        />

                                        <FormField
                                            id="location"
                                            label="Local"
                                            {...registerMatch("location")}
                                            error={!!matchErrs.location}
                                            errorMessage={matchErrs.location?.message}
                                        />

                                        {matchCategory === "CHAMPIONSHIP" && availableGroups.length > 0 && (
                                            <div className="space-y-2 sm:col-span-2">
                                                <label htmlFor="championshipGroupId" className="text-sm font-medium leading-none text-cream-100">
                                                    Grupo
                                                </label>
                                                <select
                                                    id="championshipGroupId"
                                                    {...registerMatch("championshipGroupId")}
                                                    className="flex h-10 w-full rounded-md border border-navy-800 bg-navy-900 px-3 py-2 text-sm text-cream-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                                                >
                                                    <option value="">Selecione o grupo</option>
                                                    {availableGroups.map((group) => (
                                                        <option key={group.id} value={group.id}>
                                                            {group.name}
                                                        </option>
                                                    ))}
                                                </select>
                                                {matchErrs.championshipGroupId?.message && (
                                                    <p className="text-[0.8rem] font-medium text-red-500">
                                                        {matchErrs.championshipGroupId.message}
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                        {matchCategory === "CHAMPIONSHIP" && (
                                            <>
                                                <FormField
                                                    id="phaseLabel"
                                                    label="Fase"
                                                    {...registerMatch("phaseLabel")}
                                                    error={!!matchErrs.phaseLabel}
                                                    errorMessage={matchErrs.phaseLabel?.message}
                                                />
                                                <FormField
                                                    id="roundLabel"
                                                    label="Rodada"
                                                    {...registerMatch("roundLabel")}
                                                    error={!!matchErrs.roundLabel}
                                                    errorMessage={matchErrs.roundLabel?.message}
                                                />
                                                <FormField
                                                    id="matchday"
                                                    label="Numero da rodada"
                                                    type="number"
                                                    {...registerMatch("matchday", { valueAsNumber: true })}
                                                    error={!!matchErrs.matchday}
                                                    errorMessage={matchErrs.matchday?.message}
                                                />
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="border-b border-navy-800 pb-3">
                                        <h3 className="text-sm font-semibold uppercase tracking-wider text-blue-400">
                                            Confronto
                                        </h3>
                                        <p className="mt-1 text-xs text-cream-300">
                                            O escudo exibido no site vem do cadastro do clube e nao precisa mais ser enviado no jogo.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <label htmlFor="homeClubId" className="text-sm font-medium leading-none text-cream-100">
                                                Mandante
                                            </label>
                                            <select
                                                id="homeClubId"
                                                {...registerMatch("homeClubId")}
                                                className="flex h-10 w-full rounded-md border border-navy-800 bg-navy-900 px-3 py-2 text-sm text-cream-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                                            >
                                                <option value="">Selecione o mandante</option>
                                                {clubs.map((club) => (
                                                    <option key={club.id} value={club.id}>
                                                        {club.name}{club.isResenha ? " • Resenha" : ""}
                                                    </option>
                                                    ))}
                                                </select>
                                                <p className="text-xs text-cream-300">
                                                    Para chaveamento automatico, deixe o clube vazio e use rotulos como 2o colocado ou VENC JOGO 37.
                                                </p>
                                            </div>

                                            <div className="space-y-2">
                                            <label htmlFor="awayClubId" className="text-sm font-medium leading-none text-cream-100">
                                                Visitante
                                            </label>
                                            <select
                                                id="awayClubId"
                                                {...registerMatch("awayClubId")}
                                                className="flex h-10 w-full rounded-md border border-navy-800 bg-navy-900 px-3 py-2 text-sm text-cream-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                                            >
                                                <option value="">Selecione o visitante</option>
                                                {clubs.map((club) => (
                                                    <option key={club.id} value={club.id}>
                                                        {club.name}{club.isResenha ? " • Resenha" : ""}
                                                    </option>
                                                    ))}
                                                </select>
                                                <p className="text-xs text-cream-300">
                                                    Isso evita clube fake e deixa a semifinal/final trocar sozinha para o time real.
                                                </p>
                                            </div>

                                            <FormField
                                                id="homeLabel"
                                                label="Rotulo oficial do mandante"
                                                {...registerMatch("homeLabel")}
                                                error={!!matchErrs.homeLabel}
                                                errorMessage={matchErrs.homeLabel?.message}
                                            />

                                            <FormField
                                                id="awayLabel"
                                                label="Rotulo oficial do visitante"
                                                {...registerMatch("awayLabel")}
                                                error={!!matchErrs.awayLabel}
                                                errorMessage={matchErrs.awayLabel?.message}
                                            />
                                        </div>

                                    {(matchErrs.homeClubId?.message || matchErrs.awayClubId?.message || matchErrs.homeLabel?.message || matchErrs.awayLabel?.message || matchErrs.opponent?.message) && (
                                        <p className="text-[0.8rem] font-medium text-red-500">
                                            {matchErrs.homeClubId?.message || matchErrs.awayClubId?.message || matchErrs.homeLabel?.message || matchErrs.awayLabel?.message || matchErrs.opponent?.message}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    <div className="border-b border-navy-800 pb-3">
                                        <h3 className="text-sm font-semibold uppercase tracking-wider text-blue-400">
                                            Controle e placar
                                        </h3>
                                        <p className="mt-1 text-xs text-cream-300">
                                            O status automatico ajuda a home a destacar jogos em LIVE sem ajuste manual.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-6">
                                        <div className="space-y-2">
                                            <label htmlFor="status" className="text-sm font-medium leading-none text-cream-100">
                                                Status
                                            </label>
                                            <select
                                                id="status"
                                                {...registerMatch("status")}
                                                className="flex h-10 w-full rounded-md border border-navy-800 bg-navy-900 px-3 py-2 text-sm text-cream-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                                            >
                                                <option value="SCHEDULED">Agendada</option>
                                                <option value="LIVE">Ao vivo</option>
                                                <option value="FINISHED">Finalizada</option>
                                            </select>
                                        </div>

                                        <FormField
                                            id="durationMinutes"
                                            label="Janela LIVE (min)"
                                            type="number"
                                            {...registerMatch("durationMinutes", { valueAsNumber: true })}
                                            error={!!matchErrs.durationMinutes}
                                            errorMessage={matchErrs.durationMinutes?.message}
                                        />

                                        <FormField
                                            id="scoreHome"
                                            label="Gols do mandante"
                                            type="number"
                                            {...registerMatch("scoreHome", { valueAsNumber: true })}
                                            error={!!matchErrs.scoreHome}
                                            errorMessage={matchErrs.scoreHome?.message}
                                        />
                                        <FormField
                                            id="scoreAway"
                                            label="Gols do visitante"
                                            type="number"
                                            {...registerMatch("scoreAway", { valueAsNumber: true })}
                                            error={!!matchErrs.scoreAway}
                                            errorMessage={matchErrs.scoreAway?.message}
                                        />
                                        <FormField
                                            id="tiebreakHome"
                                            label="Desempate mandante"
                                            type="number"
                                            {...registerMatch("tiebreakHome", { valueAsNumber: true })}
                                            error={!!matchErrs.tiebreakHome}
                                            errorMessage={matchErrs.tiebreakHome?.message}
                                        />
                                        <FormField
                                            id="tiebreakAway"
                                            label="Desempate visitante"
                                            type="number"
                                            {...registerMatch("tiebreakAway", { valueAsNumber: true })}
                                            error={!!matchErrs.tiebreakAway}
                                            errorMessage={matchErrs.tiebreakAway?.message}
                                        />
                                    </div>

                                    <p className="text-xs text-cream-300">
                                        Use o desempate somente quando o tempo normal terminou empatado.
                                        Assim o chaveamento mata-mata continua automatico mesmo em semifinais decididas nos penaltis.
                                    </p>

                                    <label className="flex items-start gap-3 rounded-2xl border border-navy-800 bg-navy-950/50 px-4 py-4 text-sm text-cream-100">
                                        <input
                                            type="checkbox"
                                            {...registerMatch("autoStatus")}
                                            className="mt-1 h-4 w-4 rounded border-navy-700 bg-navy-900 text-blue-500 focus:ring-blue-500"
                                        />
                                        <span>
                                            <strong className="block font-semibold text-cream-100">Ativar automacao de status</strong>
                                            <span className="mt-1 block text-xs text-cream-300">
                                                {autoStatus
                                                    ? "A partida pode aparecer sozinha como LIVE na home e na pagina de jogos."
                                                    : "Com a automacao desligada, voce controla o status manualmente."}
                                            </span>
                                        </span>
                                    </label>

                                    {!canEditPlayerStats && (
                                        <div className="rounded-2xl border border-gold-500/20 bg-gold-500/10 px-4 py-4 text-sm text-gold-100">
                                            Estatisticas de jogadores ficam disponiveis apenas para partidas do Resenha.
                                            Jogos gerais entre outros clubes usam somente placar, status e contexto do campeonato.
                                        </div>
                                    )}
                                </div>

                                <div className="sm:col-span-2">
                                    <label htmlFor="summary" className="mb-2 block text-sm font-medium leading-none text-cream-100">
                                        Resumo do jogo
                                    </label>
                                    <textarea
                                        id="summary"
                                        {...registerMatch("summary")}
                                        rows={4}
                                        className="w-full rounded-md border border-navy-800 bg-navy-900 p-3 text-sm text-cream-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                                        placeholder="Breve relato sobre a partida..."
                                    />
                                </div>

                                {generalFeedback && (
                                    <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                                        {generalFeedback}
                                    </div>
                                )}

                                <div className="flex items-center justify-end gap-4 border-t border-navy-800 pt-4">
                                    <Button type="submit" variant="primary" disabled={isSavingGeneral}>
                                        <Save className="mr-2 h-4 w-4" />
                                        {isSavingGeneral ? "Salvando..." : "Salvar Partida"}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </form>
                )}

                {canEditPlayerStats && activeTab === "APPEARANCES" && (
                    <form onSubmit={submitAppearances(onAppearancesSubmit)}>
                        <Card className="border-navy-800 bg-navy-900">
                            <CardContent className="space-y-6 p-6">
                                <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 px-4 py-4 text-sm text-blue-100">
                                    Primeiro marque quem realmente jogou. A contagem de <strong>Jogos</strong> no elenco passa a sair desta lista, mesmo quando o atleta nao fez gol nem assistencia.
                                </div>

                                <div className="flex flex-col gap-3 rounded-2xl border border-navy-800 bg-navy-950/50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-sm font-semibold text-cream-100">
                                            {selectedAppearanceCount} de {players.length} jogadores marcados
                                        </p>
                                        <p className="mt-1 text-xs text-cream-300">
                                            Use as acoes rapidas para acelerar o ajuste dos jogos antigos.
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setAllAppearanceRows(true)}
                                        >
                                            Marcar todos
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setAllAppearanceRows(false)}
                                        >
                                            Limpar
                                        </Button>
                                    </div>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                                    {players.map((player, index) => {
                                        const appeared = appearanceRows?.[index]?.appeared ?? false;

                                        return (
                                            <label
                                                key={player.id}
                                                className={`rounded-2xl border px-4 py-4 transition-colors ${
                                                    appeared
                                                        ? "border-blue-500/30 bg-blue-500/10"
                                                        : "border-navy-800 bg-navy-950/50"
                                                }`}
                                            >
                                                <input
                                                    type="hidden"
                                                    {...registerAppearances(`rows.${index}.playerId`)}
                                                    value={player.id}
                                                />
                                                <div className="flex items-start gap-3">
                                                    <input
                                                        type="checkbox"
                                                        {...registerAppearances(`rows.${index}.appeared`)}
                                                        className="mt-1 h-4 w-4 rounded border-navy-700 bg-navy-900 text-blue-500 focus:ring-blue-500"
                                                    />
                                                    <div className="min-w-0 flex-1">
                                                        <p className="font-semibold text-cream-100">
                                                            #{player.shirtNumber} - {player.nickname}
                                                        </p>
                                                        <p className="mt-1 text-xs text-cream-300">{player.name}</p>
                                                        <div className="mt-3">
                                                            <label className="mb-1 block text-[11px] font-medium uppercase tracking-[0.18em] text-cream-300/70">
                                                                Minutos
                                                            </label>
                                                            <input
                                                                type="number"
                                                                disabled={!appeared}
                                                                {...registerAppearances(`rows.${index}.minutesPlayed`, {
                                                                    setValueAs: parseOptionalNumber,
                                                                })}
                                                                className="flex h-9 w-full rounded-md border border-navy-800 bg-navy-900 px-3 text-sm text-cream-100 disabled:cursor-not-allowed disabled:opacity-50"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </label>
                                        );
                                    })}
                                </div>

                                {appearancesFeedback && (
                                    <div
                                        className={`rounded-xl px-4 py-3 text-sm ${
                                            appearancesFeedback.includes("sucesso")
                                                ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                                                : "border border-red-500/30 bg-red-500/10 text-red-200"
                                        }`}
                                    >
                                        {appearancesFeedback}
                                    </div>
                                )}

                                <div className="flex items-center justify-end gap-4 border-t border-navy-800 pt-4">
                                    <Button type="submit" variant="primary" disabled={isSavingAppearances}>
                                        <Save className="mr-2 h-4 w-4" />
                                        {isSavingAppearances ? "Salvando..." : "Salvar Participacao"}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </form>
                )}

                {canEditPlayerStats && activeTab === "STATS" && (
                    <form onSubmit={submitStats(onStatsSubmit)}>
                        <Card className="border-navy-800 bg-navy-900">
                            <CardContent className="space-y-6 p-6">
                                <div className="rounded-2xl border border-navy-800 bg-navy-950/50 px-4 py-4 text-sm text-cream-200">
                                    Esta aba mostra apenas os atletas marcados em <strong>Participacao</strong>. Deixe tudo zerado para quem jogou mas nao teve evento.
                                </div>

                                <div className="space-y-4">
                                    {players.map((player, index) => {
                                        if (!selectedPlayerIds.has(player.id)) {
                                            return null;
                                        }

                                        return (
                                            <div key={player.id} className="flex flex-wrap items-end gap-4 rounded-xl border border-navy-800 bg-navy-950/50 p-4">
                                                <input
                                                    type="hidden"
                                                    {...registerStats(`stats.${index}.playerId`)}
                                                    value={player.id}
                                                />
                                                <div className="min-w-[220px] flex-1">
                                                    <label className="mb-1 block text-xs font-medium text-cream-300">Jogador</label>
                                                    <div className="flex h-9 items-center rounded-md border border-navy-800 bg-navy-900 px-3 text-sm text-cream-100">
                                                        #{player.shirtNumber} - {player.nickname} ({player.name})
                                                    </div>
                                                </div>
                                                <div className="w-20">
                                                    <label className="mb-1 block text-xs font-medium text-cream-300">Gols</label>
                                                    <input
                                                        type="number"
                                                        {...registerStats(`stats.${index}.goals`, { valueAsNumber: true })}
                                                        className="flex h-9 w-full rounded-md border border-navy-800 bg-navy-900 px-3 text-sm text-cream-100"
                                                    />
                                                </div>
                                                <div className="w-20">
                                                    <label className="mb-1 block text-xs font-medium text-cream-300">Assist.</label>
                                                    <input
                                                        type="number"
                                                        {...registerStats(`stats.${index}.assists`, { valueAsNumber: true })}
                                                        className="flex h-9 w-full rounded-md border border-navy-800 bg-navy-900 px-3 text-sm text-cream-100"
                                                    />
                                                </div>
                                                <div className="w-20">
                                                    <label className="mb-1 block text-xs font-medium text-cream-300">CA</label>
                                                    <input
                                                        type="number"
                                                        {...registerStats(`stats.${index}.yellowCards`, { valueAsNumber: true })}
                                                        className="flex h-9 w-full rounded-md border border-navy-800 bg-navy-900 px-3 text-sm text-yellow-500"
                                                    />
                                                </div>
                                                <div className="w-20">
                                                    <label className="mb-1 block text-xs font-medium text-cream-300">CV</label>
                                                    <input
                                                        type="number"
                                                        {...registerStats(`stats.${index}.redCards`, { valueAsNumber: true })}
                                                        className="flex h-9 w-full rounded-md border border-navy-800 bg-navy-900 px-3 text-sm text-red-500"
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {selectedPlayerIds.size === 0 && (
                                        <div className="rounded-2xl border border-dashed border-navy-700 bg-navy-950/40 px-4 py-10 text-center text-sm text-cream-300">
                                            Marque pelo menos um jogador em <strong>Participacao</strong> para liberar os eventos da partida.
                                        </div>
                                    )}
                                </div>

                                {statsFeedback && (
                                    <div className={`rounded-xl px-4 py-3 text-sm ${statsFeedback.includes("sucesso")
                                        ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                                        : "border border-red-500/30 bg-red-500/10 text-red-200"
                                        }`}>
                                        {statsFeedback}
                                    </div>
                                )}

                                <div className="flex items-center justify-end gap-4 pt-4 border-t border-navy-800">
                                    <Button type="submit" variant="primary" disabled={isSavingStats}>
                                        <Save className="mr-2 h-4 w-4" />
                                        {isSavingStats ? "Gravando..." : "Gravar Estatisticas"}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </form>
                )}
            </div>
        </div>
    );
}
