"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "../utils/cn";

export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: React.ReactNode;
    description?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
    hideCloseButton?: boolean;
}

export function Modal({
    isOpen,
    onClose,
    title,
    description,
    children,
    className,
    hideCloseButton = false,
}: ModalProps) {
    // Prevent scrolling when modal is open
    React.useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={onClose}
                        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
                    />

                    {/* Modal Container */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                            className={cn(
                                "pointer-events-auto relative w-full max-w-lg overflow-hidden rounded-xl border border-navy-700 bg-navy-900 shadow-2xl p-6",
                                "glass", // Using the global glass utility class
                                className
                            )}
                        >
                            {!hideCloseButton && (
                                <button
                                    onClick={onClose}
                                    className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-navy-950 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                                >
                                    <X className="h-5 w-5 text-cream-300" />
                                    <span className="sr-only">Close</span>
                                </button>
                            )}

                            {title && (
                                <div className="mb-4">
                                    <h2 className="font-display text-xl font-semibold text-cream-100">
                                        {title}
                                    </h2>
                                    {description && (
                                        <p className="mt-1 text-sm text-cream-300">{description}</p>
                                    )}
                                </div>
                            )}

                            <div>{children}</div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
