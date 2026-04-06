"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button, Card, CardContent } from "@resenha/ui";
import { ImagePlus, Loader2, Trash2, UploadCloud, X } from "lucide-react";
import { createGalleryPhotos, deletePhoto } from "@/actions/gallery";
import { uploadRosterPhoto } from "@/lib/rosterPhotoUpload";

type AdminGalleryPhoto = {
    id: string;
    url: string;
    caption: string;
    uploadedAt: Date;
};

type SelectedGalleryUpload = {
    id: string;
    file: File;
    previewUrl: string;
};

type FeedbackTone = "info" | "success" | "error";

const deriveCaptionFromFileName = (fileName: string) => {
    const withoutExtension = fileName.replace(/\.[^.]+$/, "");
    return withoutExtension.replace(/[-_]+/g, " ").trim() || "Registro Resenha RFC";
};

const formatFileSize = (sizeInBytes: number) => {
    if (sizeInBytes < 1024 * 1024) {
        return `${Math.max(1, Math.round(sizeInBytes / 1024))} KB`;
    }

    return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
};

const buildSelectedUploads = (files: File[]) =>
    files.map((file, index) => ({
        id: `${file.name}-${file.size}-${file.lastModified}-${index}`,
        file,
        previewUrl: URL.createObjectURL(file)
    }));

const releaseSelectedUploads = (uploads: SelectedGalleryUpload[]) => {
    uploads.forEach((upload) => URL.revokeObjectURL(upload.previewUrl));
};

