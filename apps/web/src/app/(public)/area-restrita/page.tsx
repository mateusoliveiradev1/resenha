import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminLoginUrl } from "@/lib/adminAppUrl";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
    title: "Área Restrita",
    description: "Acesso administrativo do Resenha RFC.",
    path: "/area-restrita",
    noIndex: true
});

export default function AreaRestritaPage() {
    redirect(getAdminLoginUrl());
}
