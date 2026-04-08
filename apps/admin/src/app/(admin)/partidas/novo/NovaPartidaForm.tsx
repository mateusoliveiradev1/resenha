"use client";

import * as React from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateMatchSchema, type CreateMatchInput } from "@resenha/validators";
import { Button, Card, CardContent, FormField } from "@resenha/ui";
import { ArrowLeft, Building2, Save, Trophy } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createMatch } from "@/actions/matches";

type ClubOption = {
    id: string;
    name: string;
    shortName?: string | null;
    logoUrl?: string | null;
    isResenha: boolean;
};

type ChampionshipOption = {
    id: string;
    name: string;
    seasonLabel?: string | null;
    status: "PLANNED" | "LIVE" | "FINISHED";
};

const DEFAULT_DURATION_BY_TYPE = {
    FUTSAL: 55,
    CAMPO: 115,
} as const;

export function NovaPartidaForm({
    clubs,
    championships,
}: {
    clubs: ClubOption[];
    championships: ChampionshipOption[];
}) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [formFeedback, setFormFeedback] = React.useState<string | null>(null);
    const resenhaClub = clubs.find((club) => club.isResenha) ?? null;

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<CreateMatchInput>({
        resolver: zodResolver(CreateMatchSchema) as Resolver<CreateMatchInput>,
        defaultValues: {
            status: "SCHEDULED",
            type: "FUTSAL",
            matchCategory: "FRIENDLY",
            autoStatus: true,
            durationMinutes: DEFAULT_DURATION_BY_TYPE.FUTSAL,
            season: "",
            homeClubId: resenhaClub?.id ?? null,
            awayClubId: null,
            homeLabel: "",
            awayLabel: "",
            championshipId: null,
            championshipGroupId: null,
            phaseLabel: "",
            roundLabel: "",
            matchday: null,
            scoreHome: null,
            scoreAway: null,
            tiebreakHome: null,
            tiebreakAway: null,
            summary: "",
        },
    });

    const matchCategory = watch("matchCategory");
    const matchType = watch("type");
    const autoStatus = watch("autoStatus");

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
        setValue("durationMinutes", DEFAULT_DURATION_BY_TYPE[matchType]);
    }, [matchType, setValue]);

    const onSubmit = async (data: CreateMatchInput) => {
        setIsSubmitting(true);
        setFormFeedback(null);

        const result = await createMatch({
            ...data,
            date: new Date(data.date).toISOString(),
        });

        setIsSubmitting(false);

        if (result.success) {
            router.push("/partidas");
            router.refresh();
            return;
        }

        setFormFeedback(result.error ?? "Nao foi possivel criar a partida.");
    };

    return (
        <div className="mx-auto max-w-5xl space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/partidas" className="rounded-full p-2 text-cream-300 transition-colors hover:bg-navy-800 hover:text-cream-100">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                    <h1 className="font-display text-2xl font-bold tracking-tight text-cream-100">
                        Nova Partida
                    </h1>
                    <p className="mt-1 text-sm text-cream-300">
                        Escolha os clubes, vincule ao campeonato quando existir e deixe o site cuidar do restante.
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
                <Card className="border-navy-800 bg-navy-900">
                    <CardContent className="space-y-8 p-6">
                        <div className="space-y-4">
                            <div className="flex flex-col gap-3 border-b border-navy-800 pb-3 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <h3 className="text-sm font-semibold uppercase tracking-wider text-blue-400">
                                        Estrutura da partida
                                    </h3>
                                    <p className="mt-1 text-xs text-cream-300">
                                        Amistosos ficam fora da tabela. Partidas de campeonato entram na classificacao automatica.
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
                                        {...register("matchCategory")}
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
                                        {...register("type")}
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
                                            {...register("championshipId")}
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
                                        {errors.championshipId?.message && (
                                            <p className="text-[0.8rem] font-medium text-red-500">
                                                {errors.championshipId.message}
                                            </p>
                                        )}
                                    </div>
                                ) : (
                                    <FormField
                                        id="season"
                                        label="Contexto / serie da partida"
                                        placeholder="Ex.: Amistoso de preparacao"
                                        {...register("season")}
                                        error={!!errors.season}
                                        errorMessage={errors.season?.message}
                                    />
                                )}

                                <FormField
                                    id="date"
                                    label="Data e hora"
                                    type="datetime-local"
                                    {...register("date")}
                                    error={!!errors.date}
                                    errorMessage={errors.date?.message}
                                />

                                <FormField
                                    id="location"
                                    label="Local"
                                    {...register("location")}
                                    error={!!errors.location}
                                    errorMessage={errors.location?.message}
                                />

                                {matchCategory === "CHAMPIONSHIP" && (
                                    <>
                                        <FormField
                                            id="phaseLabel"
                                            label="Fase"
                                            placeholder="Ex.: Grupo A / Semifinal"
                                            {...register("phaseLabel")}
                                            error={!!errors.phaseLabel}
                                            errorMessage={errors.phaseLabel?.message}
                                        />
                                        <FormField
                                            id="roundLabel"
                                            label="Rodada"
                                            placeholder="Ex.: 3a rodada"
                                            {...register("roundLabel")}
                                            error={!!errors.roundLabel}
                                            errorMessage={errors.roundLabel?.message}
                                        />
                                        <FormField
                                            id="matchday"
                                            label="Numero da rodada"
                                            type="number"
                                            {...register("matchday", { valueAsNumber: true })}
                                            error={!!errors.matchday}
                                            errorMessage={errors.matchday?.message}
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
                                    O escudo e o nome mostrados no site sao herdados automaticamente dos clubes selecionados.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <label htmlFor="homeClubId" className="text-sm font-medium leading-none text-cream-100">
                                        Mandante
                                    </label>
                                    <select
                                        id="homeClubId"
                                        {...register("homeClubId")}
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
                                        Para chaveamento automatico, deixe sem clube e use rotulos como 2o colocado ou VENC JOGO 37.
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="awayClubId" className="text-sm font-medium leading-none text-cream-100">
                                        Visitante
                                    </label>
                                    <select
                                        id="awayClubId"
                                        {...register("awayClubId")}
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
                                        Quando o confronto depender da tabela ou de outra partida, o sistema resolve o clube sozinho.
                                    </p>
                                </div>

                                <FormField
                                    id="homeLabel"
                                    label="Rotulo oficial do mandante"
                                    placeholder="Ex.: 2o colocado / Venc jogo 37"
                                    {...register("homeLabel")}
                                    error={!!errors.homeLabel}
                                    errorMessage={errors.homeLabel?.message}
                                />

                                <FormField
                                    id="awayLabel"
                                    label="Rotulo oficial do visitante"
                                    placeholder="Ex.: 3o colocado / Venc jogo 38"
                                    {...register("awayLabel")}
                                    error={!!errors.awayLabel}
                                    errorMessage={errors.awayLabel?.message}
                                />
                            </div>

                            {(errors.homeClubId?.message || errors.awayClubId?.message || errors.homeLabel?.message || errors.awayLabel?.message || errors.opponent?.message) && (
                                <p className="text-[0.8rem] font-medium text-red-500">
                                    {errors.homeClubId?.message || errors.awayClubId?.message || errors.homeLabel?.message || errors.awayLabel?.message || errors.opponent?.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-4">
                            <div className="border-b border-navy-800 pb-3">
                                <h3 className="text-sm font-semibold uppercase tracking-wider text-blue-400">
                                    Controle e placar
                                </h3>
                                <p className="mt-1 text-xs text-cream-300">
                                    O status automatico coloca a partida em LIVE dentro da janela configurada.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-6">
                                <div className="space-y-2">
                                    <label htmlFor="status" className="text-sm font-medium leading-none text-cream-100">
                                        Status base
                                    </label>
                                    <select
                                        id="status"
                                        {...register("status")}
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
                                    {...register("durationMinutes", { valueAsNumber: true })}
                                    error={!!errors.durationMinutes}
                                    errorMessage={errors.durationMinutes?.message}
                                />

                                <FormField
                                    id="scoreHome"
                                    label="Gols do mandante"
                                    type="number"
                                    {...register("scoreHome", { valueAsNumber: true })}
                                    error={!!errors.scoreHome}
                                    errorMessage={errors.scoreHome?.message}
                                />

                                <FormField
                                    id="scoreAway"
                                    label="Gols do visitante"
                                    type="number"
                                    {...register("scoreAway", { valueAsNumber: true })}
                                    error={!!errors.scoreAway}
                                    errorMessage={errors.scoreAway?.message}
                                />

                                <FormField
                                    id="tiebreakHome"
                                    label="Desempate mandante"
                                    type="number"
                                    {...register("tiebreakHome", { valueAsNumber: true })}
                                    error={!!errors.tiebreakHome}
                                    errorMessage={errors.tiebreakHome?.message}
                                />

                                <FormField
                                    id="tiebreakAway"
                                    label="Desempate visitante"
                                    type="number"
                                    {...register("tiebreakAway", { valueAsNumber: true })}
                                    error={!!errors.tiebreakAway}
                                    errorMessage={errors.tiebreakAway?.message}
                                />
                            </div>

                            <p className="text-xs text-cream-300">
                                Preencha o desempate apenas se o tempo normal terminou empatado e houve penaltis ou outro criterio oficial.
                                Isso libera automaticamente vencedor e perdedor para semifinal, final e terceiro lugar.
                            </p>

                            <label className="flex items-start gap-3 rounded-2xl border border-navy-800 bg-navy-950/50 px-4 py-4 text-sm text-cream-100">
                                <input
                                    type="checkbox"
                                    {...register("autoStatus")}
                                    className="mt-1 h-4 w-4 rounded border-navy-700 bg-navy-900 text-blue-500 focus:ring-blue-500"
                                />
                                <span>
                                    <strong className="block font-semibold text-cream-100">Ativar automacao de status</strong>
                                    <span className="mt-1 block text-xs text-cream-300">
                                        {autoStatus
                                            ? "A partida muda sozinha para LIVE quando chegar o horario."
                                            : "Com a automacao desligada, o status depende apenas do que foi salvo no painel."}
                                    </span>
                                </span>
                            </label>

                            <div className="sm:col-span-2">
                                <label htmlFor="summary" className="mb-2 block text-sm font-medium leading-none text-cream-100">
                                    Resumo inicial
                                </label>
                                <textarea
                                    id="summary"
                                    {...register("summary")}
                                    rows={4}
                                    className="w-full rounded-md border border-navy-800 bg-navy-900 p-3 text-sm text-cream-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                                    placeholder="Observacoes da partida, contexto, arbitragem, cobertura..."
                                />
                            </div>
                        </div>

                        {formFeedback && (
                            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                                {formFeedback}
                            </div>
                        )}

                        <div className="flex items-center justify-end gap-4 border-t border-navy-800 pt-4">
                            <Button type="button" variant="ghost" onClick={() => router.push("/partidas")}>
                                Cancelar
                            </Button>
                            <Button type="submit" variant="primary" disabled={isSubmitting}>
                                <Save className="mr-2 h-4 w-4" />
                                {isSubmitting ? "Criando..." : "Criar Partida"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </div>
    );
}