export function GaleriaAdminManager({ photos }: { photos: AdminGalleryPhoto[] }) {
    const router = useRouter();
    const inputRef = React.useRef<HTMLInputElement>(null);
    const [selectedUploads, setSelectedUploads] = React.useState<SelectedGalleryUpload[]>([]);
    const [captionBase, setCaptionBase] = React.useState("");
    const [isUploading, setIsUploading] = React.useState(false);
    const [deletingId, setDeletingId] = React.useState<string | null>(null);
    const [feedback, setFeedback] = React.useState<{ message: string; tone: FeedbackTone } | null>(null);

    React.useEffect(() => {
        return () => {
            releaseSelectedUploads(selectedUploads);
        };
    }, [selectedUploads]);

    const openFilePicker = () => inputRef.current?.click();

    const clearSelectedUploads = () => {
        setSelectedUploads((currentUploads) => {
            releaseSelectedUploads(currentUploads);
            return [];
        });
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files ?? []);
        event.target.value = "";

        if (files.length === 0) {
            return;
        }

        setSelectedUploads((currentUploads) => {
            releaseSelectedUploads(currentUploads);
            return buildSelectedUploads(files);
        });
        setFeedback({
            tone: "info",
            message:
                files.length === 1
                    ? "Imagem selecionada. Confira o preview e clique em Publicar na galeria."
                    : `${files.length} imagens selecionadas. Confira os previews e clique em Publicar na galeria.`
        });
    };

    const handleUpload = async () => {
        if (selectedUploads.length === 0) {
            setFeedback({
                tone: "error",
                message: "Selecione pelo menos uma imagem antes de enviar."
            });
            return;
        }

        setIsUploading(true);
        setFeedback({
            tone: "info",
            message:
                selectedUploads.length === 1
                    ? "Enviando imagem..."
                    : `Enviando ${selectedUploads.length} imagens...`
        });

        try {
            const uploadedEntries: Array<{ url: string; caption: string }> = [];

            for (let index = 0; index < selectedUploads.length; index += 1) {
                const { file } = selectedUploads[index];
                setFeedback({
                    tone: "info",
                    message:
                        selectedUploads.length === 1
                            ? "Enviando imagem..."
                            : `Enviando imagem ${index + 1} de ${selectedUploads.length}...`
                });
                const uploadedUrl = await uploadRosterPhoto(file, "gallery");
                const normalizedCaption = captionBase.trim()
                    ? selectedUploads.length > 1
                        ? `${captionBase.trim()} ${index + 1}`
                        : captionBase.trim()
                    : deriveCaptionFromFileName(file.name);

                uploadedEntries.push({
                    url: uploadedUrl,
                    caption: normalizedCaption
                });
            }

            const result = await createGalleryPhotos(uploadedEntries);

            if (!result.success) {
                throw new Error(result.error ?? "Nao foi possivel salvar as imagens da galeria.");
            }

            clearSelectedUploads();
            setCaptionBase("");
            setFeedback({
                tone: "success",
                message: "Galeria atualizada com sucesso."
            });
            router.refresh();
        } catch (error) {
            setFeedback({
                tone: "error",
                message: error instanceof Error ? error.message : "Nao foi possivel concluir o upload."
            });
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async (id: string) => {
        setDeletingId(id);
        setFeedback(null);

        const result = await deletePhoto(id);

        setDeletingId(null);

        if (!result.success) {
            setFeedback({
                tone: "error",
                message: result.error ?? "Nao foi possivel excluir a imagem."
            });
            return;
        }

        setFeedback({
            tone: "success",
            message: "Imagem excluida com sucesso."
        });
        router.refresh();
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="font-display text-3xl font-bold tracking-tight text-cream-100">Galeria de Fotos</h1>
                <p className="mt-2 text-sm text-cream-300">Envie imagens reais do clube e publique direto na galeria do site.</p>
            </div>

            <Card className="border-navy-800 bg-navy-900">
                <CardContent className="space-y-6 p-6">
                    <input
                        ref={inputRef}
                        type="file"
                        multiple
                        accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
                        className="hidden"
                        onChange={handleFileChange}
                    />

                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-blue-400">Upload de imagens</h3>

                        <div className="rounded-2xl border-2 border-dashed border-navy-700 bg-navy-950/50 px-6 py-8 text-center">
                            <div className="mx-auto flex max-w-xl flex-col items-center gap-4">
                                <div className="rounded-full border border-navy-700 bg-navy-900 p-4">
                                    <ImagePlus className="h-8 w-8 text-blue-400" />
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm font-semibold text-cream-100">Escolha uma ou mais imagens da galeria</p>
                                    <p className="text-xs text-cream-300">
                                        Pode enviar em qualquer tamanho razoavel. O painel otimiza e comprime automaticamente para a web.
                                    </p>
                                </div>
                                <Button type="button" variant="secondary" onClick={openFilePicker} disabled={isUploading}>
                                    {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
                                    {selectedUploads.length > 0 ? "Trocar imagens" : "Selecionar imagens"}
                                </Button>
                            </div>
                        </div>

                        <div className="grid gap-4 lg:grid-cols-[1fr_auto_auto] lg:items-end">
                            <div className="space-y-2">
                                <label htmlFor="captionBase" className="text-sm font-medium text-cream-100">
                                    Legenda base (opcional)
                                </label>
                                <input
                                    id="captionBase"
                                    value={captionBase}
                                    onChange={(event) => setCaptionBase(event.target.value)}
                                    placeholder="Ex.: Final do torneio"
                                    className="flex h-11 w-full rounded-md border border-navy-800 bg-navy-950 px-3 py-2 text-sm text-cream-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                                />
                                <p className="text-[0.8rem] text-cream-300">
                                    Se voce enviar varias imagens com legenda base, o sistema numera automaticamente.
                                </p>
                            </div>

                            <Button type="button" onClick={openFilePicker} variant="secondary" className="h-11 lg:min-w-44" disabled={isUploading}>
                                <ImagePlus className="mr-2 h-4 w-4" />
                                Selecionar
                            </Button>

                            <Button type="button" onClick={handleUpload} variant="primary" className="h-11 lg:min-w-52" disabled={isUploading || selectedUploads.length === 0}>
                                {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
                                {isUploading ? "Enviando..." : "Publicar na galeria"}
                            </Button>
                        </div>
                    </div>

                    {selectedUploads.length > 0 && (
                        <div className="rounded-xl border border-navy-800 bg-navy-950 p-4">
                            <div className="mb-4 flex items-center justify-between gap-3">
                                <span className="text-sm font-medium text-cream-100">
                                    {selectedUploads.length} arquivo(s) pronto(s) para publicar
                                </span>
                                <Button type="button" variant="ghost" size="sm" onClick={clearSelectedUploads}>
                                    <X className="mr-2 h-4 w-4" />
                                    Limpar
                                </Button>
                            </div>
                            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                                {selectedUploads.map((upload) => (
                                    <div key={upload.id} className="overflow-hidden rounded-xl border border-navy-800 bg-navy-900/80">
                                        <div className="relative aspect-[4/3] w-full bg-navy-950">
                                            <Image
                                                src={upload.previewUrl}
                                                alt={upload.file.name}
                                                fill
                                                unoptimized
                                                sizes="(max-width: 768px) 100vw, 33vw"
                                                className="object-cover"
                                            />
                                        </div>
                                        <div className="space-y-1 px-3 py-3">
                                            <p className="line-clamp-1 text-sm font-medium text-cream-100">{upload.file.name}</p>
                                            <p className="text-xs text-cream-300">{formatFileSize(upload.file.size)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {feedback && (
                        <div
                            className={
                                feedback.tone === "error"
                                    ? "rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-100"
                                    : feedback.tone === "success"
                                        ? "rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-100"
                                        : "rounded-xl border border-navy-800 bg-navy-950 px-4 py-3 text-sm text-cream-200"
                            }
                        >
                            {feedback.message}
                        </div>
                    )}
                </CardContent>
            </Card>

            <div>
                <h3 className="mb-4 font-semibold text-cream-100">Fotos publicadas ({photos.length})</h3>

                {photos.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                        {photos.map((photo) => (
                            <div key={photo.id} className="group overflow-hidden rounded-xl border border-navy-800 bg-navy-950">
                                <div className="relative aspect-square">
                                    <Image
                                        src={photo.url}
                                        alt={photo.caption}
                                        fill
                                        sizes="(max-width: 768px) 50vw, 25vw"
                                        unoptimized={photo.url.startsWith("/uploads/")}
                                        className="object-cover"
                                    />
                                </div>

                                <div className="space-y-3 p-4">
                                    <div>
                                        <p className="line-clamp-2 text-sm font-medium text-cream-100">{photo.caption}</p>
                                        <p className="mt-1 text-xs text-cream-300">
                                            {photo.uploadedAt.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })}
                                        </p>
                                    </div>

                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        className="w-full"
                                        disabled={deletingId === photo.id}
                                        onClick={() => handleDelete(photo.id)}
                                    >
                                        {deletingId === photo.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                                        {deletingId === photo.id ? "Excluindo..." : "Excluir"}
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-3xl border border-dashed border-navy-800 bg-navy-900/20 px-6 py-16 text-center">
                        <h2 className="font-display text-2xl font-bold text-cream-100">Nenhuma foto publicada</h2>
                        <p className="mt-3 text-sm text-cream-300">As imagens enviadas por aqui passam a aparecer automaticamente na galeria publica.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
