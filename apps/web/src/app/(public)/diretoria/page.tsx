import type { Metadata } from "next";
import { Badge, Card, CardContent, Container } from "@resenha/ui";
import { db } from "@resenha/db";
import { staff } from "@resenha/db/schema";
import { asc } from "drizzle-orm";
import { createPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = createPageMetadata({
    title: "Diretoria e Staff",
    description:
        "Conheça a diretoria e o staff do Resenha RFC, com a estrutura que sustenta a liderança, a operação e a identidade do clube.",
    path: "/diretoria",
    keywords: ["diretoria", "staff", "liderança", "gestão esportiva", "estrutura do clube"]
});

const getInitials = (name: string) =>
    name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("");

const normalizeRole = (role: string) =>
    role
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();

const getRoleCopy = (role: string) => {
    const normalized = normalizeRole(role);

    switch (normalized) {
        case "presidencia":
            return {
                title: "Liderança que dá direção ao projeto",
                description:
                    "A presidência protege a identidade do Resenha RFC, conduz decisões estratégicas e ajuda a manter o clube alinhado entre ambição esportiva, organização e futuro.",
                memberText:
                    "Atua no núcleo de liderança que define direção, sustenta decisões e preserva a identidade do clube."
            };
        case "diretoria":
            return {
                title: "Gestão que organiza o dia a dia",
                description:
                    "A diretoria transforma planejamento em rotina, conecta bastidores e sustenta a engrenagem que permite ao Resenha competir com mais consistência.",
                memberText:
                    "Fortalece a operação do clube e ajuda a manter a estrutura funcionando com organização e continuidade."
            };
        case "tecnico":
            return {
                title: "Comando técnico com leitura de jogo",
                description:
                    "A comissão técnica prepara o elenco, organiza conceitos e traduz trabalho em competitividade a cada treino, jogo e ajuste de rota.",
                memberText:
                    "Conduz a preparação da equipe e ajuda a transformar entrega coletiva em desempenho esportivo."
            };
        case "auxiliar":
            return {
                title: "Apoio técnico que acelera execução",
                description:
                    "O suporte técnico fortalece a rotina de preparação, contribui nos detalhes do elenco e dá ritmo ao trabalho feito fora do holofote.",
                memberText:
                    "Dá suporte à preparação da equipe e ajuda a manter o trabalho técnico acontecendo com consistência."
            };
        case "marketing":
            return {
                title: "Comunicação que amplia presença",
                description:
                    "O marketing aproxima o clube da comunidade, fortalece a imagem do Resenha RFC e transforma rotina, campanha e identidade em presença real.",
                memberText:
                    "Cuida da voz do clube e ajuda a levar a identidade do Resenha para dentro e fora das telas."
            };
        case "roupeiro":
            return {
                title: "Operação que deixa tudo pronto",
                description:
                    "Do material à apresentação do elenco, essa frente garante ordem, cuidado e suporte para que o time esteja pronto em cada compromisso.",
                memberText:
                    "Sustenta a operação do material e ajuda a garantir que o clube chegue preparado para cada rodada."
            };
        default:
            return {
                title: "Bastidores que sustentam o clube",
                description:
                    "Cada frente aqui presente ajuda a manter o Resenha RFC competitivo, organizado e fiel à própria identidade.",
                memberText:
                    "Contribui diretamente para o funcionamento do clube com trabalho de bastidor, cuidado e compromisso coletivo."
            };
    }
};

export default async function DiretoriaPage() {
    const staffMembers = await db.select().from(staff).orderBy(asc(staff.role), asc(staff.name));

    type StaffMember = (typeof staffMembers)[number];

    const groupedStaff = Array.from(
        staffMembers.reduce((map, member) => {
            const current = map.get(member.role) ?? [];
            current.push(member);
            map.set(member.role, current);
            return map;
        }, new Map<string, StaffMember[]>())
    ).map(([role, members]) => ({
        role,
        members,
        copy: getRoleCopy(role)
    }));

    const leadershipCount = staffMembers.filter((member) => {
        const role = normalizeRole(member.role);
        return role === "presidencia" || role === "diretoria";
    }).length;

    return (
        <div className="min-h-screen bg-navy-950 py-16 lg:py-20">
            <Container>
                <section className="relative overflow-hidden rounded-[2rem] border border-navy-800 bg-[radial-gradient(circle_at_top_left,_rgba(212,168,67,0.18),_transparent_34%),linear-gradient(180deg,rgba(10,22,40,0.97),rgba(6,14,26,1))] px-6 py-8 shadow-[0_28px_60px_rgba(0,0,0,0.24)] sm:px-8 lg:px-12 lg:py-12">
                    <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/3 bg-[radial-gradient(circle_at_center,_rgba(37,99,235,0.15),_transparent_62%)] lg:block" />
                    <div className="relative max-w-4xl">
                        <div className="flex flex-wrap gap-3">
                            <Badge variant="accent">Estrutura do clube</Badge>
                            <Badge variant="outline" className="border-cream-100/10 bg-navy-950/40 px-3 py-1 text-cream-100">
                                {staffMembers.length} integrante{staffMembers.length === 1 ? "" : "s"}
                            </Badge>
                            <Badge variant="outline" className="border-cream-100/10 bg-navy-950/40 px-3 py-1 text-cream-100">
                                {groupedStaff.length} frente{groupedStaff.length === 1 ? "" : "s"} ativa{groupedStaff.length === 1 ? "" : "s"}
                            </Badge>
                        </div>

                        <h1 className="mt-5 font-display text-4xl font-bold tracking-tight text-cream-100 sm:text-5xl lg:text-6xl">
                            Diretoria e Staff
                        </h1>
                        <p className="mt-5 max-w-3xl text-lg leading-8 text-cream-300">
                            O Resenha RFC cresce quando existe organização fora do jogo. Esta é a equipe que conduz decisões,
                            sustenta bastidores, fortalece a rotina do clube e ajuda a transformar identidade em continuidade.
                        </p>
                    </div>
                </section>

                <section className="mt-8 grid gap-4 lg:grid-cols-3">
                    <Card variant="glass" className="border-cream-100/8">
                        <CardContent className="p-6">
                            <p className="text-xs uppercase tracking-[0.28em] text-cream-300/60">Staff ativo</p>
                            <p className="mt-4 font-display text-4xl font-black text-cream-100">{staffMembers.length}</p>
                            <p className="mt-3 text-sm leading-7 text-cream-300">
                                Pessoas que sustentam liderança, operação, apoio técnico e comunicação no dia a dia do clube.
                            </p>
                        </CardContent>
                    </Card>

                    <Card variant="glass" className="border-cream-100/8">
                        <CardContent className="p-6">
                            <p className="text-xs uppercase tracking-[0.28em] text-cream-300/60">Frentes organizadas</p>
                            <p className="mt-4 font-display text-4xl font-black text-cream-100">{groupedStaff.length}</p>
                            <p className="mt-3 text-sm leading-7 text-cream-300">
                                Áreas que conectam gestão, preparação, operação e presença institucional em uma mesma estrutura.
                            </p>
                        </CardContent>
                    </Card>

                    <Card variant="glass" className="border-cream-100/8">
                        <CardContent className="p-6">
                            <p className="text-xs uppercase tracking-[0.28em] text-cream-300/60">Núcleo de liderança</p>
                            <p className="mt-4 font-display text-4xl font-black text-cream-100">{leadershipCount}</p>
                            <p className="mt-3 text-sm leading-7 text-cream-300">
                                Presidência e diretoria trabalhando para dar direção, estabilidade e continuidade ao projeto.
                            </p>
                        </CardContent>
                    </Card>
                </section>

                <section className="mt-12">
                    <div className="mb-6 max-w-3xl">
                        <Badge variant="outline" className="mb-4 border-cream-100/10 bg-navy-950/40 text-cream-100">
                            Organização por frente
                        </Badge>
                        <h2 className="font-display text-3xl font-bold tracking-tight text-cream-100 sm:text-4xl">
                            Quem sustenta o Resenha RFC fora de quadra e fora do campo
                        </h2>
                        <p className="mt-3 text-base leading-7 text-cream-300">
                            Cada função aqui ajuda a manter o clube mais preparado, mais bem apresentado e mais consistente.
                            O que acontece em jogo também começa no trabalho de bastidor.
                        </p>
                    </div>

                    {groupedStaff.length > 0 ? (
                        <div className="space-y-6">
                            {groupedStaff.map((group) => (
                                <Card key={group.role} variant="glass" className="border-cream-100/8">
                                    <CardContent className="p-6">
                                        <div className="max-w-3xl">
                                            <Badge variant="gold" className="mb-4">
                                                {group.role}
                                            </Badge>
                                            <h3 className="font-display text-2xl font-bold tracking-tight text-cream-100 sm:text-3xl">
                                                {group.copy.title}
                                            </h3>
                                            <p className="mt-3 text-base leading-7 text-cream-300">
                                                {group.copy.description}
                                            </p>
                                        </div>

                                        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                            {group.members.map((member) => (
                                                <div key={member.id} className="rounded-2xl border border-cream-100/10 bg-navy-950/45 p-5">
                                                    <div className="flex items-start gap-4">
                                                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10 font-display text-lg font-bold text-blue-300">
                                                            {getInitials(member.name)}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold-300">
                                                                {member.role}
                                                            </p>
                                                            <h4 className="mt-2 text-xl font-bold text-cream-100">{member.name}</h4>
                                                            <p className="mt-3 text-sm leading-7 text-cream-300">
                                                                {group.copy.memberText}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card variant="glass" className="border-cream-100/8">
                            <CardContent className="px-6 py-12 text-center">
                                <p className="text-xs uppercase tracking-[0.28em] text-cream-300/60">
                                    Estrutura em atualização
                                </p>
                                <p className="mt-4 font-display text-3xl font-bold text-cream-100">
                                    Nenhum membro do staff foi cadastrado ainda
                                </p>
                                <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-cream-300">
                                    Assim que os nomes forem registrados no painel administrativo, esta página passa a apresentar a estrutura completa da diretoria e do staff com o mesmo padrão visual do restante do site.
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </section>
            </Container>
        </div>
    );
}
