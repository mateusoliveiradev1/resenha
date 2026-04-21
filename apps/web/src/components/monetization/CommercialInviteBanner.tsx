import Link from "next/link";
import { Badge, Button, Card, CardContent, cn } from "@resenha/ui";
import { ArrowRight, Megaphone } from "lucide-react";

interface CommercialInviteBannerProps {
    eyebrow?: string;
    title?: string;
    description?: string;
    href?: string;
    ctaLabel?: string;
    source?: string;
    className?: string;
}

export function CommercialInviteBanner({
    eyebrow = "Seja parceiro",
    title = "Sua empresa tambem pode aparecer no Resenha.",
    description = "Um convite simples para comercios locais que querem entrar no site, nas materias ou na pagina de parceiros sem tirar o foco do conteudo esportivo.",
    href = "/seja-parceiro",
    ctaLabel = "Ver como funciona",
    source = "commercial_invite_banner",
    className
}: CommercialInviteBannerProps) {
    return (
        <aside className={cn("not-prose", className)} aria-label="Convite comercial do Resenha">
            <Card className="overflow-hidden border-navy-800 bg-[linear-gradient(135deg,rgba(10,22,40,0.98),rgba(6,14,26,0.96))]">
                <CardContent className="relative p-5 sm:p-6">
                    <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/3 bg-[radial-gradient(circle_at_center,rgba(212,168,67,0.12),transparent_62%)] lg:block" />
                    <div className="relative z-10 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                        <div className="flex gap-4">
                            <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-blue-400/20 bg-blue-500/10 text-blue-300 sm:flex">
                                <Megaphone className="h-5 w-5" aria-hidden="true" />
                            </div>
                            <div>
                                <Badge variant="outline" className="mb-3 border-cream-100/10 bg-navy-950/50 text-cream-100">
                                    {eyebrow}
                                </Badge>
                                <h3 className="font-display text-xl font-bold text-cream-100 sm:text-2xl">{title}</h3>
                                <p className="mt-2 max-w-2xl text-sm leading-7 text-cream-300">{description}</p>
                            </div>
                        </div>

                        <Button asChild variant="outline" className="w-full rounded-full md:w-auto">
                            <Link
                                href={href}
                                data-monetization-event="cta_click"
                                data-label={ctaLabel}
                                data-journey="commercial"
                                data-source={source}
                                data-destination={href}
                            >
                                {ctaLabel}
                                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </aside>
    );
}
