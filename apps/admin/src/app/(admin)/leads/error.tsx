"use client";

import { Button, Card } from "@resenha/ui";
import { AlertCircle, RotateCcw } from "lucide-react";

export default function LeadsError({
    reset
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <Card className="border-red-500/30 bg-navy-900/90 p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex gap-3">
                    <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-red-300">
                        <AlertCircle className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="font-display text-2xl text-cream-100">
                            Nao foi possivel carregar os leads.
                        </h1>
                        <p className="mt-2 text-sm text-cream-300">
                            Tente novamente ou confira a conexao do banco antes de operar a inbox.
                        </p>
                    </div>
                </div>

                <Button type="button" variant="outline" onClick={reset}>
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Recarregar
                </Button>
            </div>
        </Card>
    );
}
