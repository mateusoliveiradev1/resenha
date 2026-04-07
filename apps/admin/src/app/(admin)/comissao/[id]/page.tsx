import { notFound } from "next/navigation";
import { db } from "@resenha/db";
import { staff } from "@resenha/db/schema";
import { eq } from "drizzle-orm";
import { EditarMembroComissaoForm } from "./EditarMembroComissaoForm";

export default async function EditarMembroComissaoPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const staffMember = await db.query.staff.findFirst({
        where: eq(staff.id, id),
    });

    if (!staffMember) {
        notFound();
    }

    return <EditarMembroComissaoForm member={staffMember} />;
}
