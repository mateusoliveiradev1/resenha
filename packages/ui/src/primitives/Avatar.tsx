"use client";

import * as React from "react";
import { cn } from "../utils/cn";

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
    src?: string | null;
    alt?: string;
    fallback?: string;
    size?: "sm" | "md" | "lg" | "xl";
    bordered?: boolean;
}

export function Avatar({ className, src, alt, fallback, size = "md", bordered = true, ...props }: AvatarProps) {
    const sizeClasses = {
        sm: "h-8 w-8 text-xs",
        md: "h-10 w-10 text-sm",
        lg: "h-16 w-16 text-lg",
        xl: "h-24 w-24 text-2xl"
    };

    const getInitials = (name?: string) => {
        if (!name) return "?";
        return name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
    };

    return (
        <div
            className={cn(
                "relative flex shrink-0 overflow-hidden rounded-full bg-navy-800",
                sizeClasses[size],
                bordered && "border-2 border-navy-700 shadow-sm",
                className
            )}
            {...props}
        >
            {src ? (
                <img
                    src={src}
                    alt={alt || "Avatar"}
                    className="aspect-square h-full w-full object-cover"
                />
            ) : (
                <div className="flex h-full w-full items-center justify-center bg-navy-800 text-cream-300 font-semibold">
                    {fallback || getInitials(alt)}
                </div>
            )}
        </div>
    );
}
