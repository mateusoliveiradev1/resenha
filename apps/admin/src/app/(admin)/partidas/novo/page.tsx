"use client";

import * as React from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateMatchSchema, type CreateMatchInput } from "@resenha/validators";
import { Button, FormField, Card, CardContent, shouldBypassNextImageOptimization } from "@resenha/ui";
import { ArrowLeft, Save, UploadCloud } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createMatch } from "@/actions/matches";
import { uploadOpponentLogo } from "@/lib/opponentLogoUpload";

const getErrorMessage = (error: unknown, fallbackMessage: string) => {
    if (error instanceof Error && error.message) {
        return error.message;
    }

    return fallbackMessage;
};

export default function NovaPartidaPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [isUploadingLogo, setIsUploadingLogo] = React.useState(false);
    const [uploadedLogoUrl, setUploadedLogoUrl] = React.useState<string | null>(null);
    const [logoPreviewUrl, setLogoPreviewUrl] = React.useState<string | null>(null);
    const [logoFeedback, setLogoFeedback] = React.useState<string | null>(null);
    const [formFeedback, setFormFeedback] = React.useState<string | null>(null);

    const { register, handleSubmit, formState: { errors } } = useForm<CreateMatchInput>({
        resolver: zodResolver(CreateMatchSchema) as Resolver<CreateMatchInput>,
        defaultValues: {
            status: "SCHEDULED",
            type: "FUTSAL",
            season: ""
        }
    });

    const handleLogoSelection = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        if (!file) {
            setUploadedLogoUrl(null);
            setLogoPreviewUrl(null);
            setLogoFeedback(null);
            return;
        }

        setIsUploadingLogo(true);
        setLogoFeedback("Enviando escudo...");
        setFormFeedback(null);

        try {
            const uploadedUrl = await uploadOpponentLogo(file);
            setUploadedLogoUrl(uploadedUrl);
            setLogoPreviewUrl(uploadedUrl);
            setLogoFeedback("Escudo enviado com sucesso. Ele sera vinculado automaticamente a partida.");
        } catch (error: unknown) {
            setUploadedLogoUrl(null);
            setLogoPreviewUrl(null);
            setLogoFeedback(getErrorMessage(error, "Nao foi possivel enviar o escudo agora."));
        } finally {
            setIsUploadingLogo(false);
            event.target.value = "";
        }
    };

    const clearUploadedLogo = () => {
        setUploadedLogoUrl(null);
        setLogoPreviewUrl(null);
        setLogoFeedback("Escudo removido. A partida sera salva sem logo do adversario.");
    };

    const onSubmit = async (data: CreateMatchInput) => {
        setIsSubmitting(true);
        setFormFeedback(null);

        const result = await createMatch({
            ...data,
            date: new Date(data.date).toISOString(),
            opponentLogo: uploadedLogoUrl
        });

        setIsSubmitting(false);

        if (result.success) {
            router.push("/partidas");
            router.refresh();
            return;
        }

        setFormFeedback(result.error ?? "Nao foi possivel criar a partida.");
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
                <Link href="/partidas" className="text-cream-300 hover:text-cream-100 transition-colors p-2 rounded-full hover:bg-navy-800">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                    <h1 className="font-display text-2xl font-bold tracking-tight text-cream-100">
                        Nova Partida
                    </h1>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
                <Card className="bg-navy-900 border-navy-800">
                    <CardContent className="p-6 space-y-8">
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold uppercase tracking-wider text-blue-400 border-b border-navy-800 pb-2">Oposicao, local e campeonato</h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <FormField id="opponent" label="Nome do adversario" {...register("opponent")} error={!!errors.opponent} errorMessage={errors.opponent?.message} />
                                <FormField id="location" label="Local" {...register("location")} error={!!errors.location} errorMessage={errors.location?.message} />

                                <div className="space-y-2">
                                    <label htmlFor="type" className="text-sm font-medium leading-none text-cream-100">
                                        Tipo de jogo
                                    </label>
                                    <select id="type" {...register("type")} className="flex h-10 w-full rounded-md border border-navy-800 bg-navy-900 px-3 py-2 text-sm text-cream-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                                        <option value="FUTSAL">Futsal</option>
                                        <option value="CAMPO">Campo</option>
                                    </select>
                                </div>

                                <FormField
                                    id="season"
                                    label="Campeonato / Torneio"
                                    placeholder="Ex.: Copa Regional de Pirangi"
                                    {...register("season")}
                                    error={!!errors.season}
                                    errorMessage={errors.season?.message}
                                />

                                <FormField id="date" label="Data e hora" type="datetime-local" {...register("date")} error={!!errors.date} errorMessage={errors.date?.message} />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold uppercase tracking-wider text-blue-400 border-b border-navy-800 pb-2">Escudo do adversario</h3>

                            <label className="flex min-h-52 w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-navy-700 bg-navy-950/60 px-6 py-8 text-center transition-all hover:border-blue-500/50 hover:bg-navy-900">
                                <input type="file" className="hidden" accept="image/png,image/jpeg,image/webp" onChange={handleLogoSelection} />

                                {logoPreviewUrl ? (
                                    <div className="space-y-4">
                                        <Image
                                            src={logoPreviewUrl}
                                            alt="Preview do escudo do adversario"
                                            width={96}
                                            height={96}
                                            unoptimized={shouldBypassNextImageOptimization(logoPreviewUrl)}
                                            className="mx-auto h-24 w-24 rounded-full border border-navy-700 bg-navy-900 object-contain p-2"
                                        />
                                        <p className="text-sm font-medium text-cream-100">Escudo pronto para uso</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <UploadCloud className="mx-auto h-10 w-10 text-cream-300" />
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium text-blue-400">
                                                {isUploadingLogo ? "Enviando escudo..." : "Clique para enviar o escudo do adversario"}
                                            </p>
                                            <p className="text-xs text-cream-300">
                                                PNG, JPG ou WEBP de ate 3 MB. O arquivo vai para o armazenamento de imagens, e o banco recebe so a URL.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </label>

                            {logoFeedback && (
                                <p className={`text-sm ${uploadedLogoUrl ? "text-emerald-400" : "text-cream-300"}`}>
                                    {logoFeedback}
                                </p>
                            )}

                            {uploadedLogoUrl && (
                                <div className="flex justify-start">
                                    <Button type="button" variant="ghost" onClick={clearUploadedLogo}>
                                        Remover escudo
                                    </Button>
                                </div>
                            )}

                            {errors.opponentLogo?.message && (
                                <p className="text-[0.8rem] font-medium text-red-500">{errors.opponentLogo.message}</p>
                            )}

                            <p className="text-xs text-cream-300">
                                Se voce nao enviar o escudo, o site vai mostrar as iniciais do adversario automaticamente.
                            </p>
                            <p className="text-xs text-cream-300">
                                Se esse adversario ja tiver uma logo usada antes, o sistema reaproveita automaticamente no cadastro da nova partida.
                            </p>
                        </div>

                        {formFeedback && (
                            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                                {formFeedback}
                            </div>
                        )}

                        <div className="flex items-center justify-end gap-4 pt-4 border-t border-navy-800">
                            <Button type="button" variant="ghost" onClick={() => router.push("/partidas")}>Cancelar</Button>
                            <Button type="submit" variant="primary" disabled={isSubmitting || isUploadingLogo}>
                                <Save className="mr-2 h-4 w-4" /> {isSubmitting ? "Criando..." : "Criar Partida"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </div>
    );
}
