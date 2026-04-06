import { notFound } from "next/navigation";
import { db } from "@resenha/db";
import { sponsors } from "@resenha/db/schema";
import { eq } from "drizzle-orm";
import { EditarPatrocinadorForm } from "./EditarPatrocinadorForm";

export default async function EditarPatrocinadorPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const sponsorData = await db.query.sponsors.findFirst({
        where: eq(sponsors.id, id),
    });

    if (!sponsorData) {
        notFound();
    }

    return <EditarPatrocinadorForm sponsor={sponsorData} />;
}
