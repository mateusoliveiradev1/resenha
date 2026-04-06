"use client";

import * as React from "react";
import { useForm, useFieldArray, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UpdateMatchSchema, type UpdateMatchInput, UpsertMatchStatsSchema, type UpsertMatchStatsInput } from "@resenha/validators";
import { Button, FormField, Card, CardContent, Tabs, shouldBypassNextImageOptimization } from "@resenha/ui";
import { ArrowLeft, Save, Trash2, Plus, UploadCloud } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { updateMatch, upsertMatchStats } from "@/actions/matches";
import { uploadOpponentLogo } from "@/lib/opponentLogoUpload";

type MatchData = {
    id: string;
    opponent: string;
    opponentLogo?: string | null;
    location: string;
    status: "SCHEDULED" | "LIVE" | "FINISHED";
    scoreHome?: number | null;
    scoreAway?: number | null;
    type: "FUTSAL" | "CAMPO";
    summary?: string | null;
    season: string;
};

type MatchStatsData = {
    playerId: string;
    goals: number;
    assists: number;
    yellowCards: number;
    redCards: number;
    minutesPlayed?: number | null;
};

type PlayerOption = {
    id: string;
    name: string;
    nickname: string;
    shirtNumber: number;
};

const getErrorMessage = (error: unknown, fallbackMessage: string) => {
    if (error instanceof Error && error.message) {
        return error.message;
    }

    return fallbackMessage;
};

