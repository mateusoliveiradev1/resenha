"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { UpdatePlayerSchema, type UpdatePlayerInput } from "@resenha/validators";
import { Button, FormField, Card, CardContent } from "@resenha/ui";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { deletePlayer, updatePlayer } from "../../../actions/players";
import { RosterPhotoUploadField } from "@/components/roster/RosterPhotoUploadField";

interface PlayerRecord {
    id: string;
    name: string;
    nickname: string;
    position: "GOL" | "DEF" | "MEI" | "ATA";
    shirtNumber: number;
    photoUrl: string | null;
    bio: string | null;
    heightCm: number | null;
    weightKg: number | null;
    birthDate: string | null;
    preferredFoot: "DIREITO" | "ESQUERDO" | "AMBIDESTRO" | null;
    goals: number;
    assists: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export function EditarJogadorForm({ player }: { player: PlayerRecord }) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [isDeleting, setIsDeleting] = React.useState(false);
    type UpdatePlayerFormValues = z.input<typeof UpdatePlayerSchema>;

    const { register, handleSubmit, setValue, formState: { errors } } = useForm<
        UpdatePlayerFormValues,
        unknown,
        UpdatePlayerInput
    >({
        resolver: zodResolver(UpdatePlayerSchema),
        defaultValues: {
            name: player.name || "",
            nickname: player.nickname || "",
            position: player.position || "ATA",
            shirtNumber: player.shirtNumber ?? null,
            isActive: player.isActive ?? true,
            heightCm: player.heightCm ?? undefined,
            weightKg: player.weightKg ?? undefined,
            preferredFoot: player.preferredFoot ?? undefined,
            goals: player.goals || 0,
            assists: player.assists || 0,
            photoUrl: player.photoUrl || "",
            birthDate: player.birthDate || "",
        }
    });
    const [photoUrlPreview, setPhotoUrlPreview] = React.useState(player.photoUrl || "");

    const onSubmit = async (data: UpdatePlayerInput) => {
        setIsSubmitting(true);
        const result = await updatePlayer(player.id, data);
        setIsSubmitting(false);

        if (result.success) {
            router.push("/jogadores");
            router.refresh();
        } else {
            alert("Error updating: " + result.error);
        }
    };

