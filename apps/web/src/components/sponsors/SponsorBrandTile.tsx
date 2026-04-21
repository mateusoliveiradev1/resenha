import Image from "next/image";
import { shouldBypassNextImageOptimization } from "@resenha/ui";
import { getSponsorAccentStyle, getSponsorFallbackStyle, getSponsorInitials, getSponsorWordmark } from "@/components/sponsors/sponsorBrand";

type SponsorBrandTileVariant = "compact" | "feature";

interface SponsorBrandTileProps {
    name: string;
    logoUrl?: string | null;
    variant?: SponsorBrandTileVariant;
}

export function SponsorBrandTile({ name, logoUrl, variant = "compact" }: SponsorBrandTileProps) {
    const isCompact = variant === "compact";
    const initials = getSponsorInitials(name);
    const wordmark = getSponsorWordmark(name, isCompact ? 2 : 3);

    return (
        <div
            className={`relative shrink-0 overflow-hidden border border-white/10 bg-[linear-gradient(140deg,rgba(255,255,255,0.98),rgba(241,245,249,0.92),rgba(226,232,240,0.86))] shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] ${
                isCompact ? "h-20 w-[112px] rounded-[20px]" : "h-40 w-full rounded-[24px]"
            }`}
        >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.94),transparent_52%)]" />

            {logoUrl ? (
                <Image
                    src={logoUrl}
                    alt={`Logo de ${name}`}
                    fill
                    unoptimized={shouldBypassNextImageOptimization(logoUrl)}
                    className={isCompact ? "object-contain p-2" : "object-contain p-4"}
                    sizes={isCompact ? "112px" : "(max-width: 768px) 100vw, 640px"}
                />
            ) : (
                <div className="relative flex h-full flex-col justify-between overflow-hidden p-3" style={getSponsorFallbackStyle(name)}>
                    <div className="absolute inset-x-0 top-0 h-px bg-white/15" />
                    <span className="text-[8px] font-semibold uppercase tracking-[0.32em] text-white/60">
                        Resenha RFC
                    </span>

                    <div className="relative">
                        <p className={`${isCompact ? "text-[11px]" : "text-xl"} font-display font-semibold leading-tight text-white`}>
                            {wordmark}
                        </p>
                        <span
                            className={`${isCompact ? "mt-1 text-[8px]" : "mt-2 text-[10px]"} inline-flex rounded-full border px-2 py-1 font-semibold uppercase tracking-[0.32em]`}
                            style={getSponsorAccentStyle(name)}
                        >
                            {initials}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
