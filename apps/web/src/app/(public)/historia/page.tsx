import Link from "next/link";
import { Badge, Button, Card, CardContent, Container } from "@resenha/ui";

const identityPillars = [
    {
        label: "Fundacao",
        value: "2023",
        description: "Ano em que o Resenha RFC nasceu como projeto de futebol amador com identidade propria."
    },
    {
        label: "Frentes do clube",
        value: "Campo + Quadra",
        description: "O time carrega a mesma camisa, a mesma resenha e a mesma competitividade nas duas modalidades."
    },
    {
        label: "Marco recente",
        value: "3º lugar em 2025",
        description: "Pódio conquistado no campeonato de campo Pé no Chão, um resultado que já faz parte da história do clube."
    }
];

const storyMoments = [
    {
        eyebrow: "Inicio da caminhada",
        title: "O Resenha nasceu para competir e representar",
        description:
            "Desde a fundação, o clube foi pensado para ir além de reunir amigos para jogar. O Resenha RFC nasceu com identidade, senso coletivo e vontade real de construir uma trajetória que deixasse marca dentro e fora de jogo."
    },
    {
        eyebrow: "Identidade esportiva",
        title: "Um clube de campo e de quadra",
        description:
            "O Resenha RFC atua tanto no futebol de campo quanto na quadra. Essa dupla presença faz parte da sua essência: muda o espaço, muda a dinâmica, mas a camisa, a entrega e a mentalidade competitiva permanecem as mesmas."
    },
    {
        eyebrow: "Marco competitivo",
        title: "3º lugar no campeonato de campo Pé no Chão em 2025",
        description:
            "A campanha de 2025 no Pé no Chão colocou o Resenha RFC no pódio e mostrou que o clube segue amadurecendo dentro das competições. Mais do que um resultado isolado, foi um sinal claro de crescimento, consistência e ambição."
    }
];

