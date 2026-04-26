import { Badge, Card } from "@resenha/ui";
import { Inbox, LineChart, MessageCircle, MousePointerClick } from "lucide-react";

const statIcons = [Inbox, MessageCircle, MousePointerClick, LineChart];

export default function LeadsLoading() {
    return (
        <div className="space-y-6">
            <div>
                <Badge variant="accent">Fase 2</Badge>
                <div className="mt-4 h-9 w-64 animate-pulse rounded-md bg-navy-800" />
                <div className="mt-3 h-4 max-w-2xl animate-pulse rounded-md bg-navy-800" />
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {statIcons.map((Icon, index) => (
                    <Card key={index} className="border-navy-800 bg-navy-900/90 p-5">
                        <div className="flex items-start justify-between gap-4">
                            <div className="w-full">
                                <div className="h-4 w-24 animate-pulse rounded-md bg-navy-800" />
                                <div className="mt-3 h-8 w-16 animate-pulse rounded-md bg-navy-800" />
                            </div>
                            <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-3 text-blue-300">
                                <Icon className="h-5 w-5" />
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            <div className="rounded-xl border border-navy-800 bg-navy-900/90 p-4">
                <div className="grid gap-3 lg:grid-cols-[minmax(220px,1.4fr)_repeat(4,minmax(130px,1fr))_auto]">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <div key={index} className="h-10 animate-pulse rounded-md bg-navy-800" />
                    ))}
                </div>
            </div>

            <div className="hidden overflow-hidden rounded-xl border border-navy-800 bg-navy-900 md:block">
                {Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="grid grid-cols-6 gap-4 border-b border-navy-800 px-6 py-4 last:border-b-0">
                        {Array.from({ length: 6 }).map((__, cellIndex) => (
                            <div key={cellIndex} className="h-4 animate-pulse rounded-md bg-navy-800" />
                        ))}
                    </div>
                ))}
            </div>

            <div className="space-y-3 md:hidden">
                {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="rounded-xl border border-navy-800 bg-navy-950/70 p-4">
                        <div className="h-5 w-2/3 animate-pulse rounded-md bg-navy-800" />
                        <div className="mt-3 h-4 w-1/2 animate-pulse rounded-md bg-navy-800" />
                        <div className="mt-4 h-16 animate-pulse rounded-md bg-navy-800" />
                    </div>
                ))}
            </div>
        </div>
    );
}
