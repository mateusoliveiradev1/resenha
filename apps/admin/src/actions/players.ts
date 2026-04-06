"use server";

import { revalidatePath } from "next/cache";
import { CreatePlayerSchema, type CreatePlayerInput, UpdatePlayerSchema, type UpdatePlayerInput } from "@resenha/validators";
// import { db, players } from "@resenha/db";

export async function createPlayer(data: CreatePlayerInput) {
    const parsed = CreatePlayerSchema.parse(data);
    // await db.insert(players).values(parsed);
    revalidatePath("/jogadores");
    return { success: true };
}

export async function updatePlayer(id: string, data: UpdatePlayerInput) {
    const parsed = UpdatePlayerSchema.parse(data);
    // await db.update(players).set(parsed).where(eq(players.id, id));
    revalidatePath("/jogadores");
    return { success: true };
}

export async function deletePlayer(id: string) {
    // await db.delete(players).where(eq(players.id, id));
    revalidatePath("/jogadores");
    return { success: true };
}
