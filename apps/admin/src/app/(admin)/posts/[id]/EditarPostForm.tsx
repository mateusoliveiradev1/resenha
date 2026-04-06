"use client";

import * as React from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UpdatePostSchema, type UpdatePostInput } from "@resenha/validators";
import { Button, FormField, Card, CardContent } from "@resenha/ui";
import { ArrowLeft, Save, Send, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { deletePost, updatePost } from "@/actions/posts";
import { RosterPhotoUploadField } from "@/components/roster/RosterPhotoUploadField";

interface PostRecord {
    id: string;
    title: string;
    content: string;
    author: string;
    category: "NOTICIA" | "RESULTADO" | "CRONICA" | "BASTIDORES";
    coverImage?: string | null;
    matchId?: string | null;
    isPublished: boolean;
}

type SubmitMode = "draft" | "publish";

const normalizeOptionalValue = (value?: string | null) => {
    const trimmed = value?.trim();
    return trimmed ? trimmed : null;
};

export function EditarPostForm({ post }: { post: PostRecord }) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [isDeleting, setIsDeleting] = React.useState(false);
    const [pendingMode, setPendingMode] = React.useState<SubmitMode | null>(null);
    const [formFeedback, setFormFeedback] = React.useState<string | null>(null);

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors }
    } = useForm<UpdatePostInput>({
        resolver: zodResolver(UpdatePostSchema) as Resolver<UpdatePostInput>,
        defaultValues: {
            title: post.title,
            content: post.content,
            author: post.author,
            category: post.category,
            coverImage: post.coverImage ?? null,
            matchId: post.matchId ?? null,
            isPublished: post.isPublished
        }
    });

    const coverImage = watch("coverImage");
    const handleInvalidSubmit = () => {
        setFormFeedback("Revise os campos obrigatorios destacados antes de salvar o post.");
    };

    const submitPost = async (data: UpdatePostInput, mode: SubmitMode) => {
        setIsSubmitting(true);
        setPendingMode(mode);
        setFormFeedback(null);

        const result = await updatePost(post.id, {
            ...data,
            title: data.title?.trim(),
            content: data.content?.trim(),
            author: data.author?.trim(),
            coverImage: normalizeOptionalValue(data.coverImage),
            matchId: normalizeOptionalValue(data.matchId),
            isPublished: mode === "publish"
        });

        setIsSubmitting(false);
        setPendingMode(null);

        if (result.success) {
            router.push("/posts");
            router.refresh();
            return;
        }

        setFormFeedback(result.error ?? "Nao foi possivel atualizar o post.");
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        setFormFeedback(null);

        const result = await deletePost(post.id);

        setIsDeleting(false);

        if (result.success) {
            router.push("/posts");
            router.refresh();
            return;
        }

        setFormFeedback(result.error ?? "Nao foi possivel excluir o post.");
    };

    return (
        <div className="mx-auto max-w-4xl space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/posts" className="rounded-full p-2 text-cream-300 transition-colors hover:bg-navy-800 hover:text-cream-100">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="font-display text-2xl font-bold tracking-tight text-cream-100">Editar Post</h1>
                        <p className="mt-1 text-sm text-cream-300">Atualize conteudo, capa e status editorial do artigo.</p>
                    </div>
                </div>

                <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isDeleting || isSubmitting}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    {isDeleting ? "Excluindo..." : "Excluir"}
                </Button>
            </div>

            <form onSubmit={(event) => event.preventDefault()}>
                <input
                    type="hidden"
                    {...register("coverImage", {
                        setValueAs: (value) => normalizeOptionalValue(value)
                    })}
                />

                <Card className="border-navy-800 bg-navy-900">
                    <CardContent className="space-y-8 p-6">
                        <div className="space-y-4">
                            <h3 className="border-b border-navy-800 pb-2 text-sm font-semibold uppercase tracking-wider text-blue-400">
                                Informacoes editoriais
                            </h3>

                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div className="sm:col-span-2">
                                    <FormField
                                        id="title"
                                        label="Titulo do post"
                                        {...register("title")}
                                        error={!!errors.title}
                                        errorMessage={errors.title?.message}
                                    />
                                </div>

                                <FormField
                                    id="author"
                                    label="Autor"
                                    {...register("author")}
                                    error={!!errors.author}
                                    errorMessage={errors.author?.message}
                                />

                                <div className="space-y-2">
                                    <label htmlFor="category" className="text-sm font-medium leading-none text-cream-100">
                                        Categoria
                                    </label>
                                    <select
                                        id="category"
                                        {...register("category")}
                                        className="flex h-10 w-full rounded-md border border-navy-800 bg-navy-900 px-3 py-2 text-sm text-cream-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                                    >
                                        <option value="NOTICIA">Noticia</option>
                                        <option value="RESULTADO">Resultado</option>
                                        <option value="CRONICA">Cronica</option>
                                        <option value="BASTIDORES">Bastidores</option>
                                    </select>
                                    {errors.category?.message && <p className="text-[0.8rem] font-medium text-red-500">{errors.category.message}</p>}
                                </div>

                                <div className="sm:col-span-2">
                                    <FormField
                                        id="matchId"
                                        label="Partida vinculada (opcional)"
                                        placeholder="Cole o ID da partida se quiser manter o relacionamento"
                                        {...register("matchId", {
                                            setValueAs: (value) => normalizeOptionalValue(value)
                                        })}
                                        error={!!errors.matchId}
                                        errorMessage={errors.matchId?.message}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="border-b border-navy-800 pb-2 text-sm font-semibold uppercase tracking-wider text-blue-400">
                                Imagem de capa
                            </h3>

                            <RosterPhotoUploadField
                                label="Capa do post"
                                value={coverImage}
                                onChange={(value) => setValue("coverImage", value, { shouldDirty: true, shouldValidate: true })}
                                entity="posts"
                                errorMessage={errors.coverImage?.message}
                                helperText="Pode trocar sem se preocupar com medida exata. O painel ajusta a capa para 1600x900 e comprime automaticamente."
                                emptyTitle="Envie a imagem de capa do post"
                                emptyDescription="A capa e recortada automaticamente para o formato 16:9 do blog."
                                successMessage="Capa atualizada com sucesso."
                                previewLabel="Capa pronta para salvar."
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="content" className="text-sm font-medium leading-none text-cream-100">
                                Conteudo
                            </label>
                            <textarea
                                id="content"
                                rows={14}
                                {...register("content")}
                                className="w-full rounded-md border border-navy-800 bg-navy-950 p-4 text-sm text-cream-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                            />
                            {errors.content?.message && <p className="text-[0.8rem] font-medium text-red-500">{errors.content.message}</p>}
                        </div>

                        {formFeedback && (
                            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                                {formFeedback}
                            </div>
                        )}

                        <div className="flex flex-col gap-3 border-t border-navy-800 pt-4 sm:flex-row sm:justify-end">
                            <Button
                                type="button"
                                variant="outline"
                                className="border-navy-700 bg-transparent text-cream-300 hover:bg-navy-800"
                                disabled={isSubmitting || isDeleting}
                                onClick={handleSubmit((data) => submitPost(data, "draft"), handleInvalidSubmit)}
                            >
                                <Save className="mr-2 h-4 w-4" />
                                {isSubmitting && pendingMode === "draft" ? "Salvando..." : "Salvar como rascunho"}
                            </Button>
                            <Button
                                type="button"
                                variant="primary"
                                className="shadow-[0_0_24px_rgba(37,99,235,0.22)]"
                                disabled={isSubmitting || isDeleting}
                                onClick={handleSubmit((data) => submitPost(data, "publish"), handleInvalidSubmit)}
                            >
                                <Send className="mr-2 h-4 w-4" />
                                {isSubmitting && pendingMode === "publish" ? "Publicando..." : "Salvar e publicar"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </div>
    );
}
