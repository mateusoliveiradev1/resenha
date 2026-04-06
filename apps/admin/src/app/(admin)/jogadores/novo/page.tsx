"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CreatePlayerSchema, type CreatePlayerInput } from "@resenha/validators";
import { Button, FormField, Card, CardContent } from "@resenha/ui";
import { ArrowLeft, Save } from "lucide-react";
import { createPlayer } from "../../../actions/players";
import { RosterPhotoUploadField } from "@/components/roster/RosterPhotoUploadField";

export default function NovoJogadorPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    type CreatePlayerFormValues = z.input<typeof CreatePlayerSchema>;

    const { register, handleSubmit, setValue, formState: { errors } } = useForm<
        CreatePlayerFormValues,
        unknown,
        CreatePlayerInput
    >({
        resolver: zodResolver(CreatePlayerSchema),
        defaultValues: {
            isActive: true,
            goals: 0,
            assists: 0,
            photoUrl: "",
            birthDate: ""
        }
    });
    const [photoUrlPreview, setPhotoUrlPreview] = React.useState("");

    const onSubmit = async (data: CreatePlayerInput) => {
        setIsSubmitting(true);
        const result = await createPlayer(data);
        setIsSubmitting(false);

        if (result.success) {
            router.push("/jogadores");
            router.refresh();
        } else {
            alert("Error creating: " + result.error);
        }
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
                <Link href="/jogadores" className="text-cream-300 hover:text-cream-100 transition-colors p-2 rounded-full hover:bg-navy-800">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                    <h1 className="font-display text-2xl font-bold tracking-tight text-cream-100">
                        Adicionar Novo Jogador
                    </h1>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
                <Card className="bg-navy-900 border-navy-800">
                    <CardContent className="p-6 space-y-8">
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold uppercase tracking-wider text-blue-400 border-b border-navy-800 pb-2">Informacoes principais</h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <FormField
                                    id="name"
                                    label="Nome Completo"
                                    {...register("name")}
                                    error={!!errors.name}
                                    errorMessage={errors.name?.message}
                                />

                                <FormField
                                    id="nickname"
                                    label="Apelido (Nome na camisa)"
                                    {...register("nickname")}
                                    error={!!errors.nickname}
                                    errorMessage={errors.nickname?.message}
                                />

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
                                helperText="O sistema salva a imagem fora do banco e guarda apenas a URL no cadastro."
                            />
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold uppercase tracking-wider text-blue-400 border-b border-navy-800 pb-2">Atributos fisicos e estatisticas</h3>

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

                                <div className="sm:col-span-3">
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
                        </div>

                        <div className="flex items-center justify-end gap-4 pt-4 border-t border-navy-800">
                            <Button type="button" variant="ghost" onClick={() => router.push("/jogadores")}>
                                Cancelar
                            </Button>
                            <Button type="submit" variant="primary" disabled={isSubmitting}>
                                <Save className="mr-2 h-4 w-4" />
                                {isSubmitting ? "Salvando..." : "Salvar Jogador"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </div>
    );
}
