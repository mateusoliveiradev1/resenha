import { Container, Badge } from "@resenha/ui";
import { db } from "@resenha/db";
import { staff } from "@resenha/db/schema";
import { asc } from "drizzle-orm";

export const dynamic = "force-dynamic";

const getInitials = (name: string) =>
    name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("");

export default async function DiretoriaPage() {
    const staffMembers = await db.select().from(staff).orderBy(asc(staff.role), asc(staff.name));

    return (
        <div className="min-h-[60vh] bg-navy-950 py-20">
            <Container>
                <div className="max-w-3xl">
                    <Badge variant="accent">Bastidores</Badge>
                    <h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-cream-100 sm:text-5xl">
                        Diretoria e Staff
                    </h1>
                    <p className="mt-6 text-lg leading-relaxed text-cream-300">
                        Conheca a equipe que trabalha nos bastidores para manter o Resenha RFC organizado, competitivo e pronto para cada rodada.
                    </p>
                </div>

                <div className="mt-12 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                    {staffMembers.length > 0 ? (
                        staffMembers.map((member) => (
                            <div key={member.id} className="rounded-2xl border border-navy-800 bg-navy-900 p-6 shadow-lg">
                                <div className="flex items-start gap-4">
                                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10 font-display text-lg font-bold text-blue-300">
                                        {getInitials(member.name)}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold-300">{member.role}</p>
                                        <h2 className="mt-2 text-xl font-bold text-cream-100">{member.name}</h2>
                                        <p className="mt-2 text-sm text-cream-300">
                                            Responsavel por sustentar o dia a dia do clube e fortalecer o projeto dentro e fora de quadra.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full rounded-2xl border border-dashed border-navy-800 bg-navy-900/70 px-6 py-12 text-center text-cream-300">
                            Nenhum membro do staff foi cadastrado ainda.
                        </div>
                    )}
                </div>
            </Container>
        </div>
    );
}
