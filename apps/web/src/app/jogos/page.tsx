import { db } from "@resenha/db";
import { matches } from "@resenha/db/schema";
import { desc } from "drizzle-orm";
import { JogosClient } from "./JogosClient";

export const dynamic = "force-dynamic";

export default async function JogosPage() {
    const matchList = await db.select().from(matches).orderBy(desc(matches.date));
    return <JogosClient matches={matchList} />;
}
