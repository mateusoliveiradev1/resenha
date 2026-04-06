"use client";

import * as React from "react";
import { cn } from "../utils/cn";
import { ChevronUp, ChevronDown } from "lucide-react";

export interface Column<T> {
    header: React.ReactNode;
    accessorKey?: keyof T;
    cell?: (item: T) => React.ReactNode;
    sortable?: boolean;
}

export interface DataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    keyExtractor: (item: T) => string;
    onSort?: (key: keyof T, direction: "asc" | "desc") => void;
    isLoading?: boolean;
    emptyState?: React.ReactNode;
    onRowClick?: (item: T) => void;
}

export function DataTable<T>({
    data,
    columns,
    keyExtractor,
    onSort,
    isLoading = false,
    emptyState = "Nenhum dado encontrado.",
    onRowClick,
}: DataTableProps<T>) {
    const [sortKey, setSortKey] = React.useState<keyof T | null>(null);
    const [sortDirection, setSortDirection] = React.useState<"asc" | "desc">("asc");

    const handleSort = (key: keyof T) => {
        const isAsc = sortKey === key && sortDirection === "asc";
        const newDir = isAsc ? "desc" : "asc";
        setSortKey(key);
        setSortDirection(newDir);
        onSort?.(key, newDir);
    };

    return (
        <div className="w-full overflow-hidden rounded-xl border border-navy-800 bg-navy-900 shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-cream-100">
                    <thead className="bg-navy-950/50 text-xs uppercase text-cream-300">
                        <tr>
                            {columns.map((col, index) => (
                                <th
                                    key={index}
                                    scope="col"
                                    className={cn(
                                        "px-6 py-4 font-semibold tracking-wider",
                                        col.sortable && "cursor-pointer select-none hover:text-cream-100 transition-colors"
                                    )}
                                    onClick={() => col.sortable && col.accessorKey && handleSort(col.accessorKey)}
                                >
                                    <div className="flex items-center gap-1">
                                        {col.header}
                                        {col.sortable && col.accessorKey === sortKey && (
                                            <span className="text-blue-400">
                                                {sortDirection === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                                            </span>
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-navy-800">
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <tr key={`skeleton-${i}`} className="animate-pulse bg-navy-900/50">
                                    {columns.map((_, colIndex) => (
                                        <td key={colIndex} className="px-6 py-4">
                                            <div className="h-4 w-2/3 rounded bg-navy-800"></div>
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : data.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} className="px-6 py-12 text-center text-cream-300">
                                    {emptyState}
                                </td>
                            </tr>
                        ) : (
                            data.map((item) => (
                                <tr
                                    key={keyExtractor(item)}
                                    onClick={() => onRowClick?.(item)}
                                    className={cn(
                                        "transition-colors hover:bg-navy-800/50",
                                        onRowClick && "cursor-pointer"
                                    )}
                                >
                                    {columns.map((col, index) => (
                                        <td key={index} className="whitespace-nowrap px-6 py-4">
                                            {col.cell
                                                ? col.cell(item)
                                                : col.accessorKey
                                                    ? (item[col.accessorKey] as React.ReactNode)
                                                    : null}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
