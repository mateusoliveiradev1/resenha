import * as React from "react";
import { notFound } from "next/navigation";
import { db } from "@resenha/db";
import { players } from "@resenha/db/schema";
import { eq } from "drizzle-orm";
import { EditarJogadorForm } from "./EditarJogadorForm";

export default async function EditarJogadorPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    // Fetch real player data
    const playerData = await db.query.players.findFirst({
        where: eq(players.id, id),
    });

    if (!playerData) {
        notFound();
    }

    return <EditarJogadorForm player={playerData} />;
}
