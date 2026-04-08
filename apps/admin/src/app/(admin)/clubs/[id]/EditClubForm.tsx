"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Card, CardContent, FormField } from "@resenha/ui";
import { UpdateClubSchema, type UpdateClubInput } from "@resenha/validators";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { deleteClub, updateClub } from "@/actions/clubs";
import { RosterPhotoUploadField } from "@/components/roster/RosterPhotoUploadField";

interface ClubRecord {
    id: string;
    name: string;
    shortName: string;
    slug: string;
    logoUrl: string | null;
    city: string | null;
    isResenha: boolean;
    isActive: boolean;
}

export function EditClubForm({ club }: { club: ClubRecord }) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [isDeleting, setIsDeleting] = React.useState(false);
    type ClubFormValues = z.input<typeof UpdateClubSchema>;

    const { register, handleSubmit, setValue, formState: { errors } } = useForm<ClubFormValues, unknown, UpdateClubInput>({
        resolver: zodResolver(UpdateClubSchema),
        defaultValues: {
            name: club.name,
            shortName: club.shortName,
            slug: club.slug,
            logoUrl: club.logoUrl ?? "",
            city: club.city ?? "",
            isResenha: club.isResenha,
            isActive: club.isActive,
        },
    });
    const [logoPreview, setLogoPreview] = React.useState(club.logoUrl ?? "");

    const onSubmit = async (data: UpdateClubInput) => {
        setIsSubmitting(true);
        const result = await updateClub(club.id, data);
        setIsSubmitting(false);

        if (result.success) {
            router.push("/clubs");
            router.refresh();
            return;
        }

        alert(result.error ?? "Nao foi possivel atualizar o clube.");
    };

    const handleDelete = async () => {
        const shouldDelete = window.confirm(`Excluir ${club.name}? Essa acao remove o clube da base.`);

        if (!shouldDelete) {
            return;
        }

        setIsDeleting(true);
        const result = await deleteClub(club.id);
        setIsDeleting(false);

        if (!result.success) {
            alert(result.error ?? "Nao foi possivel excluir o clube.");
            return;
        }

        router.push("/clubs");
        router.refresh();
    };

    return (
        <div className="mx-auto max-w-4xl space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/clubs" className="rounded-full p-2 text-cream-300 transition-colors hover:bg-navy-800 hover:text-cream-100">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                    <h1 className="font-display text-2xl font-bold tracking-tight text-cream-100">Editar Clube</h1>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
                <Card className="border-navy-800 bg-navy-900">
                    <CardContent className="space-y-8 p-6">
                        <div className="space-y-4">
                            <h3 className="border-b border-navy-800 pb-2 text-sm font-semibold uppercase tracking-wider text-blue-400">
                                Identidade do clube
                            </h3>

                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <FormField id="name" label="Nome oficial" {...register("name")} error={!!errors.name} errorMessage={errors.name?.message} />
                                <FormField id="shortName" label="Nome curto" {...register("shortName")} error={!!errors.shortName} errorMessage={errors.shortName?.message} />
                                <FormField id="slug" label="Slug" {...register("slug")} error={!!errors.slug} errorMessage={errors.slug?.message} />
                                <FormField id="city" label="Cidade" {...register("city")} error={!!errors.city} errorMessage={errors.city?.message} />
                            </div>

                            <div className="space-y-2">
                                <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-cream-100">
                                    <input type="checkbox" {...register("isResenha")} className="h-4 w-4 rounded border-navy-700 bg-navy-950 text-blue-500 focus:ring-blue-500 focus:ring-offset-navy-900" />
                                    Este e o clube oficial do Resenha RFC
                                </label>

                                <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-cream-100">
                                    <input type="checkbox" {...register("isActive")} className="h-4 w-4 rounded border-navy-700 bg-navy-950 text-blue-500 focus:ring-blue-500 focus:ring-offset-navy-900" />
                                    Clube ativo para selecao
                                </label>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="border-b border-navy-800 pb-2 text-sm font-semibold uppercase tracking-wider text-blue-400">
                                Escudo / logo
                            </h3>

                            <input type="hidden" {...register("logoUrl")} />
                            <RosterPhotoUploadField
                                label="Escudo do clube"
                                value={logoPreview}
                                entity="clubs"
                                onChange={(nextValue) => {
                                    const normalizedValue = nextValue ?? "";
                                    setLogoPreview(normalizedValue);
                                    setValue("logoUrl", normalizedValue, { shouldDirty: true, shouldValidate: true });
                                }}
                                errorMessage={errors.logoUrl?.message}
                                helperText="Atualize o escudo quando precisar. Os jogos e campeonatos passam a reaproveitar a nova arte."
                                emptyTitle="Envie o escudo do clube"
                                previewLabel="Logo pronta para uso."
                            />
                        </div>

                        <div className="flex items-center justify-end gap-4 border-t border-navy-800 pt-4">
                            <Button type="button" variant="destructive" onClick={() => void handleDelete()} disabled={isDeleting}>
                                {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Excluir
                            </Button>
                            <Button type="button" variant="ghost" onClick={() => router.push("/clubs")}>
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
