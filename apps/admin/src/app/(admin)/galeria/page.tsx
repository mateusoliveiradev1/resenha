import { db } from "@resenha/db";
import { gallery } from "@resenha/db/schema";
import { desc } from "drizzle-orm";
import { GaleriaAdminManager } from "./GaleriaAdminManager";

export const dynamic = "force-dynamic";

export default async function GaleriaAdminPage() {
    const photos = await db.select().from(gallery).orderBy(desc(gallery.uploadedAt));
    return <GaleriaAdminManager photos={photos} />;
}