    const handleDelete = async () => {
        const shouldDelete = window.confirm(`Excluir ${player.nickname}? Essa acao remove o jogador do elenco.`);

        if (!shouldDelete) {
            return;
        }

        setIsDeleting(true);
        const result = await deletePlayer(player.id);
        setIsDeleting(false);

        if (!result.success) {
            alert("Error deleting: " + result.error);
            return;
        }

        router.push("/jogadores");
        router.refresh();
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
                <Link href="/jogadores" className="text-cream-300 hover:text-cream-100 transition-colors p-2 rounded-full hover:bg-navy-800">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                    <h1 className="font-display text-2xl font-bold tracking-tight text-cream-100">
                        Editar Jogador
                    </h1>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
                <Card className="bg-navy-900 border-navy-800">
                    <CardContent className="p-6 space-y-8">
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold uppercase tracking-wider text-blue-400 border-b border-navy-800 pb-2">Informacoes principais</h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <FormField id="name" label="Nome completo" {...register("name")} error={!!errors.name} errorMessage={errors.name?.message} />
                                <FormField id="nickname" label="Apelido" {...register("nickname")} error={!!errors.nickname} errorMessage={errors.nickname?.message} />

                                <div className="space-y-2">
                                    <label htmlFor="position" className="text-sm font-medium leading-none text-cream-100">
                                        Posicao
                                    </label>
                                    <select
                                        id="position"
                                        {...register("position")}
                                        className="flex h-10 w-full rounded-md border border-navy-800 bg-navy-900 px-3 py-2 text-sm text-cream-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                                    >
                                        <option value="GOL">Goleiro (GOL)</option>
                                        <option value="DEF">Defensor (DEF)</option>
                                        <option value="MEI">Meio-campo (MEI)</option>
                                        <option value="ATA">Atacante (ATA)</option>
                                    </select>
                                    {errors.position && <p className="text-[0.8rem] font-medium text-red-500">{errors.position.message}</p>}
                                </div>

                                <FormField
                                    id="shirtNumber"
                                    label="Numero da camisa"
                                    type="number"
                                    {...register("shirtNumber", { valueAsNumber: true })}
                                    error={!!errors.shirtNumber}
                                    errorMessage={errors.shirtNumber?.message}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-medium text-cream-100 cursor-pointer">
                                    <input type="checkbox" {...register("isActive")} className="w-4 h-4 rounded border-navy-700 bg-navy-950 text-blue-500 focus:ring-blue-500 focus:ring-offset-navy-900" />
                                    Jogador ativo
                                </label>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold uppercase tracking-wider text-blue-400 border-b border-navy-800 pb-2">Foto / Media</h3>
                            <input type="hidden" {...register("photoUrl")} />
                            <RosterPhotoUploadField
                                label="Foto oficial do jogador"
                                value={photoUrlPreview}
                                onChange={(nextValue) => {
                                    const normalizedValue = nextValue ?? "";
                                    setPhotoUrlPreview(normalizedValue);
                                    setValue("photoUrl", normalizedValue, { shouldDirty: true, shouldValidate: true });
                                }}
                                entity="players"
                                errorMessage={errors.photoUrl?.message}
                                helperText="Troque a foto quando precisar. O banco guarda apenas a URL local."
                            />
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold uppercase tracking-wider text-blue-400 border-b border-navy-800 pb-2">Atributos e estatisticas</h3>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                <FormField
                                    id="heightCm"
                                    label="Altura (cm)"
                                    type="number"
                                    {...register("heightCm", { valueAsNumber: true })}
                                    error={!!errors.heightCm}
                                    errorMessage={errors.heightCm?.message}
                                />

                                <FormField
                                    id="weightKg"
                                    label="Peso (kg)"
                                    type="number"
                                    {...register("weightKg", { valueAsNumber: true })}
                                    error={!!errors.weightKg}
                                    errorMessage={errors.weightKg?.message}
                                />

                                <FormField
                                    id="goals"
                                    label="Gols Resenha"
                                    type="number"
                                    {...register("goals", { valueAsNumber: true })}
                                    error={!!errors.goals}
                                    errorMessage={errors.goals?.message}
                                />

                                <FormField
                                    id="assists"
                                    label="Assistencias"
                                    type="number"
                                    {...register("assists", { valueAsNumber: true })}
                                    error={!!errors.assists}
                                    errorMessage={errors.assists?.message}
                                />

                                <div className="space-y-2">
                                    <label htmlFor="preferredFoot" className="text-sm font-medium leading-none text-cream-100">
                                        Pe preferido
                                    </label>
                                    <select
                                        id="preferredFoot"
                                        {...register("preferredFoot")}
                                        className="flex h-10 w-full rounded-md border border-navy-800 bg-navy-900 px-3 py-2 text-sm text-cream-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                                    >
                                        <option value="">Nao informado</option>
                                        <option value="DIREITO">Direito</option>
                                        <option value="ESQUERDO">Esquerdo</option>
                                        <option value="AMBIDESTRO">Ambidestro</option>
                                    </select>
                                </div>

                                <FormField
                                    id="birthDate"
                                    label="Data de nascimento"
                                    type="date"
                                    {...register("birthDate")}
                                    error={!!errors.birthDate}
                                    errorMessage={errors.birthDate?.message}
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-4 pt-4 border-t border-navy-800">
                            <Button type="button" variant="destructive" onClick={() => void handleDelete()} disabled={isDeleting}>
                                {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Excluir
                            </Button>
                            <Button type="button" variant="ghost" onClick={() => router.push("/jogadores")}>
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
        </div>
    );
}
