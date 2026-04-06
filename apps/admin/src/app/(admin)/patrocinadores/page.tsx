import { Button } from "@resenha/ui";
import { db } from "@resenha/db";
import { sponsors } from "@resenha/db/schema";
import { asc } from "drizzle-orm";
import { Plus } from "lucide-react";
import Link from "next/link";
import { PatrocinadoresTable } from "./PatrocinadoresTable";

export default async function PatrocinadoresListPage() {
    const sponsorsData = await db
        .select()
        .from(sponsors)
        .orderBy(asc(sponsors.displayOrder), asc(sponsors.name));

    return (
        <div className="space-y-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="font-display text-3xl font-bold tracking-tight text-cream-100">
                        Patrocinadores
                    </h1>
                    <p className="mt-2 max-w-2xl text-sm text-cream-300">
                        Gerencie os parceiros que aparecem na pagina institucional e na faixa de logos da home publica.
                    </p>
                </div>
                <Link href="/patrocinadores/novo" className="shrink-0">
                    <Button variant="primary">
                        <Plus className="mr-2 h-4 w-4" />
                        Novo Patrocinador
                    </Button>
                </Link>
            </div>

            <PatrocinadoresTable data={sponsorsData} />
        </div>
    );
}
