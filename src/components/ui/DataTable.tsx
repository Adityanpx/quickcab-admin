"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { TableRowSkeleton } from "@/components/ui/SkeletonLoader";
import { EmptyState } from "@/components/ui/EmptyState";

// ─── Types ────────────────────────────────────────────────

export interface Column<T> {
  key: keyof T | string;
  header: string;
  sortable?: boolean;
  width?: string;
  align?: "left" | "center" | "right";
  render?: (value: unknown, row: T, index: number) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  rowKey: keyof T | ((row: T) => string | number);
  pageSize?: number;
  showPagination?: boolean;
  emptyMessage?: string;
  emptyDescription?: string;
  className?: string;
  onRowClick?: (row: T) => void;
}

type SortDir = "asc" | "desc" | null;

// ─── Sort Icon ────────────────────────────────────────────

function SortIcon({ dir }: { dir: SortDir }) {
  if (dir === "asc")
    return <ChevronUp size={13} className="text-brand-purple" />;
  if (dir === "desc")
    return <ChevronDown size={13} className="text-brand-purple" />;
  return <ChevronsUpDown size={13} className="opacity-30" />;
}

// ─── DataTable ────────────────────────────────────────────

export function DataTable<T extends object>({
  columns,
  data,
  isLoading = false,
  rowKey,
  pageSize = 10,
  showPagination = true,
  emptyMessage = "No data found",
  emptyDescription,
  className,
  onRowClick,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);
  const [page, setPage] = useState(1);

  // ── Sorting ──────────────────────────────────────────────
  const handleSort = (key: string) => {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir("asc");
    } else if (sortDir === "asc") {
      setSortDir("desc");
    } else {
      setSortKey(null);
      setSortDir(null);
    }
    setPage(1);
  };

  const sortedData = useMemo(() => {
    if (!sortKey || !sortDir) return data;
    return [...data].sort((a, b) => {
      const av = (a as Record<string, unknown>)[sortKey];
      const bv = (b as Record<string, unknown>)[sortKey];
      if (av == null) return 1;
      if (bv == null) return -1;
      const cmp =
        typeof av === "number" && typeof bv === "number"
          ? av - bv
          : String(av).localeCompare(String(bv), undefined, { numeric: true });
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [data, sortKey, sortDir]);

  // ── Pagination ───────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginated = showPagination
    ? sortedData.slice((safePage - 1) * pageSize, safePage * pageSize)
    : sortedData;

  const getRowKey = (row: T, i: number): string | number => {
    if (typeof rowKey === "function") return rowKey(row);
    const v = (row as Record<string, unknown>)[rowKey as string];
    return v != null ? (v as string | number) : i;
  };

  const alignClass: Record<string, string> = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  };

  return (
    <div className={cn("flex flex-col gap-0", className)}>
      {/* ── Table ──────────────────────────────────────── */}
      <div className="overflow-x-auto rounded-xl border border-light-border dark:border-dark-border">
        <table className="table-base w-full">
          <thead>
            <tr>
              {columns.map((col) => {
                const key = String(col.key);
                const isSorted = sortKey === key;
                return (
                  <th
                    key={key}
                    style={{ width: col.width }}
                    className={cn(
                      alignClass[col.align ?? "left"],
                      col.sortable &&
                        "cursor-pointer select-none hover:text-light-text dark:hover:text-dark-text transition-colors"
                    )}
                    onClick={() => col.sortable && handleSort(key)}
                  >
                    <span className="inline-flex items-center gap-1">
                      {col.header}
                      {col.sortable && (
                        <SortIcon dir={isSorted ? sortDir : null} />
                      )}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: pageSize > 5 ? 6 : pageSize }).map(
                (_, i) => <TableRowSkeleton key={i} cols={columns.length} />
              )
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>
                  <EmptyState
                    title={emptyMessage}
                    description={emptyDescription}
                    className="py-10"
                  />
                </td>
              </tr>
            ) : (
              <AnimatePresence initial={false} mode="popLayout">
                {paginated.map((row, i) => (
                  <motion.tr
                    key={getRowKey(row, i)}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15, delay: i * 0.02 }}
                    onClick={() => onRowClick?.(row)}
                    className={cn(onRowClick && "cursor-pointer")}
                  >
                    {columns.map((col) => {
                      const key = String(col.key);
                      const rawValue = (row as Record<string, unknown>)[key];
                      return (
                        <td
                          key={key}
                          className={cn(alignClass[col.align ?? "left"])}
                        >
                          {col.render
                            ? col.render(rawValue, row, i)
                            : rawValue != null
                            ? String(rawValue)
                            : "—"}
                        </td>
                      );
                    })}
                  </motion.tr>
                ))}
              </AnimatePresence>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ─────────────────────────────────── */}
      {showPagination && !isLoading && sortedData.length > pageSize && (
        <div className="flex items-center justify-between pt-3 px-1">
          <p className="text-[12px] text-light-text-3 dark:text-dark-text-3">
            Showing{" "}
            <span className="font-medium text-light-text dark:text-dark-text">
              {(safePage - 1) * pageSize + 1}–
              {Math.min(safePage * pageSize, sortedData.length)}
            </span>{" "}
            of{" "}
            <span className="font-medium text-light-text dark:text-dark-text">
              {sortedData.length}
            </span>
          </p>

          <div className="flex items-center gap-1">
            <button
              disabled={safePage === 1}
              onClick={() => setPage((p) => p - 1)}
              className={cn(
                "p-1.5 rounded-lg border border-light-border dark:border-dark-border",
                "text-light-text-2 dark:text-dark-text-2",
                "hover:bg-light-surface-2 dark:hover:bg-dark-surface transition-colors",
                "disabled:opacity-40 disabled:cursor-not-allowed"
              )}
            >
              <ChevronLeft size={14} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(
                (p) =>
                  p === 1 ||
                  p === totalPages ||
                  Math.abs(p - safePage) <= 1
              )
              .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                if (idx > 0 && p - (arr[idx - 1] as number) > 1)
                  acc.push("...");
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === "..." ? (
                  <span
                    key={`ellipsis-${i}`}
                    className="px-1 text-[12px] text-light-text-3 dark:text-dark-text-3"
                  >
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p as number)}
                    className={cn(
                      "min-w-[28px] h-7 px-1 rounded-lg text-[12px] font-medium transition-colors",
                      safePage === p
                        ? "bg-brand-purple text-white"
                        : "border border-light-border dark:border-dark-border text-light-text-2 dark:text-dark-text-2 hover:bg-light-surface-2 dark:hover:bg-dark-surface"
                    )}
                  >
                    {p}
                  </button>
                )
              )}

            <button
              disabled={safePage === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className={cn(
                "p-1.5 rounded-lg border border-light-border dark:border-dark-border",
                "text-light-text-2 dark:text-dark-text-2",
                "hover:bg-light-surface-2 dark:hover:bg-dark-surface transition-colors",
                "disabled:opacity-40 disabled:cursor-not-allowed"
              )}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
