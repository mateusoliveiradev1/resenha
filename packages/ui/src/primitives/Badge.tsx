import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../utils/cn";

export const badgeVariants = cva(
    "inline-flex items-center rounded-full border px-2.5 py-0.5 font-sans text-[11px] font-semibold uppercase transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-navy-950",
    {
        variants: {
            variant: {
                default: "border-transparent bg-navy-800 text-cream-100 hover:bg-navy-700",
                success: "border-transparent bg-green-500/20 text-green-500 hover:bg-green-500/30",
                warning: "border-transparent bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30",
                danger: "border-transparent bg-red-500/20 text-red-500 hover:bg-red-500/30",
                accent: "border-transparent bg-blue-600/20 text-blue-400 hover:bg-blue-600/30",
                gold: "border-transparent bg-gradient-to-br from-gold-400 to-[#B8941D] text-navy-950 shadow-sm",
                outline: "text-cream-300 border-navy-700",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
);

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
    children?: React.ReactNode;
}

export function Badge({ className, variant, ...props }: BadgeProps) {
    return (
        <div className={cn(badgeVariants({ variant }), className)} {...props} />
    );
}
