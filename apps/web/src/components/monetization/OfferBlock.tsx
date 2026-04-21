import Link from "next/link";
import { Badge, Button, Card, CardContent, cn } from "@resenha/ui";
import { ArrowRight, Handshake } from "lucide-react";

interface OfferBlockProps {
    partnerName: string;
    label?: string;
    title?: string;
    description?: string;
    href?: string;
    linkLabel?: string;
    source?: string;
    className?: string;
}

export function OfferBlock({
    partnerName,
    label = "Oferecimento",
    title,
    description,
    href,
    linkLabel = "Conhecer parceiro",
    source = "offer_block",
    className
}: OfferBlockProps) {
    const resolvedTitle = title ?? `Conteudo com apoio de ${partnerName}`;
    const isExternal = href ? /^https?:\/\//.test(href) : false;

    return (
        <aside className={cn("not-prose", className)} aria-label={`${label}: ${partnerName}`}>
            <Card variant="glass" className="border-cream-100/8 bg-navy-900/70">
                <CardContent className="p-5 sm:p-6">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                            <Badge variant="accent" className="mb-3">
                                <Handshake className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                                {label}
                            </Badge>
                            <h3 className="font-display text-xl font-bold leading-tight text-cream-100 sm:text-2xl">
                                {resolvedTitle}
                            </h3>
                            <p className="mt-2 text-sm leading-7 text-cream-300">
                                {description ?? `${partnerName} aparece como parceiro sinalizado dentro da cobertura do Resenha.`}
                            </p>
                        </div>

                        {href && (
                            <Button asChild variant="outline" className="w-full rounded-full sm:w-auto">
                                {isExternal ? (
                                    <a
                                        href={href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        data-monetization-event="offer_block_click"
                                        data-source={source}
                                        data-partner-name={partnerName}
                                        data-destination={href}
                                    >
                                        {linkLabel}
                                        <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                                    </a>
                                ) : (
                                    <Link
                                        href={href}
                                        data-monetization-event="offer_block_click"
                                        data-source={source}
                                        data-partner-name={partnerName}
                                        data-destination={href}
                                    >
                                        {linkLabel}
                                        <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                                    </Link>
                                )}
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </aside>
    );
}
