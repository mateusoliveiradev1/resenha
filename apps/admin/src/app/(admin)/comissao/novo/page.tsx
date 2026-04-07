"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CreateStaffSchema, type CreateStaffInput } from "@resenha/validators";
import { Button, Card, CardContent, FormField } from "@resenha/ui";
import { ArrowLeft, Save } from "lucide-react";
import { createStaffMember } from "../../../actions/staff";
import { RosterPhotoUploadField } from "@/components/roster/RosterPhotoUploadField";

export default function NovoMembroComissaoPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [photoUrlPreview, setPhotoUrlPreview] = React.useState("");
    type CreateStaffFormValues = z.input<typeof CreateStaffSchema>;

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors }
    } = useForm<CreateStaffFormValues, unknown, CreateStaffInput>({
        resolver: zodResolver(CreateStaffSchema),
        defaultValues: {
            displayOrder: 0,
            isActive: true,
            photoUrl: ""
        }
    });

    const onSubmit = async (data: CreateStaffInput) => {
        setIsSubmitting(true);
        const result = await createStaffMember(data);
        setIsSubmitting(false);

        if (result.success) {
            router.push("/comissao");
            router.refresh();
        } else {
            alert("Erro ao criar membro: " + result.error);
        }
    };

    return (
        <div className="mx-auto max-w-4xl space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/comissao" className="rounded-full p-2 text-cream-300 transition-colors hover:bg-navy-800 hover:text-cream-100">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                    <h1 className="font-display text-2xl font-bold tracking-tight text-cream-100">
                        Novo Membro da Comissao
                    </h1>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
                <Card className="border-navy-800 bg-navy-900">
                    <CardContent className="space-y-8 p-6">
                        <div className="space-y-4">
                            <h3 className="border-b border-navy-800 pb-2 text-sm font-semibold uppercase tracking-wider text-blue-400">
                                Identificacao
                            </h3>

                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <FormField
                                    id="name"
                                    label="Nome completo"
                                    {...register("name")}
                                    error={!!errors.name}
                                    errorMessage={errors.name?.message}
                                />

                                <FormField
                                    id="role"
                                    label="Cargo"
                                    placeholder="Ex.: Diretoria, Tecnico, Auxiliar"
                                    {...register("role")}
                                    error={!!errors.role}
                                    errorMessage={errors.role?.message}
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

                            <label className="flex items-center gap-2 rounded-2xl border border-navy-800 bg-navy-950/70 px-4 py-3 text-sm text-cream-100">
                                <input type="checkbox" {...register("isActive")} className="h-4 w-4 rounded border-navy-700 bg-navy-950 text-blue-500 focus:ring-blue-500" />
                                Membro ativo na pagina publica
                            </label>
                        </div>

                        <div className="space-y-4">
                            <h3 className="border-b border-navy-800 pb-2 text-sm font-semibold uppercase tracking-wider text-blue-400">
                                Foto
                            </h3>
                            <input type="hidden" {...register("photoUrl")} />
                            <RosterPhotoUploadField
                                label="Foto do membro"
                                value={photoUrlPreview}
                                onChange={(nextValue) => {
                                    const normalizedValue = nextValue ?? "";
                                    setPhotoUrlPreview(normalizedValue);
                                    setValue("photoUrl", normalizedValue, { shouldDirty: true, shouldValidate: true });
                                }}
                                entity="staff"
                                errorMessage={errors.photoUrl?.message}
                                helperText="A imagem cadastrada aparece diretamente na pagina de diretoria."
                                emptyTitle="Envie a foto do membro"
                            />
                        </div>

                        <div className="flex items-center justify-end gap-4 border-t border-navy-800 pt-4">
                            <Button type="button" variant="ghost" onClick={() => router.push("/comissao")}>
                                Cancelar
                            </Button>
                            <Button type="submit" variant="primary" disabled={isSubmitting}>
                                <Save className="mr-2 h-4 w-4" />
                                {isSubmitting ? "Salvando..." : "Salvar Membro"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </div>
    );
}
