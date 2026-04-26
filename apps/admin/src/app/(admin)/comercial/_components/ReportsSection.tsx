import { Badge, Card } from "@resenha/ui";
import type { PartnerReport } from "./types";

const minimumReliableClicks = 3;

export function ReportsSection({ reports }: { reports: PartnerReport[] }) {
    return (
        <Card id="reports" className="scroll-mt-6 border-navy-800 bg-navy-900/90 p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-400">
                        Relatorios simples
                    </p>
                    <h2 className="mt-2 font-display text-2xl text-cream-100">
                        Parceiros com metricas confiaveis
                    </h2>
                    <p className="mt-2 max-w-2xl text-sm text-cream-300">
                        Um parceiro aparece aqui quando ja tem pelo menos {minimumReliableClicks} cliques registrados. Antes disso, o painel evita mostrar leitura fraca como relatorio.
                    </p>
                </div>
                <Badge variant="outline">Minimo {minimumReliableClicks} cliques</Badge>
            </div>

            {reports.length > 0 ? (
                <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {reports.map((report) => (
                        <div key={report.partnerName} className="rounded-md border border-navy-800 bg-navy-950/70 p-4">
                            <p className="font-display text-lg text-cream-100">{report.partnerName}</p>
                            <p className="mt-3 font-display text-3xl text-cream-100">{report.clicks}</p>
                            <p className="mt-2 text-sm text-cream-300">
                                clique{report.clicks === 1 ? "" : "s"} em {report.sourceCount} origem{report.sourceCount === 1 ? "" : "s"}
                            </p>
                            <p className="mt-2 text-xs text-cream-300/65">
                                Ultimo clique: {report.latest.toLocaleDateString("pt-BR")}
                            </p>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="mt-6 rounded-md border border-dashed border-navy-800 bg-navy-950/70 px-4 py-8 text-center text-sm text-cream-300">
                    Ainda nao ha parceiro com volume suficiente para relatorio simples.
                </div>
            )}
        </Card>
    );
}
