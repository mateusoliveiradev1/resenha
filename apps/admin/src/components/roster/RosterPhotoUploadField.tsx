"use client";

import * as React from "react";
import Image from "next/image";
import { Button, cn } from "@resenha/ui";
import { Loader2, Trash2, UploadCloud } from "lucide-react";
import { uploadRosterPhoto, type RosterPhotoEntity } from "@/lib/rosterPhotoUpload";

interface RosterPhotoUploadFieldProps {
    label: string;
    value?: string | null;
    onChange: (value: string | null) => void;
    entity?: RosterPhotoEntity;
    errorMessage?: string;
    helperText?: string;
    emptyTitle?: string;
    emptyDescription?: string;
    successMessage?: string;
    previewLabel?: string;
}

export function RosterPhotoUploadField({
    label,
    value,
    onChange,
    entity = "players",
    errorMessage,
    helperText,
    emptyTitle,
    emptyDescription,
    successMessage,
    previewLabel
}: RosterPhotoUploadFieldProps) {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = React.useState(false);
    const [feedback, setFeedback] = React.useState<string | null>(null);
    const [uploadError, setUploadError] = React.useState<string | null>(null);

    const previewUrl = value?.trim() ? value : null;
    const isUploadedPhoto = previewUrl?.startsWith("/uploads/") ?? false;

    const openFilePicker = () => inputRef.current?.click();

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        setIsUploading(true);
        setFeedback(null);
        setUploadError(null);

        try {
            const uploadedUrl = await uploadRosterPhoto(file, entity);
            onChange(uploadedUrl);
            setFeedback(successMessage ?? "Imagem enviada com sucesso.");
        } catch (error) {
            setUploadError(error instanceof Error ? error.message : "Nao foi possivel enviar a foto.");
        } finally {
            setIsUploading(false);
            event.target.value = "";
        }
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
                <label className="text-sm font-medium text-cream-100">{label}</label>
                {previewUrl && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => onChange(null)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remover
                    </Button>
                )}
            </div>

            <input
                ref={inputRef}
                type="file"
                accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={handleFileChange}
            />

            <div
                className={cn(
                    "overflow-hidden rounded-2xl border border-dashed bg-navy-950/70",
                    errorMessage || uploadError ? "border-red-500/60" : "border-navy-700"
                )}
            >
                {previewUrl ? (
                    <div className="relative aspect-[16/9] w-full">
                        <Image
                            src={previewUrl}
                            alt="Preview da foto"
                            fill
                            unoptimized={isUploadedPhoto}
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 640px"
                        />
                        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-navy-950 via-navy-950/80 to-transparent p-4">
                            <p className="text-xs font-medium text-cream-100">{previewLabel ?? "Preview pronta para salvar."}</p>
                            <Button type="button" variant="secondary" size="sm" onClick={openFilePicker} disabled={isUploading}>
                                {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
                                Trocar foto
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="flex aspect-[16/9] w-full flex-col items-center justify-center gap-4 px-6 py-10 text-center">
                        <div className="rounded-full border border-navy-700 bg-navy-900 p-4">
                            {isUploading ? (
                                <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
                            ) : (
                                <UploadCloud className="h-6 w-6 text-blue-400" />
                            )}
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-semibold text-cream-100">
                                {isUploading ? "Enviando imagem..." : emptyTitle ?? "Envie uma foto do elenco"}
                            </p>
                            <p className="text-xs text-cream-300">{emptyDescription ?? "PNG, JPG ou WEBP com ate 3 MB."}</p>
                        </div>
                        <Button type="button" variant="secondary" onClick={openFilePicker} disabled={isUploading}>
                            {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
                            Selecionar imagem
                        </Button>
                    </div>
                )}
            </div>

            {errorMessage && <p className="text-[0.8rem] font-medium text-red-500">{errorMessage}</p>}
            {!errorMessage && uploadError && <p className="text-[0.8rem] font-medium text-red-500">{uploadError}</p>}
            {!errorMessage && !uploadError && feedback && <p className="text-[0.8rem] font-medium text-green-400">{feedback}</p>}
            {!errorMessage && !uploadError && !feedback && helperText && (
                <p className="text-[0.8rem] text-cream-300">{helperText}</p>
            )}
        </div>
    );
}
