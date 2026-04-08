"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Badge, Button, Card, CardContent, FormField, Tabs } from "@resenha/ui";
import {
    SaveChampionshipParticipantsSchema,
    type SaveChampionshipParticipantsInput,
    UpdateChampionshipSchema,
    type UpdateChampionshipInput
} from "@resenha/validators";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { deleteChampionship, saveChampionshipParticipants, updateChampionship } from "@/actions/championships";
import { formatDateTimeLocalValue, parseDateTimeLocalToIso } from "@/lib/dateTimeLocal";

interface ChampionshipRecord {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    seasonLabel: string;
    surface: "CAMPO" | "FUTSAL" | "MISTO";
    format: "LEAGUE" | "GROUP_STAGE" | "KNOCKOUT" | "HYBRID";
    status: "PLANNED" | "LIVE" | "FINISHED";
    pointsPerWin: number;
    pointsPerDraw: number;
    pointsPerLoss: number;
    showStandings: boolean;
    startsAt: Date | null;
    endsAt: Date | null;
}

interface ClubOption {
    id: string;
    name: string;
    shortName: string;
    isActive: boolean;
    isResenha: boolean;
}

interface ChampionshipGroupOption {
    id: string;
    name: string;
    phaseLabel: string;
}

interface StandingPreviewRow {
    position: number;
    clubName: string;
    points: number;
    played: number;
    goalDifference: number;
}

interface EditableGroupState {
    key: string;
    name: string;
    phaseLabel: string;
}

const GROUP_PHASE_DEFAULT = "FASE DE GRUPOS";

const createLocalGroup = (index: number): EditableGroupState => ({
    key: `local-group-${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${index}`,
    name: `Grupo ${String.fromCharCode(65 + (index % 26))}`,
    phaseLabel: GROUP_PHASE_DEFAULT,
});

