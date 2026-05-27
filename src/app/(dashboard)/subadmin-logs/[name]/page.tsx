"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Activity,
  ShieldOff,
  ShieldAlert,
  ShieldCheck,
  User,
  BookOpen,
  FileCheck,
  CheckCircle,
  XCircle,
  Trash2,
  Filter,
  Calendar,
  Clock,
} from "lucide-react";
import {
  useSubAdminLogs,
  useRestrictSubAdmin,
  useUnrestrictSubAdmin,
  useSubAdminSummary,
} from "@/lib/hooks/useDashboard";
import { FilterSelect } from "@/components/ui/FilterSelect";
import { PageHeader } from "@/components/ui/PageHeader";
import { Pagination } from "@/components/ui/Pagination";
import { TableRowSkeleton } from "@/components/ui/SkeletonLoader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { cn, formatDateTime } from "@/lib/utils";
import type { SubAdminLog } from "@/lib/api/dashboard";

// ─── Reuse action meta from main page ────────────────────
const ACTION_META: Record<
  string,
  { label: string; color: string; bg: string; icon: React.ReactNode }
> = {
  KYC_APPROVED: { label: "KYC Approved", color: "text-green-700 dark:text-brand-green", bg: "bg-green-50 dark:bg-brand-green-muted/20", icon: <CheckCircle size={11} /> },
  KYC_REJECTED: { label: "KYC Rejected", color: "text-brand-red", bg: "bg-brand-red-muted", icon: <XCircle size={11} /> },
  KYC_DOCUMENT_APPROVED: { label: "Document Approved", color: "text-green-700 dark:text-brand-green", bg: "bg-green-50 dark:bg-brand-green-muted/20", icon: <CheckCircle size={11} /> },
  KYC_DOCUMENT_REJECTED: { label: "Document Rejected", color: "text-brand-red", bg: "bg-brand-red-muted", icon: <XCircle size={11} /> },
  KYC_DOC_IMAGE_REPLACED: { label: "Doc Image Replaced", color: "text-brand-purple", bg: "bg-brand-purple-muted dark:bg-brand-purple-muted-dark", icon: <FileCheck size={11} /> },
  USER_SUSPENDED: { label: "User Suspended", color: "text-orange-700 dark:text-brand-orange", bg: "bg-orange-50 dark:bg-brand-orange-muted", icon: <ShieldAlert size={11} /> },
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

function TargetCell({ log }: { log: SubAdminLog }) {
  const router = useRouter();
  const isDeleted = log.action === "USER_DELETED";
  const isBooking = log.targetType === "BOOKING";
  const displayName = log.targetName ?? `#${log.targetId.slice(-8).toUpperCase()}`;
  const icon = isBooking
    ? <BookOpen size={12} className="shrink-0" />
    : <User size={12} className="shrink-0" />;

  if (isDeleted) {
    return (
      <span className="flex items-center gap-1.5 text-[12px] text-light-text-3 dark:text-dark-text-3 line-through">
        {icon}
        <span className="truncate max-w-[140px]">{displayName}</span>
      </span>
    );
  }
  return (
    <button
      onClick={() => router.push(isBooking ? `/bookings/${log.targetId}` : `/partners/${log.targetId}`)}
      className="flex items-center gap-1.5 text-[12px] font-medium text-brand-purple hover:underline transition-colors text-left"
    >
      {icon}
      <span className="truncate max-w-[140px]">{displayName}</span>
    </button>
  );
}

// ─── Restrict Modal ───────────────────────────────────────
function RestrictModal({
  isOpen,
  onClose,
  name,
  type,
  onConfirm,
  loading,
}: {
  isOpen: boolean;
  onClose: () => void;
  name: string;
  type: "SUSPENDED" | "BLOCKED";
  onConfirm: (reason: string) => void;
  loading: boolean;
}) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const handleClose = () => {
    setReason("");
    setError("");
    onClose();
  };

  const handleConfirm = () => {
    const trimmed = reason.trim();
    if (!trimmed || trimmed.length < 5) {
      setError("Please provide a reason (at least 5 characters)");
      return;
    }
    onConfirm(trimmed);
  };

  const isSuspend = type === "SUSPENDED";

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isSuspend ? `Suspend ${name}` : `Block ${name} Permanently`}
      size="sm"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleConfirm}
            loading={loading}
            className={isSuspend
              ? "!bg-brand-orange !text-white hover:!bg-orange-600"
              : "!bg-brand-red !text-white hover:!bg-red-700"
            }
          >
            {isSuspend ? "Suspend SubAdmin" : "Block SubAdmin"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className={cn(
          "px-3 py-2.5 rounded-xl border text-[12px] leading-relaxed",
          isSuspend
            ? "bg-orange-50 dark:bg-brand-orange-muted border-brand-orange/20 text-orange-700 dark:text-brand-orange"
            : "bg-brand-red-muted border-brand-red/20 text-brand-red"
        )}>
          {isSuspend
            ? `${name} will immediately lose the ability to perform any actions in the SubAdmin panel. They will see this reason when they try to do anything.`
            : `${name} will be permanently blocked. They will not be able to perform any actions until an admin unblocks them.`
          }
        </div>
        <div>
          <label className="block text-[12px] font-medium text-light-text dark:text-dark-text mb-1.5">
            Reason <span className="text-brand-red">*</span>
          </label>
          <textarea
            rows={3}
            value={reason}
            onChange={(e) => { setReason(e.target.value); setError(""); }}
            placeholder={isSuspend
              ? "e.g. Approving KYC without proper verification..."
              : "e.g. Repeated policy violations..."
            }
            className={cn("input-base resize-none w-full", error && "border-brand-red")}
            autoFocus
          />
          {error && <p className="text-xs text-brand-red mt-1">{error}</p>}
        </div>
      </div>
    </Modal>
  );
}

