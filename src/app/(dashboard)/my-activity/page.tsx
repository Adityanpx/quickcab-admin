"use client";

import { useState, Suspense } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Activity,
  User,
  BookOpen,
  FileCheck,
  CheckCircle,
  XCircle,
  Trash2,
  ShieldOff,
  ShieldCheck,
  Filter,
  Calendar,
} from "lucide-react";
import { useMyActivity } from "@/lib/hooks/useAdminAccounts";
import { useAuthStore } from "@/stores/authStore";
import { FilterSelect } from "@/components/ui/FilterSelect";
import { PageHeader } from "@/components/ui/PageHeader";
import { Pagination } from "@/components/ui/Pagination";
import { TableRowSkeleton } from "@/components/ui/SkeletonLoader";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn, formatDateTime } from "@/lib/utils";
import type { AdminActivityLog } from "@/lib/api/admin-accounts";

// ─── Action meta for the activity table ───────────────────
const ACTION_META: Record<
  string,
  { label: string; color: string; bg: string; icon: React.ReactNode }
> = {
  KYC_APPROVED: { label: "KYC Approved", color: "text-green-700 dark:text-brand-green", bg: "bg-green-50 dark:bg-brand-green-muted/20", icon: <CheckCircle size={11} /> },
  KYC_REJECTED: { label: "KYC Rejected", color: "text-brand-red", bg: "bg-brand-red-muted", icon: <XCircle size={11} /> },
  KYC_DOCUMENT_APPROVED: { label: "Document Approved", color: "text-green-700 dark:text-brand-green", bg: "bg-green-50 dark:bg-brand-green-muted/20", icon: <CheckCircle size={11} /> },
  KYC_DOCUMENT_REJECTED: { label: "Document Rejected", color: "text-brand-red", bg: "bg-brand-red-muted", icon: <XCircle size={11} /> },
  KYC_DOC_IMAGE_REPLACED: { label: "Doc Image Replaced", color: "text-brand-purple", bg: "bg-brand-purple-muted dark:bg-brand-purple-muted-dark", icon: <FileCheck size={11} /> },
  USER_SUSPENDED: { label: "User Suspended", color: "text-orange-700 dark:text-brand-orange", bg: "bg-orange-50 dark:bg-brand-orange-muted", icon: <ShieldOff size={11} /> },
  USER_UNSUSPENDED: { label: "User Unsuspended", color: "text-green-700 dark:text-brand-green", bg: "bg-green-50 dark:bg-brand-green-muted/20", icon: <ShieldCheck size={11} /> },
  USER_BLOCKED: { label: "User Blocked", color: "text-brand-red", bg: "bg-brand-red-muted", icon: <ShieldOff size={11} /> },
  USER_UNBLOCKED: { label: "User Unblocked", color: "text-green-700 dark:text-brand-green", bg: "bg-green-50 dark:bg-brand-green-muted/20", icon: <ShieldCheck size={11} /> },
  USER_DELETED: { label: "User Deleted", color: "text-brand-red", bg: "bg-brand-red-muted", icon: <Trash2 size={11} /> },
  BOOKING_CANCELLED: { label: "Booking Cancelled", color: "text-orange-700 dark:text-brand-orange", bg: "bg-orange-50 dark:bg-brand-orange-muted", icon: <XCircle size={11} /> },
  BOOKING_DELETED: { label: "Booking Deleted", color: "text-brand-red", bg: "bg-brand-red-muted", icon: <Trash2 size={11} /> },
};

const ACTION_FILTER_OPTIONS = Object.entries(ACTION_META).map(([value, meta]) => ({
  value,
  label: meta.label,
}));

function ActionBadge({ action }: { action: string }) {
  const meta = ACTION_META[action] ?? {
    label: action.replace(/_/g, " "),
    color: "text-light-text-2 dark:text-dark-text-2",
    bg: "bg-light-surface-2 dark:bg-dark-surface",
    icon: <Activity size={11} />,
  };
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap", meta.color, meta.bg)}>
      {meta.icon}
      {meta.label}
    </span>
  );
}

// There's no human-readable target name in the new AuditLog-backed activity
// shape (no targetName field) — every row renders the truncated ID as a
// clickable badge, since the target may still exist and be worth jumping to.
function TargetCell({ log }: { log: AdminActivityLog }) {
  const router = useRouter();
  const isBooking = log.targetType === "BOOKING";
  const displayId = `#${log.targetId.slice(-8).toUpperCase()}`;
  const icon = isBooking
    ? <BookOpen size={12} className="shrink-0" />
    : <User size={12} className="shrink-0" />;

  return (
    <button
      onClick={() => router.push(isBooking ? `/bookings/${log.targetId}` : `/partners/${log.targetId}`)}
      className="flex items-center gap-1.5 text-[12px] font-medium text-brand-purple hover:underline transition-colors text-left"
    >
      {icon}
      <span className="truncate max-w-[140px]">{displayId}</span>
    </button>
  );
}

