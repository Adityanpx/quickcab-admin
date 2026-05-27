"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Activity,
  ShieldOff,
  ShieldAlert,
  Clock,
  ChevronRight,
  Users,
} from "lucide-react";
import { useSubAdminSummary } from "@/lib/hooks/useDashboard";
import { PageHeader } from "@/components/ui/PageHeader";
import { Avatar } from "@/components/ui/Avatar";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/SkeletonLoader";
import { cn, formatDateTime } from "@/lib/utils";
import type { SubAdminSummaryItem } from "@/lib/api/dashboard";

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

// ─── Status badge ─────────────────────────────────────────
function RestrictionBadge({
  restriction,
}: {
  restriction: SubAdminSummaryItem["restriction"];
}) {
  if (!restriction) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-green-50 dark:bg-brand-green-muted/20 text-green-700 dark:text-brand-green">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500 dark:bg-brand-green" />
        Active
      </span>
    );
  }
  if (restriction.status === "BLOCKED") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-brand-red-muted text-brand-red">
        <ShieldOff size={11} />
        Blocked
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-orange-50 dark:bg-brand-orange-muted text-orange-700 dark:text-brand-orange">
      <ShieldAlert size={11} />
      Suspended
    </span>
  );
}

// ─── Single SubAdmin Card ─────────────────────────────────
function SubAdminCard({
  item,
  index,
}: {
  item: SubAdminSummaryItem;
  index: number;
}) {
  const router = useRouter();
  const isRestricted = !!item.restriction;

  // Top 4 actions by count for the breakdown pills
  const topActions = Object.entries(item.breakdown)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35 }}
      onClick={() =>
        router.push(
          `/subadmin-logs/${encodeURIComponent(item.name)}`
        )
      }
      className={cn(
        "card cursor-pointer group transition-all duration-200",
        "hover:border-brand-purple/30 hover:shadow-purple-glow",
        isRestricted &&
          "border-brand-red/30 bg-red-50/30 dark:bg-brand-red-muted/10"
      )}
    >
      {/* Top row — avatar + name + status */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Avatar name={item.name} size="md" />
          <div>
            <p className="text-[15px] font-semibold text-light-text dark:text-dark-text">
              {item.name}
            </p>
            <p className="text-[12px] text-light-text-3 dark:text-dark-text-3 mt-0.5">
              SubAdmin
            </p>
          </div>
        </div>
        <RestrictionBadge restriction={item.restriction} />
      </div>

      {/* Restriction reason if restricted */}
      {item.restriction && (
        <div className="mb-3 px-3 py-2 rounded-lg bg-brand-red-muted border border-brand-red/15">
          <p className="text-[11px] text-brand-red leading-relaxed">
            <span className="font-semibold">
              {item.restriction.status === "BLOCKED" ? "Blocked" : "Suspended"}:
            </span>{" "}
            {item.restriction.reason}
          </p>
        </div>
      )}

      {/* Stats row */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-1.5">
          <Activity size={13} className="text-brand-purple" />
          <span className="text-[13px] font-bold text-light-text dark:text-dark-text">
            {item.totalActions.toLocaleString("en-IN")}
          </span>
          <span className="text-[11px] text-light-text-3 dark:text-dark-text-3">
            total actions
          </span>
        </div>
        {item.lastActiveAt && (
          <div className="flex items-center gap-1.5">
            <Clock size={12} className="text-light-text-3 dark:text-dark-text-3" />
            <span className="text-[11px] text-light-text-3 dark:text-dark-text-3">
              Last active {formatDateTime(item.lastActiveAt)}
            </span>
          </div>
        )}
      </div>

      {/* Action breakdown pills */}
      {topActions.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {topActions.map(([action, count]) => (
            <span
              key={action}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-light-surface-2 dark:bg-dark-surface text-light-text-2 dark:text-dark-text-2 border border-light-border dark:border-dark-border"
            >
              {ACTION_SHORT[action] ?? action.replace(/_/g, " ")}
              <span className="font-bold text-brand-purple">{count}</span>
            </span>
          ))}
          {Object.keys(item.breakdown).length > 4 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-light-surface-2 dark:bg-dark-surface text-light-text-3 dark:text-dark-text-3 border border-light-border dark:border-dark-border">
              +{Object.keys(item.breakdown).length - 4} more
            </span>
          )}
        </div>
      )}

      {/* View activity footer */}
      <div className="flex items-center justify-between pt-3 border-t border-light-border dark:border-dark-border">
        <span className="text-[12px] text-light-text-3 dark:text-dark-text-3">
          Click to view full activity log
        </span>
        <ChevronRight
          size={15}
          className="text-light-text-3 dark:text-dark-text-3 group-hover:text-brand-purple group-hover:translate-x-0.5 transition-all duration-150"
        />
      </div>
    </motion.div>
  );
}

// ─── Loading skeleton for cards ───────────────────────────
function SubAdminCardSkeleton() {
  return (
    <div className="card space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-full" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
        <Skeleton className="h-6 w-16 rounded-lg" />
      </div>
      <div className="flex gap-3">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-36" />
      </div>
      <div className="flex gap-1.5">
        <Skeleton className="h-5 w-20 rounded-md" />
        <Skeleton className="h-5 w-24 rounded-md" />
        <Skeleton className="h-5 w-16 rounded-md" />
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────
export default function SubAdminLogsPage() {
  const { data: summary, isLoading } = useSubAdminSummary();
  const items = summary ?? [];

  const activeCount = items.filter((i) => !i.restriction).length;
  const restrictedCount = items.filter((i) => !!i.restriction).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <PageHeader
          title="SubAdmin Logs"
          subtitle={
            isLoading
              ? "Loading subadmin activity..."
              : `${items.length} subadmin${items.length !== 1 ? "s" : ""} · ${activeCount} active${restrictedCount > 0 ? ` · ${restrictedCount} restricted` : ""}`
          }
        />
      </motion.div>

      {/* Cards grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <SubAdminCardSkeleton key={i} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={<Users size={22} />}
            title="No subadmin activity yet"
            description="SubAdmin actions will appear here once subadmins start using the panel."
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item, i) => (
            <SubAdminCard key={item.name} item={item} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