export function EditChampionshipForm({
    championship,
    clubs,
    participantIds,
    participantGroups,
    groups,
    standingsPreview,
    totalMatches
}: {
    championship: ChampionshipRecord;
    clubs: ClubOption[];
    participantIds: string[];
    participantGroups: Record<string, string | null>;
    groups: ChampionshipGroupOption[];
    standingsPreview: StandingPreviewRow[];
    totalMatches: number;
}) {
    const router = useRouter();
    const [activeTab, setActiveTab] = React.useState("GERAL");
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [isSavingParticipants, setIsSavingParticipants] = React.useState(false);
    const [isDeleting, setIsDeleting] = React.useState(false);
    const [participantsFeedback, setParticipantsFeedback] = React.useState<string | null>(null);
    const [selectedClubIds, setSelectedClubIds] = React.useState<string[]>(participantIds);
    type ChampionshipFormValues = z.input<typeof UpdateChampionshipSchema>;

    const { register, watch, handleSubmit, formState: { errors } } = useForm<ChampionshipFormValues, unknown, UpdateChampionshipInput>({
        resolver: zodResolver(UpdateChampionshipSchema),
        defaultValues: {
            name: championship.name,
            slug: championship.slug,
            description: championship.description ?? "",
            seasonLabel: championship.seasonLabel,
            surface: championship.surface,
            format: championship.format,
            status: championship.status,
            pointsPerWin: championship.pointsPerWin,
            pointsPerDraw: championship.pointsPerDraw,
            pointsPerLoss: championship.pointsPerLoss,
            showStandings: championship.showStandings,
            startsAt: formatDateTimeLocalValue(championship.startsAt),
            endsAt: formatDateTimeLocalValue(championship.endsAt),
        },
    });

    const sortedClubs = React.useMemo(
        () => [...clubs].sort((left, right) => Number(right.isResenha) - Number(left.isResenha) || left.name.localeCompare(right.name, "pt-BR")),
        [clubs]
    );
    const clubsById = React.useMemo(() => new Map(clubs.map((club) => [club.id, club])), [clubs]);
    const [groupConfigs, setGroupConfigs] = React.useState<EditableGroupState[]>(
        groups.length > 0
            ? groups.map((group) => ({
                key: group.id,
                name: group.name,
                phaseLabel: group.phaseLabel,
            }))
            : []
    );
    const [clubGroupAssignments, setClubGroupAssignments] = React.useState<Record<string, string>>(() => {
        const nextValue: Record<string, string> = {};

        participantIds.forEach((clubId) => {
            const groupId = participantGroups[clubId];

            if (groupId) {
                nextValue[clubId] = groupId;
            }
        });

        return nextValue;
    });
    const championshipFormat = watch("format") ?? championship.format;
    const isGroupedFormat = championshipFormat === "GROUP_STAGE" || championshipFormat === "HYBRID";

    React.useEffect(() => {
        if (isGroupedFormat && groupConfigs.length === 0) {
            setGroupConfigs([createLocalGroup(0)]);
        }
    }, [groupConfigs.length, isGroupedFormat]);

    const onSubmit = async (data: UpdateChampionshipInput) => {
        setIsSubmitting(true);
        const result = await updateChampionship(championship.id, {
            ...data,
            startsAt: parseDateTimeLocalToIso(data.startsAt) ?? data.startsAt,
            endsAt: parseDateTimeLocalToIso(data.endsAt) ?? data.endsAt,
        });
        setIsSubmitting(false);

        if (result.success) {
            router.push("/campeonatos");
            router.refresh();
            return;
        }

        alert(result.error ?? "Nao foi possivel atualizar o campeonato.");
    };

    const toggleParticipant = (clubId: string) => {
        setSelectedClubIds((currentValue) => {
            const isRemoving = currentValue.includes(clubId);

            if (isRemoving) {
                setClubGroupAssignments((currentAssignments) => {
                    const nextAssignments = { ...currentAssignments };
                    delete nextAssignments[clubId];
                    return nextAssignments;
                });

                return currentValue.filter((value) => value !== clubId);
            }

            return [...currentValue, clubId];
        });
    };

    const addGroup = () => {
        setGroupConfigs((currentValue) => [...currentValue, createLocalGroup(currentValue.length)]);
    };

    const updateGroupField = (groupKey: string, field: "name" | "phaseLabel", value: string) => {
        setGroupConfigs((currentValue) =>
            currentValue.map((group) =>
                group.key === groupKey
                    ? {
                        ...group,
                        [field]: value,
                    }
                    : group
            )
        );
    };

    const removeGroup = (groupKey: string) => {
        setGroupConfigs((currentValue) => currentValue.filter((group) => group.key !== groupKey));
        setClubGroupAssignments((currentAssignments) =>
            Object.fromEntries(
                Object.entries(currentAssignments).filter(([, assignedGroupKey]) => assignedGroupKey !== groupKey)
            )
        );
    };

    const assignClubToGroup = (clubId: string, groupKey: string) => {
        setClubGroupAssignments((currentAssignments) => {
            if (!groupKey) {
                const nextAssignments = { ...currentAssignments };
                delete nextAssignments[clubId];
                return nextAssignments;
            }

            return {
                ...currentAssignments,
                [clubId]: groupKey,
            };
        });
    };

    const handleSaveParticipants = async () => {
        setIsSavingParticipants(true);
        setParticipantsFeedback(null);

        if (isGroupedFormat) {
            const activeGroups = groupConfigs.filter((group) => group.name.trim());

            if (activeGroups.length === 0) {
                setIsSavingParticipants(false);
                setParticipantsFeedback("Crie ao menos um grupo antes de salvar os participantes.");
                return;
            }

            const unassignedClubs = selectedClubIds.filter((clubId) => !clubGroupAssignments[clubId]);

            if (unassignedClubs.length > 0) {
                setIsSavingParticipants(false);
                setParticipantsFeedback("Atribua todos os clubes selecionados a um grupo antes de salvar.");
                return;
            }
        }

        const payload: SaveChampionshipParticipantsInput = SaveChampionshipParticipantsSchema.parse({
            championshipId: championship.id,
            clubIds: selectedClubIds,
            groups: isGroupedFormat
                ? groupConfigs
                    .filter((group) => group.name.trim())
                    .map((group) => ({
                        name: group.name.trim(),
                        phaseLabel: group.phaseLabel.trim() || GROUP_PHASE_DEFAULT,
                        clubIds: selectedClubIds.filter((clubId) => clubGroupAssignments[clubId] === group.key),
                    }))
                    .filter((group) => group.clubIds.length > 0)
                : [],
        });
        const result = await saveChampionshipParticipants(payload);
        setIsSavingParticipants(false);

        if (result.success) {
            setParticipantsFeedback("Participantes salvos com sucesso. Agora voce pode cadastrar os confrontos em Partidas.");
            router.refresh();
            return;
        }

        setParticipantsFeedback(result.error ?? "Nao foi possivel salvar os participantes.");
    };

    const handleDelete = async () => {
        const shouldDelete = window.confirm(`Excluir ${championship.name}? Essa acao remove a competicao e seus participantes.`);

        if (!shouldDelete) {
            return;
        }

        setIsDeleting(true);
        const result = await deleteChampionship(championship.id);
        setIsDeleting(false);

        if (!result.success) {
            alert(result.error ?? "Nao foi possivel excluir o campeonato.");
            return;
        }

        router.push("/campeonatos");
        router.refresh();
    };

    return (
        <div className="mx-auto max-w-5xl space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/campeonatos" className="rounded-full p-2 text-cream-300 transition-colors hover:bg-navy-800 hover:text-cream-100">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                    <h1 className="font-display text-2xl font-bold tracking-tight text-cream-100">Editar Campeonato</h1>
                    <p className="mt-1 text-sm text-cream-300">{championship.name}</p>
                </div>
            </div>

            <Tabs
                tabs={[
                    { id: "GERAL", label: "Dados gerais" },
                    { id: "PARTICIPANTES", label: "Participantes" },
                ]}
                activeId={activeTab}
                onChange={setActiveTab}
                variant="underline"
            />

            {activeTab === "GERAL" ? (
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Card className="border-navy-800 bg-navy-900">
                        <CardContent className="space-y-8 p-6">
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <FormField id="name" label="Nome do campeonato" {...register("name")} error={!!errors.name} errorMessage={errors.name?.message} />
                                <FormField id="seasonLabel" label="Edicao / temporada" {...register("seasonLabel")} error={!!errors.seasonLabel} errorMessage={errors.seasonLabel?.message} />
                                <FormField id="slug" label="Slug" {...register("slug")} error={!!errors.slug} errorMessage={errors.slug?.message} />

                                <div className="space-y-2">
                                    <label htmlFor="surface" className="text-sm font-medium leading-none text-cream-100">Modalidade</label>
                                    <select id="surface" {...register("surface")} className="flex h-10 w-full rounded-md border border-navy-800 bg-navy-900 px-3 py-2 text-sm text-cream-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                                        <option value="CAMPO">Campo</option>
                                        <option value="FUTSAL">Quadra / Futsal</option>
                                        <option value="MISTO">Misto</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="format" className="text-sm font-medium leading-none text-cream-100">Formato</label>
                                    <select id="format" {...register("format")} className="flex h-10 w-full rounded-md border border-navy-800 bg-navy-900 px-3 py-2 text-sm text-cream-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                                        <option value="LEAGUE">Pontos corridos</option>
                                        <option value="GROUP_STAGE">Fase de grupos</option>
                                        <option value="KNOCKOUT">Mata-mata</option>
                                        <option value="HYBRID">Hibrido</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="status" className="text-sm font-medium leading-none text-cream-100">Status</label>
                                    <select id="status" {...register("status")} className="flex h-10 w-full rounded-md border border-navy-800 bg-navy-900 px-3 py-2 text-sm text-cream-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                                        <option value="PLANNED">Planejado</option>
                                        <option value="LIVE">Em andamento</option>
                                        <option value="FINISHED">Finalizado</option>
                                    </select>
                                </div>

                                <FormField id="startsAt" label="Inicio" type="datetime-local" {...register("startsAt")} error={!!errors.startsAt} errorMessage={errors.startsAt?.message} />
                                <FormField id="endsAt" label="Encerramento" type="datetime-local" {...register("endsAt")} error={!!errors.endsAt} errorMessage={errors.endsAt?.message} />
                                <FormField id="pointsPerWin" label="Pontos por vitoria" type="number" {...register("pointsPerWin", { valueAsNumber: true })} error={!!errors.pointsPerWin} errorMessage={errors.pointsPerWin?.message} />
                                <FormField id="pointsPerDraw" label="Pontos por empate" type="number" {...register("pointsPerDraw", { valueAsNumber: true })} error={!!errors.pointsPerDraw} errorMessage={errors.pointsPerDraw?.message} />
                                <FormField id="pointsPerLoss" label="Pontos por derrota" type="number" {...register("pointsPerLoss", { valueAsNumber: true })} error={!!errors.pointsPerLoss} errorMessage={errors.pointsPerLoss?.message} />
                            </div>

                            <div className="space-y-2">
                                <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-cream-100">
                                    <input type="checkbox" {...register("showStandings")} className="h-4 w-4 rounded border-navy-700 bg-navy-950 text-blue-500 focus:ring-blue-500 focus:ring-offset-navy-900" />
                                    Exibir tabela/classificacao publica
                                </label>
                            </div>

                            <div>
                                <label htmlFor="description" className="mb-2 block text-sm font-medium leading-none text-cream-100">Descricao</label>
                                <textarea id="description" {...register("description")} rows={4} className="w-full rounded-md border border-navy-800 bg-navy-900 p-3 text-sm text-cream-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" />
                            </div>

                            <div className="grid gap-4 rounded-2xl border border-navy-800 bg-navy-950/40 p-4 sm:grid-cols-3">
                                <div>
                                    <p className="text-xs uppercase tracking-[0.22em] text-cream-300/60">Participantes</p>
                                    <p className="mt-2 font-display text-3xl font-black text-cream-100">{selectedClubIds.length}</p>
                                </div>
                                <div>
                                    <p className="text-xs uppercase tracking-[0.22em] text-cream-300/60">Jogos cadastrados</p>
                                    <p className="mt-2 font-display text-3xl font-black text-cream-100">{totalMatches}</p>
                                </div>
                                <div>
                                    <p className="text-xs uppercase tracking-[0.22em] text-cream-300/60">Tabela</p>
                                    <div className="mt-3">
                                        <Badge variant={championship.showStandings ? "success" : "default"}>
                                            {championship.showStandings ? "Ativa no site" : "Oculta"}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-4 border-t border-navy-800 pt-4">
                                <Button type="button" variant="destructive" onClick={() => void handleDelete()} disabled={isDeleting}>
                                    {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    Excluir
                                </Button>
                                <Button type="button" variant="ghost" onClick={() => router.push("/campeonatos")}>
                                    Cancelar
                                </Button>
                                <Button type="submit" variant="primary" disabled={isSubmitting}>
                                    <Save className="mr-2 h-4 w-4" />
                                    {isSubmitting ? "Salvando..." : "Salvar Alteracoes"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            ) : (
                <Card className="border-navy-800 bg-navy-900">
                    <CardContent className="space-y-8 p-6">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h3 className="font-display text-xl font-bold text-cream-100">Participantes</h3>
                                <p className="mt-2 text-sm text-cream-300">
                                    {isGroupedFormat
                                        ? "Selecione os clubes desta competicao, monte os grupos e deixe os jogos alimentarem cada tabela automaticamente."
                                        : "Selecione os clubes desta competicao. Depois disso, os jogos cadastrados em Partidas passam a alimentar a tabela automaticamente."}
                                </p>
                            </div>

                            <Link href="/partidas/novo">
                                <Button variant="secondary">Cadastrar confronto</Button>
                            </Link>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {sortedClubs.map((club) => {
                                const isSelected = selectedClubIds.includes(club.id);

                                return (
                                    <button
                                        key={club.id}
                                        type="button"
                                        onClick={() => toggleParticipant(club.id)}
                                        className={`rounded-2xl border p-4 text-left transition-all ${
                                            isSelected
                                                ? "border-blue-500/30 bg-blue-500/10"
                                                : "border-navy-800 bg-navy-950/60 hover:border-blue-500/20"
                                        }`}
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <div>
                                                <p className="font-semibold text-cream-100">{club.name}</p>
                                                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-cream-300/70">{club.shortName}</p>
                                            </div>
                                            <div className="flex flex-wrap items-center justify-end gap-2">
                                                {isGroupedFormat && isSelected && clubGroupAssignments[club.id] && (
                                                    <Badge variant="outline">
                                                        {groupConfigs.find((group) => group.key === clubGroupAssignments[club.id])?.name ?? "Grupo"}
                                                    </Badge>
                                                )}
                                                {club.isResenha && <Badge variant="gold">Resenha</Badge>}
                                            </div>
                                        </div>
                                        <p className="mt-4 text-xs text-cream-300/70">
                                            {isSelected ? "Selecionado para a competicao." : club.isActive ? "Disponivel para entrar na competicao." : "Clube inativo na base."}
                                        </p>
                                    </button>
                                );
                            })}
                        </div>

                        {isGroupedFormat && (
                            <>
                                <div className="rounded-2xl border border-navy-800 bg-navy-950/40 p-4">
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                        <div>
                                            <p className="text-xs uppercase tracking-[0.22em] text-cream-300/60">Estrutura de grupos</p>
                                            <p className="mt-2 text-sm text-cream-300">
                                                Crie os grupos da fase inicial. A ordem das tabelas e puxada daqui para o site.
                                            </p>
                                        </div>
                                        <Button type="button" variant="secondary" onClick={addGroup}>
                                            Adicionar grupo
                                        </Button>
                                    </div>

                                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                                        {groupConfigs.map((group, index) => (
                                            <div key={group.key} className="rounded-2xl border border-navy-800 bg-navy-900/70 p-4">
                                                <div className="flex items-center justify-between gap-3">
                                                    <Badge variant="outline">{index + 1}o grupo</Badge>
                                                    {groupConfigs.length > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => removeGroup(group.key)}
                                                            className="text-sm font-medium text-red-300 transition-colors hover:text-red-200"
                                                        >
                                                            Remover
                                                        </button>
                                                    )}
                                                </div>

                                                <div className="mt-4 space-y-4">
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium leading-none text-cream-100">Nome do grupo</label>
                                                        <input
                                                            value={group.name}
                                                            onChange={(event) => updateGroupField(group.key, "name", event.target.value)}
                                                            className="flex h-10 w-full rounded-md border border-navy-800 bg-navy-900 px-3 py-2 text-sm text-cream-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                                                            placeholder={`Grupo ${String.fromCharCode(65 + (index % 26))}`}
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium leading-none text-cream-100">Fase exibida</label>
                                                        <input
                                                            value={group.phaseLabel}
                                                            onChange={(event) => updateGroupField(group.key, "phaseLabel", event.target.value)}
                                                            className="flex h-10 w-full rounded-md border border-navy-800 bg-navy-900 px-3 py-2 text-sm text-cream-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                                                            placeholder={GROUP_PHASE_DEFAULT}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-navy-800 bg-navy-950/40 p-4">
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.22em] text-cream-300/60">Distribuicao dos clubes</p>
                                        <p className="mt-2 text-sm text-cream-300">
                                            Cada clube selecionado precisa entrar em um grupo para a tabela publica ficar 100% automatica.
                                        </p>
                                    </div>

                                    {selectedClubIds.length > 0 ? (
                                        <div className="mt-4 grid gap-3 md:grid-cols-2">
                                            {selectedClubIds.map((clubId) => {
                                                const club = clubsById.get(clubId);

                                                if (!club) {
                                                    return null;
                                                }

                                                return (
                                                    <div key={clubId} className="rounded-2xl border border-navy-800 bg-navy-900/70 p-4">
                                                        <div className="flex items-start justify-between gap-3">
                                                            <div>
                                                                <p className="font-semibold text-cream-100">{club.name}</p>
                                                                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-cream-300/70">
                                                                    {club.shortName}
                                                                </p>
                                                            </div>
                                                            {club.isResenha && <Badge variant="gold">Resenha</Badge>}
                                                        </div>

                                                        <div className="mt-4 space-y-2">
                                                            <label className="text-sm font-medium leading-none text-cream-100">Grupo</label>
                                                            <select
                                                                value={clubGroupAssignments[clubId] ?? ""}
                                                                onChange={(event) => assignClubToGroup(clubId, event.target.value)}
                                                                className="flex h-10 w-full rounded-md border border-navy-800 bg-navy-900 px-3 py-2 text-sm text-cream-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                                                            >
                                                                <option value="">Selecione o grupo</option>
                                                                {groupConfigs.map((group) => (
                                                                    <option key={group.key} value={group.key}>
                                                                        {group.name || "Grupo sem nome"}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="mt-4 rounded-2xl border border-dashed border-navy-800 bg-navy-900/40 px-4 py-6 text-sm text-cream-300">
                                            Selecione os clubes primeiro para distribuir nos grupos.
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        <div className="rounded-2xl border border-navy-800 bg-navy-950/40 p-4">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-xs uppercase tracking-[0.22em] text-cream-300/60">Tabela previa</p>
                                    <p className="mt-2 text-sm text-cream-300">
                                        {standingsPreview.length > 0
                                            ? "A tabela abaixo e recalculada com base nas partidas ja cadastradas."
                                            : "Ainda nao existem jogos finalizados suficientes para montar a classificacao."}
                                    </p>
                                </div>
                                <Badge variant="outline">{totalMatches} jogos</Badge>
                            </div>

                            {standingsPreview.length > 0 && (
                                <>
                                    <div className="mt-4 space-y-3 md:hidden">
                                        {standingsPreview.map((row) => (
                                            <div key={`${row.position}-${row.clubName}`} className="rounded-xl border border-navy-800 bg-navy-900/70 p-4">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div>
                                                        <p className="font-semibold text-cream-100">{row.clubName}</p>
                                                        <p className="mt-1 text-xs uppercase tracking-[0.18em] text-cream-300/70">
                                                            {row.position}o lugar
                                                        </p>
                                                    </div>
                                                    <Badge variant="outline">{row.points} pts</Badge>
                                                </div>
                                                <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-cream-300">
                                                    <div className="rounded-lg border border-navy-800 bg-navy-950/60 p-3">
                                                        <p className="text-[10px] uppercase tracking-[0.2em] text-cream-300/60">Jogos</p>
                                                        <p className="mt-2 font-semibold text-cream-100">{row.played}</p>
                                                    </div>
                                                    <div className="rounded-lg border border-navy-800 bg-navy-950/60 p-3">
                                                        <p className="text-[10px] uppercase tracking-[0.2em] text-cream-300/60">Saldo</p>
                                                        <p className="mt-2 font-semibold text-cream-100">
                                                            {row.goalDifference >= 0 ? "+" : ""}{row.goalDifference}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-4 hidden overflow-hidden rounded-xl border border-navy-800 md:block">
                                        <table className="w-full text-left text-sm text-cream-100">
                                            <thead className="bg-navy-950/70 text-xs uppercase text-cream-300">
                                                <tr>
                                                    <th className="px-4 py-3">Pos</th>
                                                    <th className="px-4 py-3">Clube</th>
                                                    <th className="px-4 py-3">Pts</th>
                                                    <th className="px-4 py-3">J</th>
                                                    <th className="px-4 py-3">SG</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {standingsPreview.map((row) => (
                                                    <tr key={`${row.position}-${row.clubName}`} className="border-t border-navy-800">
                                                        <td className="px-4 py-3 font-semibold">{row.position}</td>
                                                        <td className="px-4 py-3">{row.clubName}</td>
                                                        <td className="px-4 py-3 font-semibold">{row.points}</td>
                                                        <td className="px-4 py-3">{row.played}</td>
                                                        <td className="px-4 py-3">{row.goalDifference >= 0 ? "+" : ""}{row.goalDifference}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            )}
                        </div>

                        {participantsFeedback && (
                            <div className={`rounded-xl px-4 py-3 text-sm ${
                                participantsFeedback.includes("sucesso")
                                    ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                                    : "border border-red-500/30 bg-red-500/10 text-red-200"
                            }`}>
                                {participantsFeedback}
                            </div>
                        )}

                        <div className="flex items-center justify-end gap-4 border-t border-navy-800 pt-4">
                            <Button type="button" variant="ghost" onClick={() => router.push("/campeonatos")}>
                                Fechar
                            </Button>
                            <Button type="button" variant="primary" disabled={isSavingParticipants} onClick={() => void handleSaveParticipants()}>
                                <Save className="mr-2 h-4 w-4" />
                                {isSavingParticipants ? "Salvando..." : "Salvar Participantes"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
