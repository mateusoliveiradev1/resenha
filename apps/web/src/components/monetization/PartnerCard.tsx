import Image from "next/image";
import Link from "next/link";
import { Badge, Card, cn, shouldBypassNextImageOptimization } from "@resenha/ui";
import { ArrowRight, Star } from "lucide-react";
import {
    getSponsorAccentStyle,
    getSponsorFallbackStyle,
    getSponsorInitials,
    getSponsorWordmark
} from "@/components/sponsors/sponsorBrand";

interface PartnerCardProps {
    name: string;
    logoUrl?: string | null;
    badge?: string;
    description?: string | null;
    href?: string | null;
    linkLabel?: string;
    premium?: boolean;
    source?: string;
    className?: string;
}

function PartnerVisual({ name, logoUrl, premium }: { name: string; logoUrl?: string | null; premium?: boolean }) {
    const initials = getSponsorInitials(name);
    const wordmark = getSponsorWordmark(name, 3);

    return (
        <div
            className={cn(
                "relative h-36 w-full overflow-hidden rounded-[22px] border bg-[linear-gradient(140deg,rgba(255,255,255,0.98),rgba(241,245,249,0.92),rgba(226,232,240,0.86))] shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]",
                premium ? "border-gold-400/40" : "border-white/10"
            )}
        >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.94),transparent_52%)]" />
            {logoUrl ? (
                <Image
                    src={logoUrl}
                    alt={`Logo de ${name}`}
                    fill
                    unoptimized={shouldBypassNextImageOptimization(logoUrl)}
                    className="object-contain p-4"
                    sizes="(max-width: 768px) 100vw, 420px"
                />
            ) : (
                <div className="relative flex h-full flex-col justify-between overflow-hidden p-4" style={getSponsorFallbackStyle(name)}>
                    <span className="text-[9px] font-semibold uppercase tracking-[0.32em] text-white/60">
                        Resenha RFC
                    </span>
                    <div>
                        <p className="font-display text-2xl font-semibold leading-tight text-white">{wordmark}</p>
                        <span
                            className="mt-3 inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.32em]"
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

export function PartnerCard({
    name,
    logoUrl,
    badge = "Parceiro",
    description,
    href,
    linkLabel,
    premium = false,
    source = "partner_card",
    className
}: PartnerCardProps) {
    const safeHref = href || undefined;
    const isExternal = safeHref ? /^https?:\/\//.test(safeHref) : false;
    const resolvedLinkLabel = linkLabel ?? (safeHref ? "Visitar marca" : "Parceria confirmada");

    const card = (
        <Card
            className={cn(
                "group flex h-full flex-col rounded-[26px] bg-navy-950/80 p-5 transition-all duration-300",
                premium
                    ? "border-gold-400/25 hover:border-gold-300/45 hover:shadow-[0_20px_42px_rgba(250,204,21,0.14)]"
                    : "border-navy-800 hover:border-blue-500/30 hover:shadow-[0_18px_40px_rgba(37,99,235,0.12)]",
                safeHref && "hover:-translate-y-1",
                className
            )}
            data-monetization-event={safeHref ? "partner_logo_click" : undefined}
            data-label={resolvedLinkLabel}
            data-partner-name={name}
            data-source={source}
            data-destination={safeHref}
        >
            <PartnerVisual name={name} logoUrl={logoUrl} premium={premium} />

            <div className="mt-5 flex flex-1 flex-col">
                <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={premium ? "gold" : "accent"}>
                        {premium && <Star className="mr-1 h-3 w-3" aria-hidden="true" />}
                        {badge}
                    </Badge>
                </div>
                <h3 className="mt-4 font-display text-2xl font-bold text-cream-100">{name}</h3>
                {description && <p className="mt-3 text-sm leading-7 text-cream-300">{description}</p>}

                <div className="mt-auto flex items-center justify-between border-t border-navy-800 pt-5">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-blue-300">
                        {resolvedLinkLabel}
                    </span>
                    <ArrowRight className="h-4 w-4 text-blue-300 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </div>
            </div>
        </Card>
    );

    if (!safeHref) {
        return card;
    }

    if (isExternal) {
        return (
            <a href={safeHref} target="_blank" rel="noopener noreferrer" className="block h-full">
                {card}
            </a>
        );
    }

    return (
        <Link href={safeHref} className="block h-full">
            {card}
        </Link>
    );
}
