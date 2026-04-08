"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Card, CardContent, FormField } from "@resenha/ui";
import { CreateChampionshipSchema, type CreateChampionshipInput } from "@resenha/validators";
import { ArrowLeft, Save } from "lucide-react";
import { createChampionship } from "@/actions/championships";

export default function NovoCampeonatoPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    type ChampionshipFormValues = z.input<typeof CreateChampionshipSchema>;

    const { register, handleSubmit, formState: { errors } } = useForm<ChampionshipFormValues, unknown, CreateChampionshipInput>({
        resolver: zodResolver(CreateChampionshipSchema),
        defaultValues: {
            surface: "CAMPO",
            format: "LEAGUE",
            status: "PLANNED",
            pointsPerWin: 3,
            pointsPerDraw: 1,
            pointsPerLoss: 0,
            showStandings: true,
            description: "",
            slug: "",
            startsAt: "",
            endsAt: "",
        },
    });

    const onSubmit = async (data: CreateChampionshipInput) => {
        setIsSubmitting(true);
        const result = await createChampionship(data);
        setIsSubmitting(false);

        if (result.success) {
            router.push("/campeonatos");
            router.refresh();
            return;
        }

        alert(result.error ?? "Nao foi possivel criar o campeonato.");
    };

    return (
        <div className="mx-auto max-w-4xl space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/campeonatos" className="rounded-full p-2 text-cream-300 transition-colors hover:bg-navy-800 hover:text-cream-100">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                    <h1 className="font-display text-2xl font-bold tracking-tight text-cream-100">Novo Campeonato</h1>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
                <Card className="border-navy-800 bg-navy-900">
                    <CardContent className="space-y-8 p-6">
                        <div className="space-y-4">
                            <h3 className="border-b border-navy-800 pb-2 text-sm font-semibold uppercase tracking-wider text-blue-400">
                                Identidade da competicao
                            </h3>

                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <FormField id="name" label="Nome do campeonato" {...register("name")} error={!!errors.name} errorMessage={errors.name?.message} />
                                <FormField id="seasonLabel" label="Edicao / temporada" {...register("seasonLabel")} error={!!errors.seasonLabel} errorMessage={errors.seasonLabel?.message} />
                                <FormField id="slug" label="Slug (opcional)" {...register("slug")} error={!!errors.slug} errorMessage={errors.slug?.message} />

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
                            </div>

                            <div className="sm:col-span-2">
                                <label htmlFor="description" className="mb-2 block text-sm font-medium leading-none text-cream-100">Descricao</label>
                                <textarea id="description" {...register("description")} rows={4} className="w-full rounded-md border border-navy-800 bg-navy-900 p-3 text-sm text-cream-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" placeholder="Resumo do regulamento, observacoes e detalhes da competicao..." />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="border-b border-navy-800 pb-2 text-sm font-semibold uppercase tracking-wider text-blue-400">
                                Pontuacao
                            </h3>

                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                                <FormField id="pointsPerWin" label="Pontos por vitoria" type="number" {...register("pointsPerWin", { valueAsNumber: true })} error={!!errors.pointsPerWin} errorMessage={errors.pointsPerWin?.message} />
                                <FormField id="pointsPerDraw" label="Pontos por empate" type="number" {...register("pointsPerDraw", { valueAsNumber: true })} error={!!errors.pointsPerDraw} errorMessage={errors.pointsPerDraw?.message} />
                                <FormField id="pointsPerLoss" label="Pontos por derrota" type="number" {...register("pointsPerLoss", { valueAsNumber: true })} error={!!errors.pointsPerLoss} errorMessage={errors.pointsPerLoss?.message} />
                            </div>

                            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-cream-100">
                                <input type="checkbox" {...register("showStandings")} className="h-4 w-4 rounded border-navy-700 bg-navy-950 text-blue-500 focus:ring-blue-500 focus:ring-offset-navy-900" />
                                Exibir tabela/classificacao no site
                            </label>
                        </div>

                        <div className="flex items-center justify-end gap-4 border-t border-navy-800 pt-4">
                            <Button type="button" variant="ghost" onClick={() => router.push("/campeonatos")}>
                                Cancelar
                            </Button>
                            <Button type="submit" variant="primary" disabled={isSubmitting}>
                                <Save className="mr-2 h-4 w-4" />
                                {isSubmitting ? "Salvando..." : "Salvar Campeonato"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </div>
    );
}
