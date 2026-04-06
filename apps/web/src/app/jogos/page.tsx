import type { Metadata } from "next";
import { db } from "@resenha/db";
import { matches } from "@resenha/db/schema";
import { desc } from "drizzle-orm";
import { JogosClient } from "./JogosClient";
import { createPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = createPageMetadata({
    title: "Jogos",
    description:
        "Acompanhe os jogos do Resenha RFC com agenda, resultados e histórico de partidas de futebol de campo e futsal.",
    path: "/jogos",
    keywords: ["jogos", "agenda", "resultados", "histórico", "futsal", "campo"]
});

export default async function JogosPage() {
    const matchList = await db.select().from(matches).orderBy(desc(matches.date));
    return <JogosClient matches={matchList} />;
}
