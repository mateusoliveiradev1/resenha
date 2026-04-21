import * as React from "react";
import Link from "next/link";
import { Container } from "./Container";
import { Instagram, Twitter, Youtube, Facebook, ArrowRight } from "lucide-react";
import Image from "next/image";
import { Button } from "../primitives/Button";

export function Footer() {
    const currentYear = new Date().getFullYear();
    const navigationLinks = [
        { label: "Inicio", href: "/" },
        { label: "Elenco", href: "/elenco" },
        { label: "Jogos", href: "/jogos" },
        { label: "Estatisticas", href: "/estatisticas" },
        { label: "Blog", href: "/blog" },
        { label: "Patrocinadores", href: "/patrocinadores" }
    ];
    const institutionalLinks = [
        { label: "Nossa historia", href: "/historia" },
        { label: "Diretoria", href: "/diretoria" },
        { label: "Titulos", href: "/titulos" },
        { label: "Contato", href: "/contato" }
    ];
    const supportLinks = [
        { label: "Apoiar o Resenha", href: "/apoiar-o-resenha", journey: "support" },
        { label: "Seja parceiro", href: "/seja-parceiro", journey: "commercial" },
        { label: "Patrocinadores oficiais", href: "/patrocinadores", journey: "commercial" },
        { label: "Contato", href: "/contato", journey: "support" }
    ];
    const legalLinks = [
        { label: "Politica de Privacidade", href: "/politica-de-privacidade" },
        { label: "Termos de Uso", href: "/termos-de-uso" },
        { label: "Area Restrita", href: "/area-restrita", accent: true }
    ];

    return (
        <footer className="relative mt-auto overflow-hidden border-t border-navy-800/60 bg-navy-950">
            <div className="absolute left-1/2 top-0 h-[1px] w-full max-w-4xl -translate-x-1/2 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
            <div className="absolute left-1/2 top-0 h-[400px] w-[800px] -translate-x-1/2 rounded-full bg-blue-600/5 blur-[120px] pointer-events-none" />

            <Container className="relative z-10 pt-20 pb-12">
                <div className="grid grid-cols-1 gap-12 md:grid-cols-12 lg:gap-8">
                    <div className="flex flex-col items-start md:col-span-4 lg:col-span-5">
                        <div className="mb-6 flex items-center gap-4">
                            <div className="relative h-12 w-12">
                                <Image src="/logo2.png" alt="Resenha FC" fill sizes="48px" className="object-contain drop-shadow-md" />
                            </div>
                            <span className="font-display text-2xl font-black tracking-tight text-white">
                                RESENHA<span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">FC</span>
                            </span>
                        </div>

                        <span className="mb-4 rounded-full border border-gold-400/20 bg-gold-400/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-gold-400">
                            Fundado em 2023
                        </span>

                        <p className="mb-8 max-w-sm text-sm font-light leading-relaxed text-cream-300/80">
                            Mais que um clube, uma irmandade. O Resenha RFC nasceu em 2023 para transformar competitividade, resenha e comunidade em uma identidade propria dentro das quatro linhas.
                        </p>

                        <div className="flex items-center gap-4">
                            {[
                                { icon: Instagram, href: "#", label: "Instagram" },
                                { icon: Twitter, href: "#", label: "Twitter" },
                                { icon: Youtube, href: "#", label: "YouTube" },
                                { icon: Facebook, href: "#", label: "Facebook" },
                            ].map((social) => (
                                <a
                                    key={social.label}
                                    href={social.href}
                                    aria-label={social.label}
                                    className="flex h-10 w-10 items-center justify-center rounded-full border border-navy-800 bg-navy-900 text-cream-300 transition-all duration-300 hover:border-blue-500/50 hover:bg-blue-600/20 hover:text-white group"
                                >
                                    <social.icon className="h-4 w-4 transition-transform group-hover:scale-110" />
                                </a>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-8 md:col-span-8 sm:grid-cols-2 lg:col-span-7 lg:grid-cols-4">
                        <div>
                            <h3 className="mb-6 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-navy-400">
                                <span className="h-2 w-2 rounded-sm bg-blue-500/50" />
                                Navegacao
                            </h3>
                            <ul className="space-y-4">
                                {navigationLinks.map((item) => (
                                    <li key={item.label}>
                                        <Link href={item.href} className="inline-block text-sm text-cream-300 transition-colors duration-300 hover:translate-x-1 hover:text-blue-400">
                                            {item.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h3 className="mb-6 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-navy-400">
                                <span className="h-2 w-2 rounded-sm bg-gold-500/50" />
                                Institucional
                            </h3>
                            <ul className="space-y-4">
                                {institutionalLinks.map((item) => (
                                    <li key={item.label}>
                                        <Link href={item.href} className="inline-block text-sm text-cream-300 transition-colors duration-300 hover:translate-x-1 hover:text-gold-400">
                                            {item.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h3 className="mb-6 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-navy-400">
                                <span className="h-2 w-2 rounded-sm bg-blue-500/50" />
                                Apoio e parcerias
                            </h3>
                            <ul className="space-y-4">
                                {supportLinks.map((item) => (
                                    <li key={item.label}>
                                        <Link
                                            href={item.href}
                                            className="inline-block text-sm text-cream-300 transition-colors duration-300 hover:translate-x-1 hover:text-blue-400"
                                            data-monetization-event="cta_click"
                                            data-label={item.label}
                                            data-journey={item.journey}
                                            data-source="footer_links"
                                            data-destination={item.href}
                                        >
                                            {item.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="sm:col-span-2 lg:col-span-1">
                            <h3 className="mb-6 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-navy-400">
                                <span className="h-2 w-2 rounded-sm bg-gold-500/50" />
                                Vamos conversar
                            </h3>
                            <div className="rounded-2xl border border-navy-800 bg-navy-900/80 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                                <p className="text-xs leading-relaxed text-cream-300/85">
                                    Quer fortalecer o clube? O apoio ajuda a rotina esportiva. Quer divulgar sua empresa no site? A parceria comercial comeca em um formato simples.
                                </p>
                                <div className="mt-5 space-y-3">
                                    <Button
                                        asChild
                                        size="md"
                                        className="group min-h-12 w-full rounded-xl border border-blue-400/25 bg-blue-600 px-4 text-sm text-cream-100 shadow-[0_16px_36px_rgba(30,77,140,0.32)] hover:-translate-y-0.5 hover:bg-blue-500 sm:text-base"
                                    >
                                        <Link
                                            href="/seja-parceiro"
                                            data-monetization-event="cta_click"
                                            data-label="Divulgar minha empresa"
                                            data-journey="commercial"
                                            data-source="footer_card"
                                            data-destination="/seja-parceiro"
                                        >
                                            Divulgar minha empresa
                                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                        </Link>
                                    </Button>
                                    <Link
                                        href="/apoiar-o-resenha"
                                        className="inline-flex text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-300 transition-colors hover:text-gold-200"
                                        data-monetization-event="cta_click"
                                        data-label="Apoiar o Resenha"
                                        data-journey="support"
                                        data-source="footer_card"
                                        data-destination="/apoiar-o-resenha"
                                    >
                                        Apoiar o Resenha
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-16 flex flex-col items-center justify-between gap-6 border-t border-navy-800/50 pt-8 md:flex-row">
                    <div className="text-center md:text-left">
                        <span className="text-xs font-medium text-cream-300/60">
                            &copy; {currentYear} Resenha FC. Fundado em 2023 e construido por fanaticos do clube.
                        </span>
                    </div>

                    <div className="flex flex-wrap justify-center gap-6 text-xs font-medium text-cream-300/60">
                        {legalLinks.map((item) => (
                            <Link
                                key={item.label}
                                href={item.href}
                                className={item.accent ? "transition-colors hover:text-blue-400" : "transition-colors hover:text-cream-100"}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>
                </div>
            </Container>
        </footer>
    );
}
