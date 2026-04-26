import { Badge, Card } from "@resenha/ui";

const sections = [
    { href: "#dashboard", label: "Dashboard" },
    { href: "#reports", label: "Relatorios" },
    { href: "#offers", label: "Ofertas" },
    { href: "#offerings", label: "Oferecimentos" },
    { href: "#follow-ups", label: "Follow-up" },
    { href: "#campaigns", label: "Campanhas" },
    { href: "#premium-pages", label: "Paginas premium" },
    { href: "#experiments", label: "Experimentos" }
];

export function SectionNav() {
    return (
        <Card className="border-navy-800 bg-navy-900/80 p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <Badge variant="outline">Navegacao</Badge>
                    <p className="mt-2 text-sm text-cream-300">
                        Pule direto para a area comercial que precisa operar.
                    </p>
                </div>
                <nav aria-label="Secoes comerciais" className="flex flex-wrap gap-2">
                    {sections.map((section) => (
                        <a
                            key={section.href}
                            href={section.href}
                            className="rounded-md border border-navy-800 bg-navy-950 px-3 py-2 text-sm font-medium text-cream-100 transition-colors hover:border-blue-500/50 hover:text-blue-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                        >
                            {section.label}
                        </a>
                    ))}
                </nav>
            </div>
        </Card>
    );
}