// ─── Main Page ────────────────────────────────────────────
function MyActivityContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const admin = useAuthStore((s) => s.admin);

  const page = Number(searchParams.get("page") ?? "1");
  const action = searchParams.get("action") ?? "";
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  function updateParams(updates: Record<string, string>) {
    const p = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([k, v]) => {
      if (v) p.set(k, v);
      else p.delete(k);
    });
    router.replace(`?${p.toString()}`);
  }

  const { data, isLoading } = useMyActivity({
    page,
    action: action || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  });

  const logs = data?.items ?? [];
  const pagination = data?.pagination;
  const hasActiveFilters = !!(action || dateFrom || dateTo);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <PageHeader
          title={admin?.name ?? "My Activity"}
          subtitle="Your activity log across the platform"
        />
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08, duration: 0.3 }}
        className="card p-4"
      >
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-light-text-3 dark:text-dark-text-3 shrink-0">
            <Filter size={13} />
            <span className="text-[12px] font-medium">Filter by</span>
          </div>
          <FilterSelect
            value={action}
            onChange={(v) => { updateParams({ action: v, page: "1" }); }}
            options={ACTION_FILTER_OPTIONS}
            placeholder="All Actions"
            className="w-52"
          />
          <div className="flex items-center gap-2">
            <Calendar size={13} className="text-light-text-3 dark:text-dark-text-3 shrink-0" />
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => { setDateFrom(e.target.value); updateParams({ page: "1" }); }}
              className={cn("px-3 py-2 text-sm rounded-xl border bg-white dark:bg-dark-surface border-light-border dark:border-dark-border text-light-text dark:text-dark-text focus:outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/10 transition-all duration-150 cursor-pointer")}
            />
            <span className="text-[12px] text-light-text-3 dark:text-dark-text-3">to</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => { setDateTo(e.target.value); updateParams({ page: "1" }); }}
              className={cn("px-3 py-2 text-sm rounded-xl border bg-white dark:bg-dark-surface border-light-border dark:border-dark-border text-light-text dark:text-dark-text focus:outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/10 transition-all duration-150 cursor-pointer")}
            />
          </div>
          {hasActiveFilters && (
            <button
              onClick={() => { updateParams({ action: "", page: "1" }); setDateFrom(""); setDateTo(""); }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-medium text-brand-red bg-brand-red-muted hover:bg-red-100 dark:hover:bg-red-950 transition-colors"
            >
              <XCircle size={13} />
              Clear
            </button>
          )}
        </div>
      </motion.div>

      {/* Activity table */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12, duration: 0.35 }}
        className="card p-0 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th className="pl-5">Action</th>
                <th>Target</th>
                <th>IP Address</th>
                <th className="pr-5 whitespace-nowrap">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <TableRowSkeleton key={i} cols={4} />
                ))
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={4}>
                    <EmptyState
                      icon={<Activity size={22} />}
                      title="No actions found"
                      description={hasActiveFilters
                        ? "No actions match your filters. Try adjusting them."
                        : "You haven't taken any actions yet."
                      }
                    />
                  </td>
                </tr>
              ) : (
                logs.map((log, i) => (
                  <motion.tr
                    key={log.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02, duration: 0.2 }}
                  >
                    <td className="pl-5">
                      <ActionBadge action={log.action} />
                    </td>
                    <td>
                      <TargetCell log={log} />
                    </td>
                    <td>
                      <span className="text-[11px] font-mono text-light-text-3 dark:text-dark-text-3">
                        {log.ipAddress ?? "—"}
                      </span>
                    </td>
                    <td className="pr-5">
                      <span className="text-[12px] text-light-text-2 dark:text-dark-text-2 whitespace-nowrap">
                        {formatDateTime(log.createdAt)}
                      </span>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {!isLoading && logs.length > 0 && pagination && (
          <div className="px-5 py-4 border-t border-light-border dark:border-dark-border">
            <Pagination
              page={page}
              totalPages={pagination.totalPages}
              total={pagination.total}
              limit={pagination.limit}
              onPageChange={(n) => updateParams({ page: String(n) })}
            />
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default function MyActivityPage() {
  return (
    <Suspense>
      <MyActivityContent />
    </Suspense>
  );
}
