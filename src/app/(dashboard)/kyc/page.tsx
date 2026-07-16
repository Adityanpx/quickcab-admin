"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { FileCheck, CheckCircle, XCircle, Clock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useKycQueue, useApproveKyc, useRejectKyc } from "@/lib/hooks/usePartners";
import { useDashboardStats } from "@/lib/hooks/useDashboard";
import type { KycRejectPayload } from "@/lib/api/partners";
import { Avatar } from "@/components/ui/Avatar";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { FilterSelect } from "@/components/ui/FilterSelect";
import { SearchInput } from "@/components/ui/SearchInput";
import { Pagination } from "@/components/ui/Pagination";
import { Modal } from "@/components/ui/Modal";
import { TableRowSkeleton } from "@/components/ui/SkeletonLoader";
import { EmptyState } from "@/components/ui/EmptyState";

const STATUS_OPTIONS = [
  { value: "PENDING",  label: "Submitted — Awaiting Review" },
  { value: "REJECTED", label: "Rejected" },
  { value: "APPROVED", label: "Approved" },
];

const DATE_PRESET_OPTIONS = [
  { value: "today", label: "Today" },
  { value: "week",  label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "year",  label: "This Year" },
];

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as any },
  }),
};

interface KycQueueItem {
  userId: string;
  userName: string;
  mobile: string;
  subType?: string;
  role?: string;
  kycStatus: string;
  aadhaarNumber?: string;
  vehicleNumber?: string | null;
  city?: string | null;
  displayId?: string | null;
}

