import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

const customTwMerge = extendTailwindMerge({
    extend: {
        theme: {
            colors: [
                "navy-950", "navy-900", "navy-800", "navy-700",
                "blue-600", "blue-500", "blue-400",
                "cream-100", "cream-300",
                "gold-400",
                "primary", "secondary", "accent",
            ],
        },
    },
});

export function cn(...inputs: ClassValue[]) {
    return customTwMerge(clsx(inputs));
}
