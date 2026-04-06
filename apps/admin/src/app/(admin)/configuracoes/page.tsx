import Link from "next/link";
import { Badge, Card } from "@resenha/ui";
import { Globe, Handshake, Mail, ShieldCheck, Sparkles } from "lucide-react";

const settingCards = [
    {
        title: "Identidade do painel",
        description: "Area para evoluir logo, destaques da home e ajustes visuais do clube.",
        icon: Sparkles,
        href: "/",
        cta: "Voltar ao dashboard"
    },
    {
        title: "Patrocinios e parceiros",
        description: "Gerencie cotas, logos e destaque dos patrocinadores exibidos no site.",
        icon: Handshake,
        href: "/patrocinadores",
        cta: "Abrir patrocinadores"
    },
    {
        title: "Contato e canais",
        description: "Centralize email, redes sociais e futuros dados institucionais do clube.",
        icon: Mail,
        href: "/posts",
        cta: "Ver conteudo"
    },
    {
        title: "Site e seguranca",
        description: "Espaco reservado para regras de acesso, dominio e configuracoes globais.",
        icon: ShieldCheck,
        href: "/galeria",
        cta: "Explorar modulos"
    }
];

export default function ConfiguracoesPage() {
    return (
        <div className="space-y-6">
            <div>
                <Badge variant="accent">Configuracoes</Badge>
                <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-cream-100">
                    Painel de configuracoes
                </h1>
                <p className="mt-2 max-w-3xl text-cream-300">
                    Esta area agora existe de verdade e ja serve como base para concentrar os ajustes operacionais do admin.
                </p>
            </div>

            <Card className="overflow-hidden border-navy-800 bg-[linear-gradient(135deg,rgba(15,23,42,1),rgba(8,15,29,1))] p-6">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-400">
                            Centro de controle
                        </p>
                        <h2 className="mt-3 font-display text-2xl text-cream-100">
                            Organize as configuracoes do Resenha RFC em um unico lugar
                        </h2>
                        <p className="mt-3 max-w-2xl text-sm text-cream-300">
                            O proximo passo aqui pode ser ligar dados institucionais, contatos oficiais, integracoes e preferencias de exibicao do site.
                        </p>
                    </div>

                    <div className="inline-flex items-center gap-2 rounded-2xl border border-blue-500/20 bg-blue-500/10 px-4 py-3 text-sm font-semibold text-blue-300">
                        <Globe className="h-4 w-4" />
                        Base pronta para expandir
                    </div>
                </div>
            </Card>

            <div className="grid gap-4 xl:grid-cols-2">
                {settingCards.map((item) => {
                    const Icon = item.icon;

                    return (
                        <Card key={item.title} className="border-navy-800 bg-navy-900/90 p-5">
                            <div className="flex items-start gap-4">
                                <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-3 text-blue-300">
                                    <Icon className="h-5 w-5" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h3 className="font-display text-xl text-cream-100">{item.title}</h3>
                                    <p className="mt-2 text-sm text-cream-300">{item.description}</p>
                                    <Link
                                        href={item.href}
                                        className="mt-4 inline-flex items-center rounded-xl border border-cream-100/15 bg-cream-100/5 px-4 py-2 text-sm font-semibold text-cream-100 transition-colors hover:bg-cream-100/10"
                                    >
                                        {item.cta}
                                    </Link>
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
