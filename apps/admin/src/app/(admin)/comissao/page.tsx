import Link from "next/link";
import { Button } from "@resenha/ui";
import { db } from "@resenha/db";
import { staff } from "@resenha/db/schema";
import { asc, desc } from "drizzle-orm";
import { Plus } from "lucide-react";
import { ComissaoTable } from "./ComissaoTable";

export default async function ComissaoListPage() {
    const staffMembers = await db
        .select()
        .from(staff)
        .orderBy(desc(staff.isActive), asc(staff.displayOrder), asc(staff.role), asc(staff.name));

    return (
        <div className="space-y-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="font-display text-3xl font-bold tracking-tight text-cream-100">
                        Comissao
                    </h1>
                    <p className="mt-2 max-w-2xl text-sm text-cream-300">
                        Gerencie a diretoria e a comissao tecnica exibidas na pagina publica de diretoria.
                    </p>
                </div>
                <Link href="/comissao/novo" className="shrink-0">
                    <Button variant="primary">
                        <Plus className="mr-2 h-4 w-4" />
                        Novo Membro
                    </Button>
                </Link>
            </div>

            <ComissaoTable data={staffMembers} />
        </div>
    );
}
