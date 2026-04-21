"use client";

import { motion } from "framer-motion";
import { Button, Container } from "@resenha/ui";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarClock, Camera, Newspaper } from "lucide-react";

const pillars = [
    {
        title: "Agenda viva",
        description: "Jogos, resultados e historico sempre no radar.",
        icon: CalendarClock
    },
    {
        title: "Diario do clube",
        description: "Noticias, cronicas e bastidores publicados no ritmo da resenha.",
        icon: Newspaper
    },
    {
        title: "Memoria visual",
        description: "Galeria atualizada com o campo, a resenha e o extracampo.",
        icon: Camera
    }
];

export function HeroSection() {
    return (
        <section className="relative overflow-hidden bg-navy-950 pb-24 pt-16 sm:pt-20 lg:pb-32 lg:pt-24">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff06_1px,transparent_1px),linear-gradient(to_bottom,#ffffff06_1px,transparent_1px)] bg-[size:40px_40px]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.22),transparent_42%),radial-gradient(circle_at_bottom_right,_rgba(212,168,67,0.14),transparent_30%)]" />
            <div className="pointer-events-none absolute right-[-10%] top-[-10%] h-[420px] w-[420px] rounded-full bg-blue-500/12 blur-[130px]" />

            <Container className="relative z-10">
                <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-center xl:grid-cols-[minmax(0,1fr)_400px]">
                    <div>
                        <motion.div
                            initial={{ y: 16, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.45 }}
                            className="flex flex-wrap items-center gap-2"
                        >
                            <span className="rounded-full border border-blue-500/25 bg-blue-500/10 px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.34em] text-blue-300">
                                Fundado em 2023
                            </span>
                            <span className="rounded-full border border-cream-100/8 bg-navy-900/85 px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.34em] text-cream-300">
                                Portal oficial do clube
                            </span>
                        </motion.div>

                        <motion.div
                            initial={{ y: 18, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.08, duration: 0.5 }}
                            className="mt-8"
                        >
                            <p className="text-[0.75rem] font-semibold uppercase tracking-[0.4em] text-cream-300/70">
                                Futebol amador com identidade
                            </p>
                            <h1 className="mt-5 max-w-4xl font-display text-5xl font-black leading-[0.95] tracking-[-0.04em] text-cream-100 sm:text-6xl lg:text-7xl xl:text-[5.2rem]">
                                O campo, o bairro
                                <span className="mt-2 block text-blue-400">e a resenha no mesmo escudo.</span>
                            </h1>
                            <p className="mt-6 max-w-2xl text-lg leading-8 text-cream-300 sm:text-xl">
                                O Resenha RFC transforma jogo em memoria, parceria em presenca e conteudo em identidade.
                                Aqui o clube fala com voz propria.
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ y: 18, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.16, duration: 0.5 }}
                            className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap"
                        >
                            <Button size="lg" className="group h-14 rounded-full bg-cream-100 px-8 text-base font-bold text-navy-950 hover:bg-white" asChild>
                                <Link href="/elenco">
                                    Ver elenco
                                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                                </Link>
                            </Button>
                            <Button variant="outline" size="lg" className="h-14 rounded-full border-cream-100/15 bg-navy-950/60 px-8 text-base font-bold text-cream-100 hover:bg-navy-900" asChild>
                                <Link href="/jogos">
                                    Agenda do clube
                                    <CalendarClock className="ml-2 h-5 w-5" />
                                </Link>
                            </Button>
                        </motion.div>

                        <motion.div
                            initial={{ y: 18, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.24, duration: 0.55 }}
                            className="mt-10 grid gap-3 md:grid-cols-3"
                        >
                            {pillars.map(({ title, description, icon: Icon }) => (
                                <div
                                    key={title}
                                    className="rounded-[24px] border border-cream-100/7 bg-[linear-gradient(180deg,rgba(15,31,56,0.88),rgba(6,14,26,0.96))] p-5 shadow-[0_18px_45px_rgba(0,0,0,0.16)]"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-blue-500/18 bg-blue-500/10 text-blue-300">
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cream-100">
                                            {title}
                                        </p>
                                    </div>
                                    <p className="mt-4 text-sm leading-7 text-cream-300">
                                        {description}
                                    </p>
                                </div>
                            ))}
                        </motion.div>
                    </div>

                    <motion.div
                        initial={{ y: 24, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.14, duration: 0.6 }}
                        className="relative mx-auto w-full max-w-[400px]"
                    >
                        <div className="absolute inset-x-[10%] top-10 h-40 rounded-full bg-blue-500/18 blur-[80px]" />
                        <div className="relative overflow-hidden rounded-[34px] border border-cream-100/8 bg-[linear-gradient(180deg,rgba(12,28,49,0.95),rgba(6,14,26,1))] p-5 shadow-[0_28px_90px_rgba(0,0,0,0.28)]">
                            <div className="flex items-start justify-between gap-4 border-b border-cream-100/7 pb-4">
                                <div>
                                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.34em] text-blue-300/90">
                                        Resenha RFC
                                    </p>
                                    <p className="mt-2 font-display text-2xl font-bold text-cream-100">
                                        Clube em campo e em conteudo
                                    </p>
                                </div>
                                <span className="rounded-full border border-gold-400/35 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-gold-400">
                                    2023
                                </span>
                            </div>

                            <div className="relative mt-6 aspect-[4/5] overflow-hidden rounded-[28px] border border-blue-500/15 bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.24),rgba(10,22,40,0.3)_48%,rgba(6,14,26,0.94)_72%)]">
                                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:26px_26px] opacity-55" />
                                <div className="absolute inset-0 flex items-center justify-center p-8">
                                    <div className="relative h-full w-full">
                                        <Image
                                            src="/logo2.png"
                                            alt="Escudo Resenha RFC"
                                            fill
                                            sizes="(max-width: 1024px) 70vw, 360px"
                                            className="object-contain drop-shadow-[0_0_34px_rgba(59,130,246,0.36)]"
                                            priority
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-5 grid gap-3 sm:grid-cols-3">
                                <div className="rounded-2xl border border-cream-100/7 bg-navy-950/75 px-4 py-3">
                                    <p className="text-[0.65rem] font-semibold uppercase tracking-[0.26em] text-cream-300/60">Frente</p>
                                    <p className="mt-2 text-sm font-medium text-cream-100">Calendario</p>
                                </div>
                                <div className="rounded-2xl border border-cream-100/7 bg-navy-950/75 px-4 py-3">
                                    <p className="text-[0.65rem] font-semibold uppercase tracking-[0.26em] text-cream-300/60">Meio</p>
                                    <p className="mt-2 text-sm font-medium text-cream-100">Conteudo</p>
                                </div>
                                <div className="rounded-2xl border border-cream-100/7 bg-navy-950/75 px-4 py-3">
                                    <p className="text-[0.65rem] font-semibold uppercase tracking-[0.26em] text-cream-300/60">Fora dele</p>
                                    <p className="mt-2 text-sm font-medium text-cream-100">Comunidade</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </Container>
        </section>
    );
}
