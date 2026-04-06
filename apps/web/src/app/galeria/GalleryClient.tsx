"use client";

import * as React from "react";
import Image from "next/image";
import { Container, shouldBypassNextImageOptimization } from "@resenha/ui";
import { LightboxModal, type Photo } from "@/components/galeria/LightboxModal";

export function GalleryClient({ photos }: { photos: Photo[] }) {
    const [lightboxOpen, setLightboxOpen] = React.useState(false);
    const [photoIndex, setPhotoIndex] = React.useState(0);

    const openLightbox = (index: number) => {
        setPhotoIndex(index);
        setLightboxOpen(true);
    };

    return (
        <div className="min-h-screen py-12 lg:py-20">
            <Container>
                <div className="mb-12 max-w-2xl">
                    <h1 className="font-display text-4xl font-bold tracking-tight text-cream-100 sm:text-5xl">
                        Galeria
                    </h1>
                    <p className="mt-4 text-lg text-cream-300">
                        Acompanhe os melhores momentos, registros reais de jogos e a resenha extracampo.
                    </p>
                </div>

                {photos.length > 0 ? (
                    <div className="columns-1 space-y-6 gap-6 sm:columns-2 lg:columns-3">
                        {photos.map((photo, index) => (
                            <button
                                key={photo.id}
                                type="button"
                                onClick={() => openLightbox(index)}
                                className="group relative block w-full cursor-pointer overflow-hidden rounded-xl border border-navy-800 bg-navy-900 text-left break-inside-avoid"
                            >
                                <div
                                    className="relative w-full"
                                    style={{ paddingTop: `${50 + (index % 3) * 20}%` }}
                                >
                                    <Image
                                        src={photo.url}
                                        alt={photo.caption || "Galeria Resenha RFC"}
                                        fill
                                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                        unoptimized={shouldBypassNextImageOptimization(photo.url)}
                                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                </div>

                                <div className="absolute inset-0 flex items-end bg-gradient-to-t from-navy-950 via-navy-950/20 to-transparent p-6">
                                    <span className="translate-y-4 text-sm font-medium text-cream-100 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                                        {photo.caption}
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-3xl border border-dashed border-navy-800 bg-navy-900/20 px-6 py-16 text-center">
                        <h2 className="font-display text-2xl font-bold text-cream-100">Galeria em montagem</h2>
                        <p className="mt-3 text-sm text-cream-300">
                            Assim que as primeiras imagens forem enviadas pelo admin, elas vao aparecer aqui automaticamente.
                        </p>
                    </div>
                )}
            </Container>

            <LightboxModal
                photos={photos}
                initialIndex={photoIndex}
                isOpen={lightboxOpen}
                onClose={() => setLightboxOpen(false)}
            />
        </div>
    );
}