export default function KycQueuePage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [datePreset, setDatePreset] = useState("");
  const [rejectTarget, setRejectTarget] = useState<{ userId: string; name: string } | null>(null);
  const [rejectNote, setRejectNote] = useState("");

  const { data: dashStats } = useDashboardStats();

  function getDateRange(preset: string): { dateFrom?: string; dateTo?: string } {
    if (!preset) return {};
    const now = new Date();
    const start = new Date(now); start.setHours(0, 0, 0, 0);
    if (preset === "today") return { dateFrom: start.toISOString() };
    if (preset === "week")  { const d = new Date(start); d.setDate(d.getDate() - 7);   return { dateFrom: d.toISOString() }; }
    if (preset === "month") { const d = new Date(start); d.setMonth(d.getMonth() - 1); return { dateFrom: d.toISOString() }; }
    if (preset === "year")  { const d = new Date(start); d.setFullYear(d.getFullYear() - 1); return { dateFrom: d.toISOString() }; }
    return {};
  }

  const { data, isLoading } = useKycQueue({
    page,
    limit: 15,
    search: search || undefined,
    status: statusFilter || undefined,
    ...getDateRange(datePreset),
  });

  const approveKycMutation = useApproveKyc();
  const rejectKycMutation = useRejectKyc();

  const handleSearch = useCallback((v: string) => {
    setSearch(v);
    setPage(1);
  }, []);

  const handleApprove = async (userId: string) => {
    await approveKycMutation.mutateAsync({ userId });
  };

  const handleRejectConfirm = async () => {
    if (!rejectTarget || !rejectNote.trim()) return;
    const payload: KycRejectPayload = {
      adminNote: rejectNote,
      aadhaarFrontStatus: "REJECTED",
      aadhaarFrontRejectReason: rejectNote,
      aadhaarBackStatus: "REJECTED",
      aadhaarBackRejectReason: rejectNote,
      drivingLicenceStatus: "REJECTED",
      drivingLicenceRejectReason: rejectNote,
      selfieStatus: "REJECTED",
      selfieRejectReason: rejectNote,
    };
    await rejectKycMutation.mutateAsync({
      userId: rejectTarget.userId,
      payload,
    });
    setRejectTarget(null);
    setRejectNote("");
  };

  const items: KycQueueItem[] = data?.items ?? [];
  const pagination = data?.pagination;

  // Service Providers live under /providers/:id; everyone else is a partner.
  const detailHref = (item: KycQueueItem) =>
    item.role === "SERVICE_PROVIDER"
      ? `/providers/${item.userId}`
      : `/partners/${item.userId}`;

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* ── Page Header ─────────────────────────────── */}
      <motion.div custom={0} variants={sectionVariants} initial="hidden" animate="visible">
        <PageHeader
          title="KYC Queue"
          subtitle="Review and approve partner identity documents"
        />
      </motion.div>

      {/* ── Stats ───────────────────────────────────── */}
      <motion.div
        custom={1}
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <StatCard
          index={0}
          label="Total Queue"
          value={(pagination?.total ?? 0).toLocaleString("en-IN")}
          icon={<FileCheck size={16} />}
          accentColor="purple"
        />
        <StatCard
          index={1}
          label="Pending Review"
          value={dashStats?.kyc?.pendingTotal ?? 0}
          icon={<Clock size={16} />}
          accentColor={(dashStats?.kyc?.pendingTotal ?? 0) > 5 ? "orange" : "purple"}
        />
        <StatCard
          index={2}
          label="Approved Today"
          value={dashStats?.kyc?.approvedToday ?? 0}
          icon={<CheckCircle size={16} />}
          accentColor="green"
        />
        <StatCard
          index={3}
          label="Rejected Today"
          value={dashStats?.kyc?.rejectedToday ?? 0}
          icon={<XCircle size={16} />}
          accentColor="red"
        />
      </motion.div>

      {/* ── Filters ─────────────────────────────────── */}
      <motion.div
        custom={2}
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
      >
        <SearchInput
          placeholder="Search by name or mobile..."
          onSearch={handleSearch}
          className="sm:w-64"
        />
        <FilterSelect
          value={statusFilter}
          onChange={(v) => { setStatusFilter(v); setPage(1); }}
          options={STATUS_OPTIONS}
          placeholder="All Statuses"
          className="sm:w-44"
        />
        <FilterSelect
          value={datePreset}
          onChange={(v) => { setDatePreset(v); setPage(1); }}
          options={DATE_PRESET_OPTIONS}
          placeholder="All Time"
          className="sm:w-40"
        />
      </motion.div>

      {/* ── Table ───────────────────────────────────── */}
      <motion.div custom={3} variants={sectionVariants} initial="hidden" animate="visible">
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table-base">
              <thead>
                <tr>
                  <th className="pl-5">Partner</th>
                  <th>Type</th>
                  <th>KYC Status</th>
                  <th>Aadhaar</th>
                  <th>Cab No</th>
                  <th>City</th>
                  <th className="pr-5 text-right">Review</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <TableRowSkeleton key={i} cols={7} />
                  ))
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={7}>
                      <EmptyState
                        title="No KYC requests found"
                        description="All caught up! No pending documents to review."
                        icon={<CheckCircle size={22} />}
                      />
                    </td>
                  </tr>
                ) : (
                  items.map((item, i) => (
                    <motion.tr
                      key={item.userId}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03, duration: 0.25 }}
                      onClick={() => router.push(detailHref(item))}
                      className="cursor-pointer hover:bg-light-surface-2 dark:hover:bg-dark-surface transition-colors"
                    >
                      {/* Partner */}
                      <td className="pl-5">
                        <div className="flex items-center gap-3">
                          <Avatar name={item.userName} size="sm" />
                          <div>
                            <Link
                              href={detailHref(item)}
                              className="text-[13px] font-medium text-light-text dark:text-dark-text hover:text-brand-purple transition-colors"
                            >
                              {item.userName}
                            </Link>
                            <p className="text-[11px] text-light-text-3 dark:text-dark-text-3">
                              {item.mobile}
                            </p>
                            {item.displayId && (
                              <p className="text-[10px] text-light-text-3 dark:text-dark-text-3 font-mono">
                                {item.displayId}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Sub-type */}
                      <td>
                        {item.role === "SERVICE_PROVIDER" ? (
                          <Badge variant="purple">Service Provider</Badge>
                        ) : item.subType ? (
                          <Badge variant={item.subType === "VEHICLE_OWNER" ? "partner" : "vendor"}>
                            {item.subType === "VEHICLE_OWNER" ? "Owner" : "Vendor"}
                          </Badge>
                        ) : (
                          <span className="text-[12px] text-light-text-3 dark:text-dark-text-3">—</span>
                        )}
                      </td>

                      {/* KYC Status */}
                      <td>
                        <StatusBadge status={item.kycStatus} />
                      </td>

                      {/* Aadhaar */}
                      <td>
                        <span className="text-[12px] font-mono text-light-text-2 dark:text-dark-text-2">
                          {item.aadhaarNumber ?? "—"}
                        </span>
                      </td>

                      {/* Cab No */}
                      <td>
                        <span className="text-[12px] font-mono text-light-text-2 dark:text-dark-text-2">
                          {item.vehicleNumber ?? "—"}
                        </span>
                      </td>

                      {/* City */}
                      <td>
                        <span className="text-[12px] text-light-text-2 dark:text-dark-text-2">
                          {item.city ?? "—"}
                        </span>
                      </td>

                      {/* Review */}
                      <td className="pr-5">
                        <div className="flex items-center justify-end gap-2">
                          {/* Approve / Reject (only for pending) */}
                          {item.kycStatus === "PENDING" && (
                            <>
                              <Button
                                variant="danger"
                                size="xs"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setRejectTarget({ userId: item.userId, name: item.userName });
                                }}
                              >
                                Reject
                              </Button>
                              <Button
                                variant="success"
                                size="xs"
                                loading={
                                  approveKycMutation.isPending &&
                                  approveKycMutation.variables?.userId === item.userId
                                }
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleApprove(item.userId);
                                }}
                              >
                                Approve
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!isLoading && items.length > 0 && (
            <div className="px-5 py-4 border-t border-light-border dark:border-dark-border">
              <Pagination
                page={page}
                totalPages={pagination?.totalPages ?? 1}
                total={pagination?.total ?? 0}
                limit={15}
                onPageChange={setPage}
              />
            </div>
          )}
        </div>
      </motion.div>

      {/* ── Reject Note Modal ───────────────────────── */}
      <Modal
        isOpen={!!rejectTarget}
        onClose={() => { setRejectTarget(null); setRejectNote(""); }}
        title={`Reject KYC — ${rejectTarget?.name}`}
        size="sm"
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setRejectTarget(null); setRejectNote(""); }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleRejectConfirm}
              loading={rejectKycMutation.isPending}
              className="!bg-brand-red !text-white"
            >
              Reject KYC
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-[13px] text-light-text-2 dark:text-dark-text-2">
            Provide a reason — the partner will see this message and can re-submit.
          </p>
          <textarea
            rows={4}
            value={rejectNote}
            onChange={(e) => setRejectNote(e.target.value)}
            placeholder="e.g. Aadhaar image is blurry. Please upload a clearer photo of all documents."
            className="input-base resize-none"
          />
        </div>
      </Modal>
    </div>
  );
}
