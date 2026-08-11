"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { CheckCircle, Users, RefreshCw } from "lucide-react";
import { useKycApprovalStats } from "@/lib/hooks/usePartners";
import type { KycApprovalStatItem } from "@/lib/api/partners";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { StatCardSkeleton } from "@/components/ui/SkeletonLoader";
import { Button } from "@/components/ui/Button";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { cn } from "@/lib/utils";

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as any },
  }),
};

function toDatetimeLocalValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

// Backend stores naive local (IST) timestamps, so date-range params must be
// sent as plain local-time strings — not toISOString(), which shifts by the
// UTC offset and silently misses rows.
function toLocalTimestamp(datetimeLocalValue: string): string {
  return datetimeLocalValue.length === 16 ? `${datetimeLocalValue}:00` : datetimeLocalValue;
}

const dateTimeInputClass = cn(
  "px-3 py-2 text-sm rounded-xl border bg-white dark:bg-dark-surface",
  "border-light-border dark:border-dark-border text-light-text dark:text-dark-text",
  "focus:outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/10",
  "transition-all duration-150 cursor-pointer"
);

export default function KycApprovalTrackerPage() {
  const [fromInput, setFromInput] = useState(() => toDatetimeLocalValue(startOfToday()));
  const [toInput, setToInput] = useState(() => toDatetimeLocalValue(new Date()));
  const [appliedRange, setAppliedRange] = useState(() => ({
    from: toLocalTimestamp(toDatetimeLocalValue(startOfToday())),
    to: toLocalTimestamp(toDatetimeLocalValue(new Date())),
  }));

  const { data, isLoading, isFetching } = useKycApprovalStats(appliedRange);

  const handleApply = () => {
    setAppliedRange({
      from: toLocalTimestamp(fromInput),
      to: toLocalTimestamp(toInput),
    });
  };

  const rows: KycApprovalStatItem[] = useMemo(
    () => [...(data?.admins ?? [])].sort((a, b) => b.approvedCount - a.approvedCount),
    [data]
  );

  const totalApproved = data?.totalApproved ?? rows.reduce((sum, r) => sum + r.approvedCount, 0);

  const columns: Column<KycApprovalStatItem>[] = [
    { key: "adminName", header: "Admin Name", sortable: true },
    {
      key: "role",
      header: "Role",
      sortable: true,
      render: (value) => (
        <span
          className={cn(
            "inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium",
            value === "SUPERADMIN"
              ? "bg-brand-purple-muted/40 text-brand-purple dark:bg-brand-purple-muted-dark/40"
              : "bg-brand-green-muted/40 text-brand-green dark:bg-brand-green-muted-dark/40"
          )}
        >
          {value === "SUPERADMIN" ? "Super Admin" : "Sub Admin"}
        </span>
      ),
    },
    { key: "approvedCount", header: "Approved Count", sortable: true, align: "right" },
  ];

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* ── Page Header ─────────────────────────────── */}
      <motion.div custom={0} variants={sectionVariants} initial="hidden" animate="visible">
        <PageHeader
          title="KYC Approval Tracker"
          subtitle="Approved-KYC counts per admin for a selected date-time range"
        />
      </motion.div>

      {/* ── Stats ───────────────────────────────────── */}
      <motion.div
        custom={1}
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
      >
        {isLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <StatCard
              index={0}
              label="Total Approved"
              value={totalApproved.toLocaleString("en-IN")}
              icon={<CheckCircle size={16} />}
              accentColor="green"
            />
            <StatCard
              index={1}
              label="Admins With Approvals"
              value={rows.length}
              icon={<Users size={16} />}
              accentColor="purple"
            />
          </>
        )}
      </motion.div>

      {/* ── Date Range ──────────────────────────────── */}
      <motion.div
        custom={2}
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3"
      >
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-medium text-light-text-3 dark:text-dark-text-3">
            From
          </label>
          <input
            type="datetime-local"
            value={fromInput}
            onChange={(e) => setFromInput(e.target.value)}
            className={dateTimeInputClass}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-medium text-light-text-3 dark:text-dark-text-3">
            To
          </label>
          <input
            type="datetime-local"
            value={toInput}
            onChange={(e) => setToInput(e.target.value)}
            className={dateTimeInputClass}
          />
        </div>
        <Button
          variant="primary"
          size="md"
          icon={<RefreshCw size={14} />}
          loading={isFetching}
          onClick={handleApply}
        >
          Apply
        </Button>
      </motion.div>

      {/* ── Table ───────────────────────────────────── */}
      <motion.div custom={3} variants={sectionVariants} initial="hidden" animate="visible">
        <DataTable
          columns={columns}
          data={rows}
          isLoading={isLoading}
          rowKey="adminId"
          pageSize={15}
          emptyMessage="No approvals in this range"
          emptyDescription="No admin approved any KYC submissions in the selected date-time range."
        />

        {!isLoading && rows.length > 0 && (
          <div className="flex items-center justify-between px-1 pt-3 text-[12px] font-medium text-light-text-2 dark:text-dark-text-2">
            <span>Total across {rows.length} admin{rows.length === 1 ? "" : "s"}</span>
            <span className="text-light-text dark:text-dark-text font-semibold">
              {totalApproved.toLocaleString("en-IN")} approved
            </span>
          </div>
        )}
      </motion.div>
    </div>
  );
}
