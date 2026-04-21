import Link from "next/link";
import { Badge, Button, Container, cn } from "@resenha/ui";
import { ArrowRight, HeartHandshake, MessageCircle } from "lucide-react";

interface CtaStripProps {
    eyebrow?: string;
    title?: string;
    description?: string;
    supportHref?: string;
    supportLabel?: string;
    commercialHref?: string;
    commercialLabel?: string;
    source?: string;
    contained?: boolean;
    className?: string;
}

export function CtaStrip({
    eyebrow = "Apoio e parcerias",
    title = "Escolha como voce quer caminhar com o Resenha.",
    description = "Apoiar o clube fortalece a rotina esportiva. Divulgar sua empresa coloca sua marca em espacos combinados do site.",
    supportHref = "/apoiar-o-resenha",
    supportLabel = "Apoiar o Resenha",
    commercialHref = "/seja-parceiro",
    commercialLabel = "Seja parceiro",
    source = "cta_strip",
    contained = true,
    className
}: CtaStripProps) {
    const content = (
        <div
            className={cn(
                "relative overflow-hidden rounded-[28px] border border-cream-100/8 bg-[linear-gradient(135deg,rgba(10,22,40,0.96),rgba(6,14,26,0.98))] px-5 py-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:px-7 lg:px-8",
                className
            )}
        >
            <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/3 bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.16),transparent_62%)] lg:block" />
            <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-3xl">
                    <Badge variant="outline" className="mb-4 border-cream-100/10 bg-navy-950/50 text-cream-100">
                        {eyebrow}
                    </Badge>
                    <h2 className="font-display text-2xl font-bold tracking-tight text-cream-100 sm:text-3xl">
                        {title}
                    </h2>
                    <p className="mt-3 text-sm leading-7 text-cream-300 sm:text-base">{description}</p>
                </div>

                <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row lg:shrink-0">
                    <Button asChild variant="outline" size="lg" className="w-full rounded-full border-gold-400/25 bg-gold-400/8 hover:bg-gold-400/12 sm:w-auto">
                        <Link
                            href={supportHref}
                            data-monetization-event="cta_click"
                            data-label={supportLabel}
                            data-journey="support"
                            data-source={source}
                            data-destination={supportHref}
                        >
                            {supportLabel}
                            <HeartHandshake className="ml-2 h-4 w-4" aria-hidden="true" />
                        </Link>
                    </Button>
                    <Button asChild size="lg" className="w-full rounded-full sm:w-auto">
                        <Link
                            href={commercialHref}
                            data-monetization-event="cta_click"
                            data-label={commercialLabel}
                            data-journey="commercial"
                            data-source={source}
                            data-destination={commercialHref}
                        >
                            {commercialLabel}
                            <MessageCircle className="ml-2 h-4 w-4" aria-hidden="true" />
                        </Link>
                    </Button>
                </div>
            </div>
            <ArrowRight className="pointer-events-none absolute bottom-5 right-5 hidden h-10 w-10 text-blue-300/10 lg:block" aria-hidden="true" />
        </div>
    );

    if (!contained) {
        return content;
    }

    return (
        <section className="bg-navy-950 py-10">
            <Container>{content}</Container>
        </section>
    );
}
