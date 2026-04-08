import { notFound } from "next/navigation";
import { db } from "@resenha/db";
import { clubs } from "@resenha/db/schema";
import { eq } from "drizzle-orm";
import { EditClubForm } from "./EditClubForm";

export const dynamic = "force-dynamic";

export default async function EditClubPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const club = await db.query.clubs.findFirst({
        where: eq(clubs.id, id),
    });

    if (!club) {
        notFound();
    }

    return <EditClubForm club={club} />;
}
