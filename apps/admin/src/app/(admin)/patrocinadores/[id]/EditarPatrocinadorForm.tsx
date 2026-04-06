"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    UpdateSponsorSchema,
    sponsorTierValues,
    type UpdateSponsorInput,
    type SponsorTier
} from "@resenha/validators";
import { Button, FormField, Card, CardContent } from "@resenha/ui";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { deleteSponsor, updateSponsor } from "../../../actions/sponsors";
import { RosterPhotoUploadField } from "@/components/roster/RosterPhotoUploadField";

interface SponsorRecord {
    id: string;
    name: string;
    logoUrl: string | null;
    websiteUrl: string | null;
    description: string | null;
    tier: SponsorTier;
    displayOrder: number;
    featuredOnHome: boolean;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const tierLabels: Record<SponsorTier, string> = {
    MASTER: "Master",
    OURO: "Ouro",
    PRATA: "Prata",
    APOIO: "Apoio"
};

export function EditarPatrocinadorForm({ sponsor }: { sponsor: SponsorRecord }) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [isDeleting, setIsDeleting] = React.useState(false);
    const [logoPreview, setLogoPreview] = React.useState(sponsor.logoUrl ?? "");
    type UpdateSponsorFormValues = z.input<typeof UpdateSponsorSchema>;

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors }
    } = useForm<UpdateSponsorFormValues, unknown, UpdateSponsorInput>({
        resolver: zodResolver(UpdateSponsorSchema),
        defaultValues: {
            name: sponsor.name,
            logoUrl: sponsor.logoUrl ?? "",
            websiteUrl: sponsor.websiteUrl ?? "",
            description: sponsor.description ?? "",
            tier: sponsor.tier,
            displayOrder: sponsor.displayOrder,
            featuredOnHome: sponsor.featuredOnHome,
            isActive: sponsor.isActive
        }
    });

    const onSubmit = async (data: UpdateSponsorInput) => {
        setIsSubmitting(true);
        const result = await updateSponsor(sponsor.id, data);
        setIsSubmitting(false);

        if (result.success) {
            router.push("/patrocinadores");
            router.refresh();
        } else {
            alert("Erro ao atualizar patrocinador: " + result.error);
        }
    };

    const handleDelete = async () => {
        const shouldDelete = window.confirm(`Excluir ${sponsor.name}? Essa acao remove a marca do site.`);

        if (!shouldDelete) {
            return;
        }

        setIsDeleting(true);
        const result = await deleteSponsor(sponsor.id);
        setIsDeleting(false);

        if (!result.success) {
            alert("Erro ao excluir patrocinador: " + result.error);
            return;
        }

        router.push("/patrocinadores");
        router.refresh();
    };

    return (
        <div className="mx-auto max-w-4xl space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/patrocinadores" className="rounded-full p-2 text-cream-300 transition-colors hover:bg-navy-800 hover:text-cream-100">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                    <h1 className="font-display text-2xl font-bold tracking-tight text-cream-100">
                        Editar Patrocinador
                    </h1>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
                <Card className="border-navy-800 bg-navy-900">
                    <CardContent className="space-y-8 p-6">
                        <div className="space-y-4">
                            <h3 className="border-b border-navy-800 pb-2 text-sm font-semibold uppercase tracking-wider text-blue-400">
                                Marca e visibilidade
                            </h3>

                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <FormField
                                    id="name"
                                    label="Nome da marca"
                                    {...register("name")}
                                    error={!!errors.name}
                                    errorMessage={errors.name?.message}
                                />

                                <div className="space-y-2">
                                    <label htmlFor="tier" className="text-sm font-medium leading-none text-cream-100">
                                        Tier
                                    </label>
                                    <select
                                        id="tier"
                                        {...register("tier")}
                                        className="flex h-10 w-full rounded-md border border-navy-800 bg-navy-900 px-3 py-2 text-sm text-cream-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                                    >
                                        {sponsorTierValues.map((tier) => (
                                            <option key={tier} value={tier}>
                                                {tierLabels[tier]}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.tier && <p className="text-[0.8rem] font-medium text-red-500">{errors.tier.message}</p>}
                                </div>

                                <FormField
                                    id="websiteUrl"
                                    label="Site oficial"
                                    placeholder="https://"
                                    {...register("websiteUrl")}
                                    error={!!errors.websiteUrl}
                                    errorMessage={errors.websiteUrl?.message}
                                />

                                <FormField
                                    id="displayOrder"
                                    label="Ordem de exibicao"
                                    type="number"
                                    {...register("displayOrder", { valueAsNumber: true })}
                                    error={!!errors.displayOrder}
                                    errorMessage={errors.displayOrder?.message}
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="border-b border-navy-800 pb-2 text-sm font-semibold uppercase tracking-wider text-blue-400">
                                Logo
                            </h3>
                            <input type="hidden" {...register("logoUrl")} />
                            <RosterPhotoUploadField
                                label="Logo do patrocinador"
                                value={logoPreview}
                                onChange={(nextValue) => {
                                    const normalizedValue = nextValue ?? "";
                                    setLogoPreview(normalizedValue);
                                    setValue("logoUrl", normalizedValue, { shouldDirty: true, shouldValidate: true });
                                }}
                                entity="sponsors"
                                errorMessage={errors.logoUrl?.message}
                                helperText="A logo ativa no cadastro tambem aparece no destaque da home, se habilitado."
                            />
                        </div>

                        <div className="space-y-4">
                            <h3 className="border-b border-navy-800 pb-2 text-sm font-semibold uppercase tracking-wider text-blue-400">
                                Mensagem institucional
                            </h3>

                            <div className="space-y-2">
                                <label htmlFor="description" className="text-sm font-medium leading-none text-cream-100">
                                    Descricao
                                </label>
                                <textarea
                                    id="description"
                                    rows={4}
                                    {...register("description")}
                                    className="w-full rounded-md border border-navy-800 bg-navy-950 px-3 py-3 text-sm text-cream-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                                    placeholder="Como essa parceria fortalece o clube."
                                />
                                {errors.description && <p className="text-[0.8rem] font-medium text-red-500">{errors.description.message}</p>}
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <label className="flex items-center gap-2 rounded-2xl border border-navy-800 bg-navy-950/70 px-4 py-3 text-sm text-cream-100">
                                    <input type="checkbox" {...register("featuredOnHome")} className="h-4 w-4 rounded border-navy-700 bg-navy-950 text-blue-500 focus:ring-blue-500" />
                                    Mostrar na home publica
                                </label>
                                <label className="flex items-center gap-2 rounded-2xl border border-navy-800 bg-navy-950/70 px-4 py-3 text-sm text-cream-100">
                                    <input type="checkbox" {...register("isActive")} className="h-4 w-4 rounded border-navy-700 bg-navy-950 text-blue-500 focus:ring-blue-500" />
                                    Patrocinador ativo
                                </label>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-4 border-t border-navy-800 pt-4">
                            <Button type="button" variant="destructive" onClick={() => void handleDelete()} disabled={isDeleting}>
                                {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Excluir
                            </Button>
                            <Button type="button" variant="ghost" onClick={() => router.push("/patrocinadores")}>
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
