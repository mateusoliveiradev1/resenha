"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "../utils/cn";

export interface Tab {
    id: string;
    label: React.ReactNode;
}

export interface TabsProps {
    tabs: Tab[];
    activeId: string;
    onChange: (id: string) => void;
    variant?: "underline" | "pills";
    className?: string;
    tabClassName?: string;
}

export function Tabs({ tabs, activeId, onChange, variant = "underline", className, tabClassName }: TabsProps) {
    return (
        <div
            className={cn(
                "flex overflow-x-auto no-scrollbar",
                variant === "underline" ? "border-b border-navy-800" : "gap-2 space-x-1",
                className
            )}
        >
            {tabs.map((tab) => {
                const isActive = activeId === tab.id;

                return (
                    <button
                        key={tab.id}
                        onClick={() => onChange(tab.id)}
                        className={cn(
                            "relative px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap",
                            variant === "underline"
                                ? cn("hover:text-cream-100", isActive ? "text-cream-100" : "text-cream-300")
                                : cn("rounded-full px-4 py-1.5", isActive ? "text-cream-100" : "text-cream-300 hover:text-cream-100 hover:bg-navy-800"),
                            tabClassName
                        )}
                    >
                        <span className="relative z-10">{tab.label}</span>

                        {/* Active Indicator */}
                        {isActive && (
                            <motion.div
                                layoutId={`active-tab-${variant}`}
                                className={cn(
                                    "absolute",
                                    variant === "underline"
                                        ? "bottom-[-1px] left-0 right-0 h-[2px] bg-blue-500"
                                        : "inset-0 rounded-full bg-navy-700/50"
                                )}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            />
                        )}
                    </button>
                );
            })}
        </div>
    );
}
