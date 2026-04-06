"use client";

import * as React from "react";
import { cn } from "../utils/cn";
import {
    CalendarDays,
    FileText,
    Handshake,
    Image as ImageIcon,
    LayoutDashboard,
    LogOut,
    Settings,
    Shield,
    Users,
    X
} from "lucide-react";

export interface SidebarItem {
    icon: React.ElementType;
    label: string;
    href: string;
}

export interface SidebarProps {
    currentPath?: string;
    onNavigate?: (href: string) => void;
    onLogout?: () => void;
    logo?: React.ReactNode;
    user?: {
        name: string;
        email: string;
        role: string;
    };
}

export const adminNavItems: SidebarItem[] = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/" },
    { icon: Users, label: "Jogadores", href: "/jogadores" },
    { icon: CalendarDays, label: "Partidas", href: "/partidas" },
    { icon: Handshake, label: "Patrocinadores", href: "/patrocinadores" },
    { icon: FileText, label: "Posts", href: "/posts" },
    { icon: ImageIcon, label: "Galeria", href: "/galeria" },
    { icon: Settings, label: "Configuracoes", href: "/configuracoes" },
];

export function Sidebar({ currentPath, onNavigate, onLogout, logo, user }: SidebarProps) {
    const [isExpanded, setIsExpanded] = React.useState(false);
    const [isMobileOpen, setIsMobileOpen] = React.useState(false);

    const handleNav = (e: React.MouseEvent, href: string) => {
        e.preventDefault();
        setIsMobileOpen(false);
        onNavigate?.(href);
    };

    const userInitials = user?.name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((value) => value[0]?.toUpperCase())
        .join("") || "AD";

    React.useEffect(() => {
        setIsMobileOpen(false);
    }, [currentPath]);

    React.useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setIsMobileOpen(false);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    React.useEffect(() => {
        if (!isMobileOpen) {
            document.body.style.overflow = "";
            delete document.documentElement.dataset.adminMobileMenu;
            return;
        }

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        document.documentElement.dataset.adminMobileMenu = "open";

        return () => {
            document.body.style.overflow = previousOverflow;
            delete document.documentElement.dataset.adminMobileMenu;
        };
    }, [isMobileOpen]);

    const currentModule = adminNavItems.find((item) =>
        item.href === "/"
            ? currentPath === "/"
            : currentPath === item.href || currentPath?.startsWith(item.href + "/")
    );

    const SidebarContent = ({
        expanded,
        showCloseButton = false,
        mobile = false,
    }: {
        expanded: boolean;
        showCloseButton?: boolean;
        mobile?: boolean;
    }) => (
        <div
            className={cn(
                "flex h-full flex-col overflow-hidden text-cream-100 transition-all duration-300",
                mobile
                    ? "bg-navy-950"
                    : "rounded-[30px] border border-navy-800/90 bg-[linear-gradient(180deg,rgba(10,22,40,0.98),rgba(6,14,26,0.98))] shadow-[0_28px_60px_rgba(0,0,0,0.35)]"
            )}
        >
            <div className="relative overflow-hidden border-b border-navy-800/80 px-4 py-4">
                <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/60 to-transparent" />
                <div className={cn("flex items-start gap-3", expanded ? "justify-between" : "justify-center")}>
                    <div className={cn("flex items-center gap-3 overflow-hidden", !expanded && "justify-center")}>
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10 text-blue-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                            {logo || <Shield className="h-5 w-5" />}
                        </div>

                        {expanded && (
                            <div className="min-w-0">
                                <p className="font-display text-lg font-bold text-cream-100">
                                    Admin <span className="text-blue-400">Resenha</span>
                                </p>
                                <div className="mt-1 flex flex-wrap items-center gap-2">
                                    <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-blue-300">
                                        Painel oficial
                                    </span>
                                    <span className="rounded-full border border-gold-400/20 bg-gold-400/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-gold-400">
                                        Fundado 2023
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {showCloseButton && (
                        <button
                            type="button"
                            onClick={() => setIsMobileOpen(false)}
                            aria-label="Fechar menu"
                            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-navy-700 bg-navy-900 text-cream-100 transition-colors hover:border-blue-400/35 hover:text-blue-300"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    )}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-5">
                {expanded && (
                    <div className="mb-4 px-2">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-navy-400">
                            Navegacao
                        </p>
                    </div>
                )}

                <nav className="space-y-1.5">
                    {adminNavItems.map((item) => {
                        const isActive =
                            item.href === "/"
                                ? currentPath === "/"
                                : currentPath === item.href || currentPath?.startsWith(item.href + "/");
                        const Icon = item.icon;

                        return (
                            <a
                                key={item.href}
                                href={item.href}
                                onClick={(e) => handleNav(e, item.href)}
                                aria-label={item.label}
                                title={!expanded ? item.label : undefined}
                                className={cn(
                                    "group flex items-center gap-3 rounded-2xl border px-3 py-3 text-sm font-medium transition-all duration-200",
                                    isActive
                                        ? "border-blue-500/30 bg-blue-500/10 text-cream-100 shadow-[0_12px_30px_rgba(37,99,235,0.12)]"
                                        : "border-transparent text-cream-300 hover:border-navy-700 hover:bg-navy-900/90 hover:text-cream-100",
                                    expanded ? "justify-start" : "justify-center px-0"
                                )}
                            >
                                <div
                                    className={cn(
                                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border transition-colors",
                                        isActive
                                            ? "border-blue-500/30 bg-blue-500/10 text-blue-300"
                                            : "border-navy-800 bg-navy-950/80 text-cream-300 group-hover:border-blue-500/20 group-hover:text-blue-300"
                                    )}
                                >
                                    <Icon className="h-[18px] w-[18px]" />
                                </div>
                                {expanded && (
                                    <div className="min-w-0 flex-1">
                                        <span className="truncate">{item.label}</span>
                                        <p className="mt-0.5 text-[11px] uppercase tracking-[0.18em] text-navy-400">
                                            {item.href === "/" ? "Painel" : "Modulo"}
                                        </p>
                                    </div>
                                )}
                            </a>
                        );
                    })}
                </nav>
            </div>

            <div className="border-t border-navy-800/80 p-3">
                {user && (
                    <div
                        className={cn(
                            "mb-3 rounded-2xl border border-navy-800 bg-navy-950/70 transition-all duration-300",
                            expanded ? "p-4" : "flex items-center justify-center p-2"
                        )}
                        title={!expanded ? user.name : undefined}
                    >
                        {expanded ? (
                            <>
                                <p className="truncate text-sm font-semibold text-cream-100">{user.name}</p>
                                <p className="mt-1 truncate text-xs text-cream-300">{user.email}</p>
                                <span className="mt-3 inline-flex rounded-full border border-blue-500/20 bg-blue-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-blue-300">
                                    {user.role}
                                </span>
                            </>
                        ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10 text-xs font-bold uppercase tracking-[0.18em] text-blue-300">
                                {userInitials}
                            </div>
                        )}
                    </div>
                )}

                <button
                    onClick={() => {
                        setIsMobileOpen(false);
                        onLogout?.();
                    }}
                    title={!expanded ? "Sair do sistema" : undefined}
                    aria-label="Sair do sistema"
                    className={cn(
                        "flex w-full items-center gap-3 rounded-2xl border border-red-500/10 bg-red-500/5 px-3 py-3 text-sm font-medium text-red-300 transition-colors hover:border-red-500/20 hover:bg-red-500/10 hover:text-red-200",
                        expanded ? "justify-start" : "justify-center px-0"
                    )}
                >
                    <LogOut className="h-[18px] w-[18px] shrink-0" />
                    {expanded && <span>Sair do sistema</span>}
                </button>
            </div>
        </div>
    );

    return (
        <>
            <style>{`
                @media (max-width: 1023px) {
                    html[data-admin-mobile-menu="open"] .admin-main-shell {
                        display: none !important;
                    }
                }

                @media (hover: hover) and (pointer: fine) {
                    .admin-layout-shell {
                        min-height: 100vh !important;
                        height: 100vh !important;
                        flex-direction: row !important;
                        overflow: hidden !important;
                    }

                    .admin-main-shell {
                        padding-top: 1rem !important;
                        padding-right: 0 !important;
                        padding-bottom: 1rem !important;
                        padding-left: 0 !important;
                    }

                    .admin-mobile-header,
                    .admin-mobile-overlay {
                        display: none !important;
                    }

                    .admin-desktop-rail {
                        display: block !important;
                    }
                }
            `}</style>

            <div className="admin-mobile-header fixed inset-x-0 top-0 z-40 border-b border-navy-800/80 bg-navy-950 px-4 py-3 lg:hidden">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10 text-blue-300">
                            {logo || <Shield className="h-5 w-5" />}
                        </div>
                        <div className="min-w-0">
                            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-blue-300/85">
                                Painel oficial
                            </p>
                            <p className="truncate font-display text-lg font-bold text-cream-100">
                                {currentModule?.label ?? "Dashboard"}
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-navy-700 bg-navy-900 text-cream-100 transition-colors hover:border-blue-400/35 hover:text-blue-300"
                        onClick={() => setIsMobileOpen((value) => !value)}
                        aria-label={isMobileOpen ? "Fechar menu" : "Abrir menu"}
                    >
                        {isMobileOpen ? <X className="h-5 w-5" /> : <LayoutDashboard className="h-5 w-5" />}
                    </button>
                </div>
            </div>

            {isMobileOpen && (
                <div className="admin-mobile-overlay fixed inset-0 z-50 bg-navy-950 lg:hidden" onClick={() => setIsMobileOpen(false)}>
                    <aside
                        className="absolute inset-0"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <SidebarContent expanded showCloseButton mobile />
                    </aside>
                </div>
            )}

            <aside
                onMouseEnter={() => setIsExpanded(true)}
                onMouseLeave={() => setIsExpanded(false)}
                className={cn(
                    "admin-desktop-rail sticky top-0 hidden h-screen flex-shrink-0 px-3 py-4 transition-[width] duration-300 lg:block",
                    isExpanded ? "w-[320px]" : "w-[92px]"
                )}
            >
                <SidebarContent expanded={isExpanded} />
            </aside>
        </>
    );
}
