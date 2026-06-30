"use client";

import { useState, useCallback, Suspense } from "react";
import { motion } from "framer-motion";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Activity,
  ShieldOff,
  ShieldCheck,
  User,
  BookOpen,
  FileCheck,
  CheckCircle,
  XCircle,
  Trash2,
  Filter,
  Calendar,
  Pencil,
  KeyRound,
} from "lucide-react";
import {
  useAdminAccountDetail,
  useAdminAccountActivity,
  useDeactivateAdminAccount,
  useReactivateAdminAccount,
} from "@/lib/hooks/useAdminAccounts";
import { FilterSelect } from "@/components/ui/FilterSelect";
import { PageHeader } from "@/components/ui/PageHeader";
import { Pagination } from "@/components/ui/Pagination";
import { TableRowSkeleton } from "@/components/ui/SkeletonLoader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { EditSubAdminModal } from "@/components/admin-accounts/EditSubAdminModal";
import { ResetPasswordModal } from "@/components/admin-accounts/ResetPasswordModal";
import { cn, formatDateTime } from "@/lib/utils";
import type { AdminActivityLog } from "@/lib/api/admin-accounts";

// ─── Action label map for breakdown display ───────────────
const ACTION_SHORT: Record<string, string> = {
  KYC_APPROVED: "KYC Approved",
  KYC_REJECTED: "KYC Rejected",
  KYC_DOCUMENT_APPROVED: "Doc Approved",
  KYC_DOCUMENT_REJECTED: "Doc Rejected",
  KYC_DOC_IMAGE_REPLACED: "Doc Replaced",
  USER_SUSPENDED: "Suspended",
  USER_UNSUSPENDED: "Unsuspended",
  USER_BLOCKED: "Blocked",
  USER_UNBLOCKED: "Unblocked",
  USER_DELETED: "Deleted",
  BOOKING_CANCELLED: "Booking Cancelled",
  BOOKING_DELETED: "Booking Deleted",
};

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
function SubAdminDetailContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;

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

  const [showEditModal, setShowEditModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);
  const [showReactivateConfirm, setShowReactivateConfirm] = useState(false);

  const { data: detail, isLoading: isLoadingDetail } = useAdminAccountDetail(id);

  const { data, isLoading } = useAdminAccountActivity(id, {
    page,
    action: action || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  });

  const deactivateMutation = useDeactivateAdminAccount();
  const reactivateMutation = useReactivateAdminAccount();

  const logs = data?.items ?? [];
  const pagination = data?.pagination;
  const hasActiveFilters = !!(action || dateFrom || dateTo);

  const handleDeactivate = useCallback(async () => {
    await deactivateMutation.mutateAsync(id);
    setShowDeactivateConfirm(false);
  }, [id, deactivateMutation]);

  const handleReactivate = useCallback(async () => {
    await reactivateMutation.mutateAsync(id);
    setShowReactivateConfirm(false);
  }, [id, reactivateMutation]);

  const breakdown = detail
    ? Object.entries(detail.stats.actionsByType).sort((a, b) => b[1] - a[1])
    : [];

  return (
    <div className="space-y-6">
      {/* Back button + header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <button
          onClick={() => router.push("/subadmin-logs")}
          className="flex items-center gap-1.5 text-[13px] text-light-text-2 dark:text-dark-text-2 hover:text-brand-purple transition-colors mb-4"
        >
          <ArrowLeft size={15} />
          Back to SubAdmin Logs
        </button>

        <PageHeader
          title={detail?.name ?? (isLoadingDetail ? "Loading..." : "SubAdmin")}
          subtitle={
            detail
              ? `${detail.stats.totalActions.toLocaleString("en-IN")} total actions${detail.lastLoginAt ? ` · Last login ${formatDateTime(detail.lastLoginAt)}` : ""}`
              : "SubAdmin activity log"
          }
          actions={
            detail && (
              <div className="flex items-center gap-2">
                {detail.isActive ? (
                  <Badge variant="active" dot>
                    Active
                  </Badge>
                ) : (
                  <Badge variant="gray" dot>
                    Inactive
                  </Badge>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  icon={<Pencil size={14} />}
                  onClick={() => setShowEditModal(true)}
                >
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  icon={<KeyRound size={14} />}
                  onClick={() => setShowResetModal(true)}
                >
                  Reset Password
                </Button>

                {detail.isActive ? (
                  <Button
                    size="sm"
                    icon={<ShieldOff size={14} />}
                    onClick={() => setShowDeactivateConfirm(true)}
                    className="!bg-brand-orange !text-white hover:!bg-orange-600"
                  >
                    Deactivate
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    icon={<ShieldCheck size={14} />}
                    onClick={() => setShowReactivateConfirm(true)}
                  >
                    Reactivate
                  </Button>
                )}
              </div>
            )
          }
        />
      </motion.div>

      {/* Action breakdown box */}
      {breakdown.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.3 }}
          className="card p-4"
        >
          <p className="text-[12px] font-medium text-light-text-2 dark:text-dark-text-2 mb-2.5">
            Action breakdown
          </p>
          <div className="flex flex-wrap gap-1.5">
            {breakdown.map(([actionType, count]) => (
              <span
                key={actionType}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-light-surface-2 dark:bg-dark-surface text-light-text-2 dark:text-dark-text-2 border border-light-border dark:border-dark-border"
              >
                {ACTION_SHORT[actionType] ?? actionType.replace(/_/g, " ")}
                <span className="font-bold text-brand-purple">{count}</span>
              </span>
            ))}
          </div>
        </motion.div>
      )}

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
                        : `${detail?.name ?? "This subadmin"} hasn't taken any actions yet.`
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

      {/* Edit modal */}
      <EditSubAdminModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        account={detail ? { id: detail.id, name: detail.name, email: detail.email } : null}
      />

      {/* Reset password modal */}
      <ResetPasswordModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        account={detail ? { id: detail.id, name: detail.name } : null}
      />

      {/* Deactivate confirm */}
      <ConfirmModal
        isOpen={showDeactivateConfirm}
        onClose={() => setShowDeactivateConfirm(false)}
        onConfirm={handleDeactivate}
        title={`Deactivate ${detail?.name ?? "this subadmin"}?`}
        description={`${detail?.name ?? "This subadmin"} will be immediately logged out and unable to log back in until reactivated.`}
        confirmLabel="Deactivate"
        variant="warning"
        loading={deactivateMutation.isPending}
      />

      {/* Reactivate confirm */}
      <ConfirmModal
        isOpen={showReactivateConfirm}
        onClose={() => setShowReactivateConfirm(false)}
        onConfirm={handleReactivate}
        title={`Reactivate ${detail?.name ?? "this subadmin"}?`}
        description={`${detail?.name ?? "This subadmin"} will be able to log in again immediately.`}
        confirmLabel="Reactivate"
        loading={reactivateMutation.isPending}
      />
    </div>
  );
}

export default function SubAdminDetailPage() {
  return (
    <Suspense>
      <SubAdminDetailContent />
    </Suspense>
  );
}
