"use client";

import * as React from "react";
import Image from "next/image";
import { shouldBypassNextImageOptimization } from "@resenha/ui";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

export interface Photo {
    id: string;
    url: string;
    caption?: string | null;
}

export interface LightboxModalProps {
    photos: Photo[];
    initialIndex: number;
    isOpen: boolean;
    onClose: () => void;
}

export function LightboxModal({ photos, initialIndex, isOpen, onClose }: LightboxModalProps) {
    const [currentIndex, setCurrentIndex] = React.useState(initialIndex);

    React.useEffect(() => {
        setCurrentIndex(initialIndex);
    }, [initialIndex]);

    const handleNext = React.useCallback(() => {
        if (photos.length === 0) return;
        setCurrentIndex((prev) => (prev + 1) % photos.length);
    }, [photos.length]);

    const handlePrev = React.useCallback(() => {
        if (photos.length === 0) return;
        setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
    }, [photos.length]);

    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;
            if (e.key === "Escape") onClose();
            if (e.key === "ArrowRight") handleNext();
            if (e.key === "ArrowLeft") handlePrev();
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handleNext, handlePrev, isOpen, onClose]);

    if (!isOpen || photos.length === 0) return null;

    const currentPhoto = photos[currentIndex];

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 z-50 flex flex-col bg-navy-950/95 backdrop-blur-md"
                >
                    {/* Top Bar */}
                    <div className="flex h-16 items-center justify-between px-6 shrink-0 relative z-10">
                        <span className="text-sm font-medium text-cream-300">
                            {currentIndex + 1} / {photos.length}
                        </span>
                        <button
                            onClick={onClose}
                            className="flex h-10 w-10 items-center justify-center rounded-full bg-navy-900/50 hover:bg-navy-800 text-cream-100 transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Main Content */}
                    <div className="relative flex-1 overflow-hidden flex items-center justify-center p-4">
                        {photos.length > 1 && (
                            <button
                                onClick={handlePrev}
                                className="absolute left-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-navy-900/50 hover:bg-navy-800 text-cream-100 transition-colors backdrop-blur-md"
                            >
                                <ChevronLeft className="h-6 w-6" />
                            </button>
                        )}

                        <motion.div
                            key={currentIndex}
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3 }}
                            className="relative w-full h-full flex flex-col mt-4 mb-16"
                        >
                            <div className="relative flex-1 w-full h-full flex items-center justify-center">
                                {/* In a real app we load from url, fallback to logo for demo */}
                                {currentPhoto.url ? (
                                    <Image
                                        src={currentPhoto.url}
                                        alt={currentPhoto.caption || "Galeria"}
                                        fill
                                        sizes="100vw"
                                        unoptimized={shouldBypassNextImageOptimization(currentPhoto.url)}
                                        className="object-contain"
                                    />
                                ) : (
                                    <Image
                                        src="/logo2.png"
                                        alt="Fallback"
                                        width={400}
                                        height={400}
                                        className="object-contain opacity-50"
                                    />
                                )}
                            </div>

                            {currentPhoto.caption && (
                                <div className="absolute bottom-4 left-0 right-0 text-center z-10">
                                    <span className="inline-block bg-navy-950/80 px-4 py-2 rounded-lg text-cream-100 text-sm backdrop-blur-md border border-navy-800 shadow-lg">
                                        {currentPhoto.caption}
                                    </span>
                                </div>
                            )}
                        </motion.div>

                        {photos.length > 1 && (
                            <button
                                onClick={handleNext}
                                className="absolute right-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-navy-900/50 hover:bg-navy-800 text-cream-100 transition-colors backdrop-blur-md"
                            >
                                <ChevronRight className="h-6 w-6" />
                            </button>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