export function EditarPartidaForm({
    match,
    stats,
    players
}: {
    match: MatchData;
    stats: MatchStatsData[];
    players: PlayerOption[];
}) {
    const router = useRouter();
    const [activeTab, setActiveTab] = React.useState("GERAL");
    const [isSavingGeneral, setIsSavingGeneral] = React.useState(false);
    const [isSavingStats, setIsSavingStats] = React.useState(false);
    const [isUploadingLogo, setIsUploadingLogo] = React.useState(false);
    const [logoUrl, setLogoUrl] = React.useState<string | null>(match.opponentLogo ?? null);
    const [logoFeedback, setLogoFeedback] = React.useState<string | null>(null);
    const [generalFeedback, setGeneralFeedback] = React.useState<string | null>(null);
    const [statsFeedback, setStatsFeedback] = React.useState<string | null>(null);

    const { register: registerMatch, handleSubmit: submitMatch, formState: { errors: matchErrs } } = useForm<UpdateMatchInput>({
        resolver: zodResolver(UpdateMatchSchema) as Resolver<UpdateMatchInput>,
        defaultValues: {
            opponent: match.opponent || "",
            location: match.location || "",
            status: match.status || "SCHEDULED",
            scoreHome: match.scoreHome ?? undefined,
            scoreAway: match.scoreAway ?? undefined,
            type: match.type || "FUTSAL",
            summary: match.summary || "",
            season: match.season || "",
            opponentLogo: match.opponentLogo || ""
        }
    });

    const { register: registerStats, control, handleSubmit: submitStats } = useForm<UpsertMatchStatsInput>({
        resolver: zodResolver(UpsertMatchStatsSchema) as Resolver<UpsertMatchStatsInput>,
        defaultValues: {
            matchId: match.id,
            stats: stats.length > 0
                ? stats.map((item) => ({
                    playerId: item.playerId,
                    goals: item.goals ?? 0,
                    assists: item.assists ?? 0,
                    yellowCards: item.yellowCards ?? 0,
                    redCards: item.redCards ?? 0,
                    minutesPlayed: item.minutesPlayed ?? null
                }))
                : [{ playerId: "", goals: 0, assists: 0, yellowCards: 0, redCards: 0, minutesPlayed: null }]
        }
    });

    const { fields, append, remove } = useFieldArray({ control, name: "stats" });

    const handleLogoSelection = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        setIsUploadingLogo(true);
        setLogoFeedback("Enviando escudo...");
        setGeneralFeedback(null);

        try {
            const uploadedUrl = await uploadOpponentLogo(file);
            setLogoUrl(uploadedUrl);
            setLogoFeedback("Escudo enviado com sucesso. Salve a partida para persistir a URL.");
        } catch (error: unknown) {
            setLogoFeedback(getErrorMessage(error, "Nao foi possivel enviar o escudo."));
        } finally {
            setIsUploadingLogo(false);
            event.target.value = "";
        }
    };

    const clearUploadedLogo = () => {
        setLogoUrl(null);
        setLogoFeedback("Escudo removido. Ao salvar, a partida ficara sem logo do adversario.");
    };

    const onMatchSubmit = async (data: UpdateMatchInput) => {
        setIsSavingGeneral(true);
        setGeneralFeedback(null);

        const result = await updateMatch(match.id, {
            ...data,
            opponentLogo: logoUrl
        });

        setIsSavingGeneral(false);

        if (result.success) {
            router.push("/partidas");
            router.refresh();
            return;
        }

        setGeneralFeedback(result.error ?? "Nao foi possivel atualizar a partida.");
    };

    const onStatsSubmit = async (data: UpsertMatchStatsInput) => {
        setIsSavingStats(true);
        setStatsFeedback(null);

        const result = await upsertMatchStats({
            ...data,
            stats: data.stats.filter((item) => item.playerId)
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
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
                <Link href="/partidas" className="text-cream-300 hover:text-cream-100 transition-colors p-2 rounded-full hover:bg-navy-800">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                    <h1 className="font-display text-2xl font-bold tracking-tight text-cream-100">Editar Partida</h1>
                </div>
            </div>

            <Tabs
                tabs={[
                    { id: "GERAL", label: "Dados Gerais" },
                    { id: "STATS", label: "Estatisticas de Jogadores" }
                ]}
                activeId={activeTab}
                onChange={setActiveTab}
                variant="underline"
            />

            <div className="mt-6">
                {activeTab === "GERAL" && (
                    <form onSubmit={submitMatch(onMatchSubmit)}>
                        <Card className="bg-navy-900 border-navy-800">
                            <CardContent className="p-6 space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <FormField id="opponent" label="Adversario" {...registerMatch("opponent")} error={!!matchErrs.opponent} errorMessage={matchErrs.opponent?.message} />
                                    <FormField id="season" label="Campeonato / Torneio" {...registerMatch("season")} error={!!matchErrs.season} errorMessage={matchErrs.season?.message} />
                                    <FormField id="location" label="Local" {...registerMatch("location")} error={!!matchErrs.location} errorMessage={matchErrs.location?.message} />

                                    <div className="space-y-2">
                                        <label htmlFor="status" className="text-sm font-medium leading-none text-cream-100">Status</label>
                                        <select id="status" {...registerMatch("status")} className="flex h-10 w-full rounded-md border border-navy-800 bg-navy-900 px-3 py-2 text-sm text-cream-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                                            <option value="SCHEDULED">Agendada</option>
                                            <option value="LIVE">Ao vivo</option>
                                            <option value="FINISHED">Finalizada</option>
                                        </select>
                                    </div>

                                    <FormField id="scoreHome" label="Gols (Resenha)" type="number" {...registerMatch("scoreHome", { valueAsNumber: true })} />
                                    <FormField id="scoreAway" label="Gols (Adversario)" type="number" {...registerMatch("scoreAway", { valueAsNumber: true })} />
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-sm font-semibold uppercase tracking-wider text-blue-400 border-b border-navy-800 pb-2">Escudo do adversario</h3>

                                    <label className="flex min-h-44 w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-navy-700 bg-navy-950/60 px-6 py-8 text-center transition-all hover:border-blue-500/50 hover:bg-navy-900">
                                        <input type="file" className="hidden" accept="image/png,image/jpeg,image/webp" onChange={handleLogoSelection} />

                                        {logoUrl ? (
                                            <div className="space-y-4">
                                                <Image
                                                    src={logoUrl}
                                                    alt="Escudo atual do adversario"
                                                    width={96}
                                                    height={96}
                                                    unoptimized={shouldBypassNextImageOptimization(logoUrl)}
                                                    className="mx-auto h-24 w-24 rounded-full border border-navy-700 bg-navy-900 object-contain p-2"
                                                />
                                                <p className="text-sm font-medium text-cream-100">Clique para trocar o escudo</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                <UploadCloud className="mx-auto h-10 w-10 text-cream-300" />
                                                <div className="space-y-1">
                                                    <p className="text-sm font-medium text-blue-400">
                                                        {isUploadingLogo ? "Enviando escudo..." : "Clique para enviar o escudo do adversario"}
                                                    </p>
                                                    <p className="text-xs text-cream-300">
                                                        A imagem vai para o armazenamento de arquivos e o banco salva somente a URL.
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </label>

                                    {logoFeedback && (
                                        <p className={`text-sm ${logoUrl ? "text-emerald-400" : "text-cream-300"}`}>
                                            {logoFeedback}
                                        </p>
                                    )}

                                    {logoUrl && (
                                        <div className="flex justify-start">
                                            <Button type="button" variant="ghost" onClick={clearUploadedLogo}>
                                                Remover escudo
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                <div className="sm:col-span-2">
                                    <label htmlFor="summary" className="text-sm font-medium leading-none text-cream-100 block mb-2">Resumo do jogo</label>
                                    <textarea id="summary" {...registerMatch("summary")} rows={4} className="w-full rounded-md border border-navy-800 bg-navy-900 p-3 text-sm text-cream-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" placeholder="Breve relato sobre a partida..." />
                                </div>

                                {generalFeedback && (
                                    <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                                        {generalFeedback}
                                    </div>
                                )}

                                <div className="flex items-center justify-end gap-4 pt-4 border-t border-navy-800">
                                    <Button type="submit" variant="primary" disabled={isSavingGeneral || isUploadingLogo}>
                                        <Save className="mr-2 h-4 w-4" />
                                        {isSavingGeneral ? "Salvando..." : "Salvar Partida"}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </form>
                )}

                {activeTab === "STATS" && (
                    <form onSubmit={submitStats(onStatsSubmit)}>
                        <Card className="bg-navy-900 border-navy-800">
                            <CardContent className="p-6 space-y-6">
                                <div className="space-y-4">
                                    {fields.map((field, index) => (
                                        <div key={field.id} className="flex flex-wrap items-end gap-4 bg-navy-950/50 p-4 rounded-xl border border-navy-800">
                                            <div className="flex-1 min-w-[240px]">
                                                <label className="text-xs font-medium text-cream-300 block mb-1">Jogador</label>
                                                <select
                                                    {...registerStats(`stats.${index}.playerId`)}
                                                    className="flex h-9 w-full rounded-md border border-navy-800 bg-navy-900 px-3 text-sm text-cream-100"
                                                >
                                                    <option value="">Selecione um jogador</option>
                                                    {players.map((player) => (
                                                        <option key={player.id} value={player.id}>
                                                            #{player.shirtNumber} - {player.nickname} ({player.name})
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="w-20">
                                                <label className="text-xs font-medium text-cream-300 block mb-1">Gols</label>
                                                <input type="number" {...registerStats(`stats.${index}.goals`, { valueAsNumber: true })} className="flex h-9 w-full rounded-md border border-navy-800 bg-navy-900 px-3 text-sm text-cream-100" />
                                            </div>
                                            <div className="w-20">
                                                <label className="text-xs font-medium text-cream-300 block mb-1">Assist.</label>
                                                <input type="number" {...registerStats(`stats.${index}.assists`, { valueAsNumber: true })} className="flex h-9 w-full rounded-md border border-navy-800 bg-navy-900 px-3 text-sm text-cream-100" />
                                            </div>
                                            <div className="w-20">
                                                <label className="text-xs font-medium text-cream-300 block mb-1">CA</label>
                                                <input type="number" {...registerStats(`stats.${index}.yellowCards`, { valueAsNumber: true })} className="flex h-9 w-full rounded-md border border-navy-800 bg-navy-900 px-3 text-sm text-yellow-500" />
                                            </div>
                                            <div className="w-20">
                                                <label className="text-xs font-medium text-cream-300 block mb-1">CV</label>
                                                <input type="number" {...registerStats(`stats.${index}.redCards`, { valueAsNumber: true })} className="flex h-9 w-full rounded-md border border-navy-800 bg-navy-900 px-3 text-sm text-red-500" />
                                            </div>
                                            <Button type="button" variant="destructive" size="sm" onClick={() => remove(index)} className="h-9 px-3">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}

                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => append({ playerId: "", goals: 0, assists: 0, yellowCards: 0, redCards: 0, minutesPlayed: null })}
                                        className="w-full border-dashed border-navy-700 bg-transparent text-blue-400 hover:bg-navy-800/50"
                                    >
                                        <Plus className="mr-2 h-4 w-4" /> Adicionar Jogador
                                    </Button>
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
