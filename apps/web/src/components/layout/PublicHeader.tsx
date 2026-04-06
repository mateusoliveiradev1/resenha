"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button, Container, cn } from "@resenha/ui";
import { CalendarClock, Handshake, Menu, X } from "lucide-react";

const navLinks = [
    { label: "Inicio", href: "/" },
    { label: "Elenco", href: "/elenco" },
    { label: "Jogos", href: "/jogos" },
    { label: "Estatisticas", href: "/estatisticas" },
    { label: "Blog", href: "/blog" },
    { label: "Galeria", href: "/galeria" },
    { label: "Patrocinadores", href: "/patrocinadores" }
];

const utilityChips = ["Fundado em 2023", "Portal oficial", "Futebol amador com identidade"];

export function PublicHeader() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = React.useState(false);

    React.useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    return (
        <header className="sticky top-0 z-50 border-b border-cream-100/6 bg-navy-950/88 backdrop-blur-xl">
            <div className="border-b border-cream-100/6 bg-navy-900/55">
                <Container className="flex min-h-10 flex-wrap items-center justify-between gap-3 py-2">
                    <div className="flex flex-wrap items-center gap-2 text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-cream-300/75">
                        {utilityChips.map((chip) => (
                            <span key={chip} className="rounded-full border border-cream-100/8 bg-navy-950/70 px-2.5 py-1">
                                {chip}
                            </span>
                        ))}
                    </div>

                    <Link
                        href="/patrocinadores"
                        className="hidden text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-blue-300 transition-colors hover:text-blue-200 md:inline-flex"
                    >
                        Ver parceiros oficiais
                    </Link>
                </Container>
            </div>

            <Container className="py-3">
                <div className="flex items-center justify-between gap-4">
                    <Link href="/" className="group flex min-w-0 items-center gap-3">
                        <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-blue-500/20 bg-[linear-gradient(180deg,rgba(37,99,235,0.18),rgba(10,22,40,0.95))] shadow-[0_12px_30px_rgba(37,99,235,0.16)]">
                            <Image
                                src="/logo2.png"
                                alt="Resenha RFC Logo"
                                fill
                                sizes="48px"
                                className="object-contain p-2"
                                priority
                            />
                        </div>

                        <div className="min-w-0">
                            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.34em] text-blue-300/85">
                                Portal oficial
                            </p>
                            <p className="truncate font-display text-xl font-bold tracking-tight text-cream-100 transition-colors group-hover:text-blue-300">
                                Resenha RFC
                            </p>
                        </div>
                    </Link>

                    <nav className="hidden items-center gap-2 lg:flex">
                        {navLinks.map((link) => {
                            const isActive = pathname === link.href;

                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={cn(
                                        "rounded-full px-3 py-2 text-sm font-medium transition-all",
                                        isActive
                                            ? "bg-blue-500/12 text-cream-100 ring-1 ring-blue-400/25"
                                            : "text-cream-300 hover:bg-navy-900 hover:text-cream-100"
                                    )}
                                >
                                    {link.label}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="hidden items-center gap-3 lg:flex">
                        <Button variant="outline" className="rounded-full border-navy-700 bg-transparent px-5 text-cream-100 hover:bg-navy-900" asChild>
                            <Link href="/jogos">
                                Agenda
                                <CalendarClock className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                        <Button className="rounded-full px-5 shadow-[0_0_24px_rgba(37,99,235,0.24)]" asChild>
                            <Link href="/patrocinadores">
                                Parcerias
                                <Handshake className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </div>

                    <button
                        type="button"
                        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-navy-700 bg-navy-900 text-cream-100 transition-colors hover:border-blue-400/35 hover:text-blue-300 lg:hidden"
                        onClick={() => setIsOpen((value) => !value)}
                        aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
                    >
                        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </div>
            </Container>

            {isOpen && (
                <div className="border-t border-cream-100/6 bg-navy-950/96 lg:hidden">
                    <Container className="space-y-5 py-5">
                        <nav className="grid gap-2">
                            {navLinks.map((link) => {
                                const isActive = pathname === link.href;

                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={cn(
                                            "rounded-2xl border px-4 py-3 text-sm font-medium transition-all",
                                            isActive
                                                ? "border-blue-500/30 bg-blue-500/10 text-cream-100"
                                                : "border-navy-800 bg-navy-900/70 text-cream-300 hover:border-blue-500/20 hover:text-cream-100"
                                        )}
                                    >
                                        {link.label}
                                    </Link>
                                );
                            })}
                        </nav>

                        <div className="grid gap-3 sm:grid-cols-2">
                            <Button variant="outline" className="h-11 rounded-full border-navy-700 bg-transparent text-cream-100 hover:bg-navy-900" asChild>
                                <Link href="/jogos">
                                    Agenda
                                    <CalendarClock className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                            <Button className="h-11 rounded-full shadow-[0_0_24px_rgba(37,99,235,0.24)]" asChild>
                                <Link href="/patrocinadores">
                                    Parcerias
                                    <Handshake className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                    </Container>
                </div>
            )}
        </header>
    );
}
