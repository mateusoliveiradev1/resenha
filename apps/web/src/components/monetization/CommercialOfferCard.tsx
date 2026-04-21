import Link from "next/link";
import { Badge, Button, Card, CardContent, cn } from "@resenha/ui";
import { ArrowRight, CheckCircle2, PlusCircle } from "lucide-react";

interface MonetizationCta {
    label: string;
    href: string;
    external?: boolean;
}

export interface CommercialOffer {
    badge?: string;
    title: string;
    audience?: string;
    description: string;
    inclusions: string[];
    note?: string;
    cta?: MonetizationCta;
}

export interface CommercialAddOn {
    title: string;
    description: string;
    badge?: string;
    cta?: MonetizationCta;
}

interface CommercialOfferCardProps {
    offer: CommercialOffer;
    addOns?: CommercialAddOn[];
    source?: string;
    className?: string;
}

function CtaButton({ cta, source, offerName }: { cta: MonetizationCta; source: string; offerName: string }) {
    const isExternal = cta.external ?? /^https?:\/\//.test(cta.href);
    const commonProps = {
        "data-monetization-event": "offer_cta_click",
        "data-source": source,
        "data-offer-name": offerName,
        "data-destination": cta.href
    };

    return (
        <Button asChild className="mt-6 w-full rounded-full sm:w-auto">
            {isExternal ? (
                <a href={cta.href} target="_blank" rel="noopener noreferrer" {...commonProps}>
                    {cta.label}
                    <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </a>
            ) : (
                <Link href={cta.href} {...commonProps}>
                    {cta.label}
                    <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </Link>
            )}
        </Button>
    );
}

export function CommercialOfferCard({
    offer,
    addOns = [],
    source = "commercial_offer",
    className
}: CommercialOfferCardProps) {
    return (
        <div className={cn("grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]", className)}>
            <Card className="border-gold-400/25 bg-[linear-gradient(145deg,rgba(10,22,40,0.98),rgba(6,14,26,0.98))]">
                <CardContent className="p-6 lg:p-8">
                    {offer.badge && (
                        <Badge variant="gold" className="mb-4">
                            {offer.badge}
                        </Badge>
                    )}
                    <h3 className="font-display text-3xl font-bold tracking-tight text-cream-100">{offer.title}</h3>
                    {offer.audience && (
                        <p className="mt-2 text-xs font-semibold uppercase tracking-[0.24em] text-blue-300">
                            {offer.audience}
                        </p>
                    )}
                    <p className="mt-4 text-base leading-8 text-cream-300">{offer.description}</p>

                    <ul className="mt-6 grid gap-3">
                        {offer.inclusions.map((item) => (
                            <li key={item} className="flex gap-3 text-sm leading-7 text-cream-300">
                                <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-gold-400" aria-hidden="true" />
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>

                    {offer.note && (
                        <p className="mt-6 rounded-2xl border border-cream-100/8 bg-navy-950/50 p-4 text-sm leading-7 text-cream-300">
                            {offer.note}
                        </p>
                    )}

                    {offer.cta && <CtaButton cta={offer.cta} source={source} offerName={offer.title} />}
                </CardContent>
            </Card>

            {addOns.length > 0 && (
                <div className="grid gap-4">
                    {addOns.map((addOn) => (
                        <Card key={addOn.title} variant="glass" className="border-cream-100/8">
                            <CardContent className="flex h-full flex-col p-5">
                                <div className="flex items-start gap-4">
                                    <PlusCircle className="mt-1 h-5 w-5 shrink-0 text-gold-400" aria-hidden="true" />
                                    <div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h4 className="font-display text-xl font-bold text-cream-100">{addOn.title}</h4>
                                            {addOn.badge && <Badge variant="accent">{addOn.badge}</Badge>}
                                        </div>
                                        <p className="mt-2 text-sm leading-7 text-cream-300">{addOn.description}</p>
                                    </div>
                                </div>

                                {addOn.cta && <CtaButton cta={addOn.cta} source={source} offerName={addOn.title} />}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
