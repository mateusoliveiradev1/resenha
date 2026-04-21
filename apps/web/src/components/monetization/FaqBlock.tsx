import { Badge, Card, CardContent, cn } from "@resenha/ui";
import { ChevronDown } from "lucide-react";

export interface FaqItem {
    question: string;
    answer: string;
}

interface FaqBlockProps {
    items: FaqItem[];
    eyebrow?: string;
    title: string;
    description?: string;
    source?: string;
    defaultOpenFirst?: boolean;
    className?: string;
}

export function FaqBlock({
    items,
    eyebrow = "Duvidas frequentes",
    title,
    description,
    source = "faq_block",
    defaultOpenFirst = false,
    className
}: FaqBlockProps) {
    if (!items.length) {
        return null;
    }

    return (
        <section className={cn("space-y-6", className)} aria-labelledby="monetization-faq-heading">
            <div className="max-w-3xl">
                <Badge variant="outline" className="mb-4 border-cream-100/10 bg-navy-950/40 text-cream-100">
                    {eyebrow}
                </Badge>
                <h2 id="monetization-faq-heading" className="font-display text-3xl font-bold tracking-tight text-cream-100 sm:text-4xl">
                    {title}
                </h2>
                {description && <p className="mt-3 text-base leading-7 text-cream-300">{description}</p>}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {items.map((faq, index) => (
                    <Card key={faq.question} variant="glass" className="border-cream-100/8">
                        <CardContent className="p-0">
                            <details
                                className="group"
                                open={defaultOpenFirst && index === 0 ? true : undefined}
                                data-monetization-event="faq_interaction"
                                data-source={source}
                                data-question={faq.question}
                            >
                                <summary className="flex cursor-pointer list-none items-start justify-between gap-4 p-5 text-left marker:hidden sm:p-6">
                                    <span className="font-display text-lg font-bold leading-7 text-cream-100 sm:text-xl">
                                        {faq.question}
                                    </span>
                                    <ChevronDown className="mt-1 h-5 w-5 shrink-0 text-blue-300 transition-transform group-open:rotate-180" aria-hidden="true" />
                                </summary>
                                <div className="border-t border-cream-100/8 px-5 pb-5 pt-4 sm:px-6 sm:pb-6">
                                    <p className="text-sm leading-7 text-cream-300">{faq.answer}</p>
                                </div>
                            </details>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </section>
    );
}