// ─── Main Page ────────────────────────────────────────────
export default function SubAdminDetailPage() {
  const router = useRouter();
  const params = useParams();
  const name = decodeURIComponent(params.name as string);

  const [page, setPage] = useState(1);
  const [action, setAction] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [isRestricting, setIsRestricting] = useState(false);
  const [isUnrestricting, setIsUnrestricting] = useState(false);

  // Get this subadmin's summary info (restriction status, total actions etc.)
  const { data: summary } = useSubAdminSummary();
  const subAdminInfo = summary?.find((s) => s.name === name);
  const restriction = subAdminInfo?.restriction ?? null;
  const isSuspended = restriction?.status === "SUSPENDED";
  const isBlocked = restriction?.status === "BLOCKED";
  const isRestricted = !!restriction;

  const { data, isLoading } = useSubAdminLogs({
    page,
    subAdminName: name,
    action: action || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  });

  const restrictMutation = useRestrictSubAdmin();
  const unrestrictMutation = useUnrestrictSubAdmin();

  const logs = data?.items ?? [];
  const pagination = data?.pagination;
  const hasActiveFilters = !!(action || dateFrom || dateTo);

  const handleRestrict = useCallback(
    async (type: "SUSPENDED" | "BLOCKED", reason: string) => {
      setIsRestricting(true);
      try {
        await restrictMutation.mutateAsync({ name, status: type, reason });
        setShowSuspendModal(false);
        setShowBlockModal(false);
      } finally {
        setIsRestricting(false);
      }
    },
    [name, restrictMutation]
  );

  const handleUnrestrict = useCallback(async () => {
    setIsUnrestricting(true);
    try {
      await unrestrictMutation.mutateAsync(name);
    } finally {
      setIsUnrestricting(false);
    }
  }, [name, unrestrictMutation]);

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
          title={name}
          subtitle={
            subAdminInfo
              ? `${subAdminInfo.totalActions.toLocaleString("en-IN")} total actions${subAdminInfo.lastActiveAt ? ` · Last active ${formatDateTime(subAdminInfo.lastActiveAt)}` : ""}`
              : "SubAdmin activity log"
          }
          actions={
            <div className="flex items-center gap-2">
              {/* Status badge */}
              {isRestricted ? (
                <span className={cn(
                  "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold",
                  isBlocked
                    ? "bg-brand-red-muted text-brand-red"
                    : "bg-orange-50 dark:bg-brand-orange-muted text-orange-700 dark:text-brand-orange"
                )}>
                  {isBlocked ? <ShieldOff size={11} /> : <ShieldAlert size={11} />}
                  {isBlocked ? "Blocked" : "Suspended"}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-green-50 dark:bg-brand-green-muted/20 text-green-700 dark:text-brand-green">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 dark:bg-brand-green" />
                  Active
                </span>
              )}

              {/* Action buttons */}
              {isRestricted ? (
                <Button
                  variant="outline"
                  size="sm"
                  icon={<ShieldCheck size={14} />}
                  onClick={handleUnrestrict}
                  loading={isUnrestricting}
                >
                  {isBlocked ? "Unblock" : "Unsuspend"}
                </Button>
              ) : (
                <>
                  <Button
                    size="sm"
                    icon={<ShieldAlert size={14} />}
                    onClick={() => setShowSuspendModal(true)}
                    className="!bg-brand-orange !text-white hover:!bg-orange-600"
                  >
                    Suspend
                  </Button>
                  <Button
                    size="sm"
                    icon={<ShieldOff size={14} />}
                    onClick={() => setShowBlockModal(true)}
                    className="!bg-brand-red !text-white hover:!bg-red-700"
                  >
                    Block
                  </Button>
                </>
              )}
            </div>
          }
        />
      </motion.div>

      {/* Current restriction reason — shown when restricted */}
      {isRestricted && restriction && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "px-4 py-3 rounded-xl border",
            isBlocked
              ? "bg-brand-red-muted border-brand-red/20"
              : "bg-orange-50 dark:bg-brand-orange-muted border-brand-orange/20"
          )}
        >
          <p className={cn("text-[13px] font-semibold mb-0.5", isBlocked ? "text-brand-red" : "text-orange-700 dark:text-brand-orange")}>
            {isBlocked ? "Permanently Blocked" : "Currently Suspended"}
          </p>
          <p className={cn("text-[12px] leading-relaxed", isBlocked ? "text-brand-red/80" : "text-orange-600 dark:text-brand-orange/80")}>
            Reason: {restriction.reason}
          </p>
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
            onChange={(v) => { setAction(v); setPage(1); }}
            options={ACTION_FILTER_OPTIONS}
            placeholder="All Actions"
            className="w-52"
          />
          <div className="flex items-center gap-2">
            <Calendar size={13} className="text-light-text-3 dark:text-dark-text-3 shrink-0" />
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
              className={cn("px-3 py-2 text-sm rounded-xl border bg-white dark:bg-dark-surface border-light-border dark:border-dark-border text-light-text dark:text-dark-text focus:outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/10 transition-all duration-150 cursor-pointer")}
            />
            <span className="text-[12px] text-light-text-3 dark:text-dark-text-3">to</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
              className={cn("px-3 py-2 text-sm rounded-xl border bg-white dark:bg-dark-surface border-light-border dark:border-dark-border text-light-text dark:text-dark-text focus:outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/10 transition-all duration-150 cursor-pointer")}
            />
          </div>
          {hasActiveFilters && (
            <button
              onClick={() => { setAction(""); setDateFrom(""); setDateTo(""); setPage(1); }}
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
                <th>Reason</th>
                <th>IP Address</th>
                <th className="pr-5 whitespace-nowrap">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <TableRowSkeleton key={i} cols={5} />
                ))
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <EmptyState
                      icon={<Activity size={22} />}
                      title="No actions found"
                      description={hasActiveFilters
                        ? "No actions match your filters. Try adjusting them."
                        : `${name} hasn't taken any actions yet.`
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
                      {log.reason ? (
                        <span title={log.reason} className="text-[12px] text-light-text-2 dark:text-dark-text-2 truncate max-w-[200px] block">
                          {log.reason}
                        </span>
                      ) : (
                        <span className="text-[12px] text-light-text-3 dark:text-dark-text-3">—</span>
                      )}
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
              limit={20}
              onPageChange={setPage}
            />
          </div>
        )}
      </motion.div>

      {/* Suspend Modal */}
      <RestrictModal
        isOpen={showSuspendModal}
        onClose={() => setShowSuspendModal(false)}
        name={name}
        type="SUSPENDED"
        onConfirm={(reason) => handleRestrict("SUSPENDED", reason)}
        loading={isRestricting}
      />

      {/* Block Modal */}
      <RestrictModal
        isOpen={showBlockModal}
        onClose={() => setShowBlockModal(false)}
        name={name}
        type="BLOCKED"
        onConfirm={(reason) => handleRestrict("BLOCKED", reason)}
        loading={isRestricting}
      />
    </div>
  );
}
