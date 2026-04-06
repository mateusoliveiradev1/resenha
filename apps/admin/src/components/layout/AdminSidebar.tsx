"use client";

import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "@resenha/ui";

interface AdminSidebarProps {
    user: {
        name: string;
        email: string;
        role: string;
    };
    onLogout: () => void;
}

export function AdminSidebar({ user, onLogout }: AdminSidebarProps) {
    const pathname = usePathname();
    const router = useRouter();

    return (
        <Sidebar
            currentPath={pathname}
            onNavigate={(href) => router.push(href)}
            user={user}
            onLogout={onLogout}
        />
    );
}
