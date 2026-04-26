import { Badge, Card } from "@resenha/ui";
import type { DashboardCard } from "./types";

export function DashboardSection({ cards }: { cards: DashboardCard[] }) {
    return (
        <section id="dashboard" className="scroll-mt-6 space-y-4" aria-labelledby="commercial-dashboard-heading">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h2 id="commercial-dashboard-heading" className="font-display text-2xl text-cream-100">Dashboard comercial</h2>
                    <p className="mt-1 text-sm text-cream-300">Leitura rapida de volume, conversao, cliques e placements ativos.</p>
                </div>
                <Badge variant="accent">Fase 3</Badge>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {cards.map((item) => {
                    const Icon = item.icon;

                    return (
                        <Card key={item.label} className="border-navy-800 bg-navy-900/90 p-5">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-sm text-cream-300">{item.label}</p>
                                    <p className="mt-3 font-display text-3xl text-cream-100">{item.value}</p>
                                    <p className="mt-2 text-xs text-cream-300/70">{item.helper}</p>
                                </div>
                                <div className="rounded-md border border-blue-500/20 bg-blue-500/10 p-3 text-blue-300">
                                    <Icon className="h-5 w-5" />
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>
        </section>
    );
}
