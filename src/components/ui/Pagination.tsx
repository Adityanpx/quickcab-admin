"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  total?: number;
  limit?: number;
  className?: string;
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
  total,
  limit,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  // Build page number array with ellipsis
  const getPages = (): (number | "...")[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (page <= 4) {
      return [1, 2, 3, 4, 5, "...", totalPages];
    }
    if (page >= totalPages - 3) {
      return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, "...", page - 1, page, page + 1, "...", totalPages];
  };

  const pages = getPages();
  const start = total && limit ? (page - 1) * limit + 1 : undefined;
  const end = total && limit ? Math.min(page * limit, total) : undefined;

  return (
    <div className={cn("flex items-center justify-between", className)}>
      {/* Count label */}
      {total !== undefined && (
        <p className="text-[13px] text-light-text-2 dark:text-dark-text-2">
          Showing{" "}
          <span className="font-medium text-light-text dark:text-dark-text">
            {start}–{end}
          </span>{" "}
          of{" "}
          <span className="font-medium text-light-text dark:text-dark-text">
            {total.toLocaleString("en-IN")}
          </span>
        </p>
      )}

      {/* Page buttons */}
      <div className="flex items-center gap-1">
        {/* Prev */}
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center",
            "border border-light-border dark:border-dark-border",
            "text-light-text-2 dark:text-dark-text-2",
            "hover:bg-light-surface-2 dark:hover:bg-dark-surface",
            "disabled:opacity-40 disabled:cursor-not-allowed",
            "transition-colors duration-150"
          )}
        >
          <ChevronLeft size={15} />
        </button>

        {/* Page numbers */}
        {pages.map((p, i) =>
          p === "..." ? (
            <span
              key={`ellipsis-${i}`}
              className="w-8 h-8 flex items-center justify-center text-[13px] text-light-text-3 dark:text-dark-text-3"
            >
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p as number)}
              className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center text-[13px] font-medium",
                "transition-all duration-150",
                p === page
                  ? "bg-brand-purple text-white shadow-purple-glow"
                  : "text-light-text-2 dark:text-dark-text-2 hover:bg-light-surface-2 dark:hover:bg-dark-surface border border-light-border dark:border-dark-border"
              )}
            >
              {p}
            </button>
          )
        )}

        {/* Next */}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center",
            "border border-light-border dark:border-dark-border",
            "text-light-text-2 dark:text-dark-text-2",
            "hover:bg-light-surface-2 dark:hover:bg-dark-surface",
            "disabled:opacity-40 disabled:cursor-not-allowed",
            "transition-colors duration-150"
          )}
        >
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}
