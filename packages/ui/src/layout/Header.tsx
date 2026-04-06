"use client";

import * as React from "react";
import { Menu, X } from "lucide-react";
import { cn } from "../utils/cn";
import { Container } from "./Container";
import { Button } from "../primitives/Button";

export interface NavLink {
    label: string;
    href: string;
}

export interface HeaderProps {
    logo?: React.ReactNode;
    links: NavLink[];
    currentPath?: string;
    onNavigate?: (href: string) => void;
    actionButton?: React.ReactNode;
}

export function Header({ logo, links, currentPath, onNavigate, actionButton }: HeaderProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

    // Close mobile menu when navigating
    React.useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [currentPath]);

    return (
        <header className="sticky top-0 z-40 w-full glass border-b border-cream-100/5 bg-navy-950/70">
            <Container>
                <div className="flex h-16 items-center justify-between">
                    <div className="flex items-center gap-2">
                        <a href="/" className="cursor-pointer flex items-center transition-opacity hover:opacity-80">
                            {logo || (
                                <span className="font-display text-xl font-bold text-cream-100">
                                    RESENHA<span className="text-blue-500">FC</span>
                                </span>
                            )}
                        </a>
                    </div>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-6">
                        {links.map((link) => (
                            <a
                                key={link.href}
                                href={link.href}
                                onClick={(e) => {
                                    if (onNavigate) {
                                        e.preventDefault();
                                        onNavigate(link.href);
                                    }
                                }}
                                className={cn(
                                    "text-sm font-medium transition-colors hover:text-cream-100",
                                    currentPath === link.href ? "text-cream-100" : "text-cream-300"
                                )}
                            >
                                {link.label}
                            </a>
                        ))}
                        {actionButton && <div className="ml-4">{actionButton}</div>}
                    </nav>

                    {/* Mobile Menu Button */}
                    <button
                        className="flex items-center justify-center p-2 text-cream-300 hover:text-cream-100 md:hidden"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>
            </Container>

            {/* Mobile Nav */}
            {isMobileMenuOpen && (
                <div className="md:hidden glass border-b border-cream-100/5 px-4 py-4 animate-in slide-in-from-top-2">
                    <nav className="flex flex-col space-y-4">
                        {links.map((link) => (
                            <a
                                key={link.href}
                                href={link.href}
                                onClick={(e) => {
                                    if (onNavigate) {
                                        e.preventDefault();
                                        onNavigate(link.href);
                                    }
                                }}
                                className={cn(
                                    "block text-base font-medium",
                                    currentPath === link.href ? "text-blue-400" : "text-cream-100"
                                )}
                            >
                                {link.label}
                            </a>
                        ))}
                        {actionButton && <div className="pt-4 border-t border-navy-800">{actionButton}</div>}
                    </nav>
                </div>
            )}
        </header>
    );
}