export default function NossaHistoriaPage() {
    return (
        <div className="min-h-screen bg-navy-950 py-16 lg:py-20">
            <Container>
                <section className="relative overflow-hidden rounded-[2rem] border border-navy-800 bg-[radial-gradient(circle_at_top_left,_rgba(212,168,67,0.18),_transparent_34%),linear-gradient(180deg,rgba(10,22,40,0.97),rgba(6,14,26,1))] px-6 py-8 shadow-[0_28px_60px_rgba(0,0,0,0.24)] sm:px-8 lg:px-12 lg:py-12">
                    <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/3 bg-[radial-gradient(circle_at_center,_rgba(37,99,235,0.15),_transparent_62%)] lg:block" />
                    <div className="relative max-w-4xl">
                        <div className="flex flex-wrap gap-3">
                            <Badge variant="gold">Desde 2023</Badge>
                            <Badge variant="outline" className="border-cream-100/10 bg-navy-950/40 px-3 py-1 text-cream-100">
                                Campo e quadra
                            </Badge>
                            <Badge variant="outline" className="border-cream-100/10 bg-navy-950/40 px-3 py-1 text-cream-100">
                                Pé no Chão 2025: 3º lugar
                            </Badge>
                        </div>

                        <h1 className="mt-5 font-display text-4xl font-bold tracking-tight text-cream-100 sm:text-5xl lg:text-6xl">
                            Nossa História
                        </h1>
                        <p className="mt-5 max-w-3xl text-lg leading-8 text-cream-300">
                            O Resenha RFC nasceu da paixão pelo futebol amador, mas cresceu com algo maior: identidade, comunidade e vontade de competir de verdade.
                            Nossa história passa pelo campo, passa pela quadra e passa também pela forma como o clube representa sua camisa em cada compromisso.
                        </p>
                    </div>
                </section>

                <section className="mt-8 grid gap-4 lg:grid-cols-3">
                    {identityPillars.map((pillar) => (
                        <Card key={pillar.label} variant="glass" className="border-cream-100/8">
                            <CardContent className="p-6">
                                <p className="text-xs uppercase tracking-[0.28em] text-cream-300/60">
                                    {pillar.label}
                                </p>
                                <p className="mt-4 font-display text-3xl font-black text-cream-100">
                                    {pillar.value}
                                </p>
                                <p className="mt-3 text-sm leading-7 text-cream-300">
                                    {pillar.description}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </section>

                <section className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.95fr)]">
                    <Card variant="glass" className="border-cream-100/8">
                        <CardContent className="p-6">
                            <Badge variant="accent" className="mb-4">
                                Essência do clube
                            </Badge>
                            <h2 className="font-display text-3xl font-bold tracking-tight text-cream-100">
                                Mais do que um time, uma identidade que se sustenta em qualquer jogo
                            </h2>
                            <div className="mt-5 space-y-4 text-base leading-8 text-cream-300">
                                <p>
                                    O Resenha RFC foi fundado em 2023 com o espírito do futebol amador raiz: amizade, competitividade, presença de bairro e vontade de fazer tudo com mais organização e mais personalidade.
                                </p>
                                <p>
                                    Desde o começo, o clube não se limitou a uma modalidade. O Resenha se movimenta no futebol de campo e também na quadra, levando a mesma postura competitiva para contextos diferentes e reforçando que sua identidade não depende do formato do jogo.
                                </p>
                                <p>
                                    Essa história continua sendo escrita a cada temporada, mas alguns marcos já merecem ficar registrados. Entre eles está a campanha de 2025 no campeonato de campo Pé no Chão, encerrada com o 3º lugar e com um sinal claro de que o clube segue evoluindo.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card variant="glass" className="border-cream-100/8">
                        <CardContent className="p-6">
                            <Badge variant="outline" className="mb-4 border-cream-100/10 bg-navy-950/40 text-cream-100">
                                Marco de 2025
                            </Badge>
                            <h2 className="font-display text-3xl font-bold tracking-tight text-cream-100">
                                Pé no Chão entrou para a trajetória do Resenha
                            </h2>
                            <p className="mt-4 text-base leading-8 text-cream-300">
                                O 3º lugar no campeonato de campo Pé no Chão, em 2025, representa um ponto importante da caminhada do clube. Não como título oficial, mas como campanha que consolidou competitividade, presença e capacidade de disputar em nível forte.
                            </p>

                            <div className="mt-6 rounded-[1.75rem] border border-dashed border-cream-100/10 bg-navy-950/45 p-5">
                                <p className="text-xs uppercase tracking-[0.28em] text-cream-300/60">
                                    Leitura institucional
                                </p>
                                <p className="mt-3 font-display text-2xl font-bold text-cream-100">
                                    Pódio que reforça crescimento
                                </p>
                                <p className="mt-3 text-sm leading-7 text-cream-300">
                                    Esse resultado ajuda a contar a história recente do clube e mostra que o Resenha RFC está construindo memória competitiva no campo sem perder a sua força também na quadra.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                <section className="mt-12">
                    <div className="mb-6 max-w-3xl">
                        <Badge variant="outline" className="mb-4 border-cream-100/10 bg-navy-950/40 text-cream-100">
                            Linha da caminhada
                        </Badge>
                        <h2 className="font-display text-3xl font-bold tracking-tight text-cream-100 sm:text-4xl">
                            Três pontos que ajudam a entender o clube hoje
                        </h2>
                        <p className="mt-3 text-base leading-7 text-cream-300">
                            A história do Resenha RFC ainda está no começo, mas já tem pilares bem definidos: origem com identidade, presença esportiva em duas frentes e um marco competitivo relevante em 2025.
                        </p>
                    </div>

                    <div className="grid gap-4 xl:grid-cols-3">
                        {storyMoments.map((moment) => (
                            <Card key={moment.title} variant="glass" className="border-cream-100/8">
                                <CardContent className="p-6">
                                    <p className="text-xs uppercase tracking-[0.28em] text-gold-300">
                                        {moment.eyebrow}
                                    </p>
                                    <h3 className="mt-4 font-display text-2xl font-bold text-cream-100">
                                        {moment.title}
                                    </h3>
                                    <p className="mt-4 text-sm leading-7 text-cream-300">
                                        {moment.description}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>

                <section className="mt-12 flex flex-col gap-4 rounded-[2rem] border border-cream-100/8 bg-navy-900/65 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
                    <div className="max-w-2xl">
                        <p className="text-xs uppercase tracking-[0.28em] text-cream-300/60">
                            A história segue em movimento
                        </p>
                        <h2 className="mt-3 font-display text-2xl font-bold text-cream-100">
                            O Resenha continua escrevendo seus próximos capítulos no campo e na quadra
                        </h2>
                        <p className="mt-3 text-sm leading-7 text-cream-300">
                            Cada temporada amplia a memória do clube. O que hoje é marco, amanhã pode virar referência para novas campanhas, novos pódios e novas conquistas.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <Button asChild variant="outline" size="lg" className="border-cream-100/10 bg-navy-950/45">
                            <Link href="/galeria">Ver galeria</Link>
                        </Button>
                        <Button asChild size="lg">
                            <Link href="/jogos">Ver jogos</Link>
                        </Button>
                    </div>
                </section>
            </Container>
        </div>
    );
}
