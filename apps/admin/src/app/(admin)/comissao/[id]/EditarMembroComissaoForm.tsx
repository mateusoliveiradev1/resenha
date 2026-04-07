"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { UpdateStaffSchema, type UpdateStaffInput } from "@resenha/validators";
import { Button, Card, CardContent, FormField } from "@resenha/ui";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { deleteStaffMember, updateStaffMember } from "../../../actions/staff";
import { RosterPhotoUploadField } from "@/components/roster/RosterPhotoUploadField";

interface StaffRecord {
    id: string;
    name: string;
    role: string;
    photoUrl: string | null;
    displayOrder: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export function EditarMembroComissaoForm({ member }: { member: StaffRecord }) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [isDeleting, setIsDeleting] = React.useState(false);
    const [photoUrlPreview, setPhotoUrlPreview] = React.useState(member.photoUrl ?? "");
    type UpdateStaffFormValues = z.input<typeof UpdateStaffSchema>;

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors }
    } = useForm<UpdateStaffFormValues, unknown, UpdateStaffInput>({
        resolver: zodResolver(UpdateStaffSchema),
        defaultValues: {
            name: member.name,
            role: member.role,
            photoUrl: member.photoUrl ?? "",
            displayOrder: member.displayOrder,
            isActive: member.isActive
        }
    });

    const onSubmit = async (data: UpdateStaffInput) => {
        setIsSubmitting(true);
        const result = await updateStaffMember(member.id, data);
        setIsSubmitting(false);

        if (result.success) {
            router.push("/comissao");
            router.refresh();
        } else {
            alert("Erro ao atualizar membro: " + result.error);
        }
    };

    const handleDelete = async () => {
        const shouldDelete = window.confirm(`Excluir ${member.name}? Essa acao remove o membro da pagina de diretoria.`);

        if (!shouldDelete) {
            return;
        }

        setIsDeleting(true);
        const result = await deleteStaffMember(member.id);
        setIsDeleting(false);

        if (!result.success) {
            alert("Erro ao excluir membro: " + result.error);
            return;
        }

        router.push("/comissao");
        router.refresh();
    };

    return (
        <div className="mx-auto max-w-4xl space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/comissao" className="rounded-full p-2 text-cream-300 transition-colors hover:bg-navy-800 hover:text-cream-100">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                    <h1 className="font-display text-2xl font-bold tracking-tight text-cream-100">
                        Editar Membro da Comissao
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
                                helperText="Troque a foto quando precisar. A nova imagem sera exibida na pagina de diretoria."
                                emptyTitle="Envie a foto do membro"
                            />
                        </div>

                        <div className="flex items-center justify-end gap-4 border-t border-navy-800 pt-4">
                            <Button type="button" variant="destructive" onClick={() => void handleDelete()} disabled={isDeleting}>
                                {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Excluir
                            </Button>
                            <Button type="button" variant="ghost" onClick={() => router.push("/comissao")}>
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
