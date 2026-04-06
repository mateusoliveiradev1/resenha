import * as React from "react";
import { Badge, Card, Container } from "@resenha/ui";

type LegalSection = {
    title: string;
    paragraphs: readonly string[];
};

interface LegalDocumentProps {
    eyebrow: string;
    title: string;
    intro: string;
    lastUpdated: string;
    sections: readonly LegalSection[];
}

export function LegalDocument({
    eyebrow,
    title,
    intro,
    lastUpdated,
    sections
}: LegalDocumentProps) {
    return (
        <div className="min-h-screen bg-navy-950 py-20">
            <Container>
                <div className="relative overflow-hidden rounded-[32px] border border-navy-800 bg-[linear-gradient(135deg,rgba(10,22,40,0.98),rgba(6,14,26,0.96))] px-6 py-8 md:px-10 md:py-12">
                    <div className="absolute left-1/2 top-0 h-px w-full max-w-4xl -translate-x-1/2 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
                    <div className="absolute left-1/2 top-1/3 h-[240px] w-[760px] -translate-x-1/2 rounded-full bg-blue-600/8 blur-[130px] pointer-events-none" />

                    <div className="relative z-10 max-w-4xl">
                        <Badge variant="accent" className="mb-5">
                            {eyebrow}
                        </Badge>
                        <h1 className="font-display text-4xl font-bold tracking-tight text-cream-100 sm:text-5xl md:text-6xl">
                            {title}
                        </h1>
                        <p className="mt-5 max-w-3xl text-base leading-relaxed text-cream-300 md:text-lg">
                            {intro}
                        </p>
                        <div className="mt-8 inline-flex rounded-full border border-navy-700 bg-navy-900/80 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-gold-300">
                            Atualizado em {lastUpdated}
                        </div>
                    </div>
                </div>

                <div className="mt-10 grid gap-6">
                    {sections.map((section, index) => (
                        <Card key={section.title} className="border-navy-800 bg-navy-900/90 p-6 md:p-8">
                            <div className="flex flex-col gap-5 md:flex-row md:items-start md:gap-8">
                                <div className="md:w-56 md:shrink-0">
                                    <div className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-blue-300">
                                        Secao {String(index + 1).padStart(2, "0")}
                                    </div>
                                    <h2 className="font-display text-2xl font-bold text-cream-100">
                                        {section.title}
                                    </h2>
                                </div>

                                <div className="flex-1 space-y-4">
                                    {section.paragraphs.map((paragraph) => (
                                        <p key={paragraph} className="text-sm leading-relaxed text-cream-300 md:text-base">
                                            {paragraph}
                                        </p>
                                    ))}
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </Container>
        </div>
    );
}
