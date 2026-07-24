"use client";

import { Suspense, useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { ArrowUpCircle, CheckCircle, XCircle, Clock, Star } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useRoleUpgradeRequests,
  useApproveRoleUpgrade,
  useRejectRoleUpgrade,
} from "@/lib/hooks/usePartners";
import { Avatar } from "@/components/ui/Avatar";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { FilterSelect } from "@/components/ui/FilterSelect";
import { Pagination } from "@/components/ui/Pagination";
import { Modal } from "@/components/ui/Modal";
import { TableRowSkeleton } from "@/components/ui/SkeletonLoader";
import { EmptyState } from "@/components/ui/EmptyState";

const STATUS_OPTIONS = [
  { value: "PENDING", label: "Pending Review" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
];

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as any },
  }),
};

function RoleUpgradesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = Number(searchParams.get("page") ?? "1");
  const statusFilter = searchParams.get("status") ?? "PENDING";

  const searchParamsRef = useRef(searchParams);
  searchParamsRef.current = searchParams;

  const updateParams = useCallback((updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParamsRef.current.toString());
    Object.entries(updates).forEach(([k, v]) => {
      if (v) params.set(k, v);
      else params.delete(k);
    });
    router.replace(`?${params.toString()}`);
  }, [router]);

  const [rejectTarget, setRejectTarget] = useState<{ id: string; name: string } | null>(null);
  const [rejectNote, setRejectNote] = useState("");

  const { data, isLoading } = useRoleUpgradeRequests({
    page,
    limit: 15,
    status: (statusFilter as "PENDING" | "APPROVED" | "REJECTED") || undefined,
  });

  const approveMutation = useApproveRoleUpgrade();
  const rejectMutation = useRejectRoleUpgrade();

  const handleApprove = async (requestId: string) => {
    await approveMutation.mutateAsync({ requestId });
  };

  const handleRejectConfirm = async () => {
    if (!rejectTarget || !rejectNote.trim()) return;
    await rejectMutation.mutateAsync({ requestId: rejectTarget.id, note: rejectNote });
    setRejectTarget(null);
    setRejectNote("");
  };

  const items = data?.items ?? [];
  const pagination = data?.pagination;

  const pendingCount = items.filter((r) => r.status === "PENDING").length;

  return (
    <div className="space-y-6 max-w-[1400px]">
      <motion.div custom={0} variants={sectionVariants} initial="hidden" animate="visible">
        <PageHeader
          title="Role Upgrades"
          subtitle="Review Driver → Partner upgrade requests. No new KYC is required — approving converts the user's role instantly."
        />
      </motion.div>

      <motion.div
        custom={1}
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 lg:grid-cols-3 gap-4"
      >
        <StatCard
          index={0}
          label="Total Requests"
          value={(pagination?.total ?? 0).toLocaleString("en-IN")}
          icon={<ArrowUpCircle size={16} />}
          accentColor="purple"
        />
        <StatCard
          index={1}
          label="Pending Review"
          value={statusFilter === "PENDING" ? (pagination?.total ?? 0) : pendingCount}
          icon={<Clock size={16} />}
          accentColor={(pagination?.total ?? 0) > 5 && statusFilter === "PENDING" ? "orange" : "purple"}
        />
        <StatCard
          index={2}
          label="Approved"
          value={statusFilter === "APPROVED" ? (pagination?.total ?? 0) : "—"}
          icon={<CheckCircle size={16} />}
          accentColor="green"
        />
      </motion.div>

      <motion.div
        custom={2}
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
      >
        <FilterSelect
          value={statusFilter}
          onChange={(v) => updateParams({ status: v, page: "1" })}
          options={STATUS_OPTIONS}
          placeholder="All Statuses"
          className="sm:w-48"
        />
      </motion.div>

      <motion.div custom={3} variants={sectionVariants} initial="hidden" animate="visible">
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table-base">
              <thead>
                <tr>
                  <th className="pl-5">Driver</th>
                  <th>Category</th>
                  <th>Rating</th>
                  <th>KYC Status</th>
                  <th>Requested</th>
                  <th>Status</th>
                  <th className="pr-5 text-right">Review</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <TableRowSkeleton key={i} cols={7} />
                  ))
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={7}>
                      <EmptyState
                        title="No role upgrade requests found"
                        description="All caught up! No Driver → Partner requests to review."
                        icon={<CheckCircle size={22} />}
                      />
                    </td>
                  </tr>
                ) : (
                  items.map((item, i) => (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03, duration: 0.25 }}
                      onClick={() => router.push(`/providers/${item.user.id}`)}
                      className="cursor-pointer hover:bg-light-surface-2 dark:hover:bg-dark-surface transition-colors"
                    >
                      <td className="pl-5">
                        <div className="flex items-center gap-3">
                          <Avatar name={item.user.name} size="sm" />
                          <div>
                            <Link
                              href={`/providers/${item.user.id}`}
                              onClick={(e) => e.stopPropagation()}
                              className="text-[13px] font-medium text-light-text dark:text-dark-text hover:text-brand-purple transition-colors"
                            >
                              {item.user.name}
                            </Link>
                            <p className="text-[11px] text-light-text-3 dark:text-dark-text-3">
                              {item.user.mobile}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td>
                        <Badge variant="purple">
                          {item.user.providerProfile?.category ?? "Driver"}
                        </Badge>
                      </td>

                      <td>
                        <div className="flex items-center gap-1 text-[12px] text-light-text-2 dark:text-dark-text-2">
                          <Star size={12} className="text-brand-orange fill-brand-orange" />
                          {item.user.providerProfile?.rating?.toFixed(1) ?? "—"}
                        </div>
                      </td>

                      <td>
                        {item.user.kycRecord ? (
                          <StatusBadge status={item.user.kycRecord.status} />
                        ) : (
                          <span className="text-[12px] text-light-text-3 dark:text-dark-text-3">—</span>
                        )}
                      </td>

                      <td>
                        <span className="text-[12px] text-light-text-2 dark:text-dark-text-2">
                          {new Date(item.createdAt).toLocaleDateString("en-IN", {
                            day: "2-digit", month: "short", year: "numeric",
                          })}
                        </span>
                      </td>

                      <td>
                        <StatusBadge status={item.status} />
                      </td>

                      <td className="pr-5">
                        <div className="flex items-center justify-end gap-2">
                          {item.status === "PENDING" ? (
                            <>
                              <Button
                                variant="danger"
                                size="xs"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setRejectTarget({ id: item.id, name: item.user.name });
                                }}
                              >
                                Reject
                              </Button>
                              <Button
                                variant="success"
                                size="xs"
                                loading={
                                  approveMutation.isPending &&
                                  approveMutation.variables?.requestId === item.id
                                }
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleApprove(item.id);
                                }}
                              >
                                Approve
                              </Button>
                            </>
                          ) : (
                            <span className="text-[11px] text-light-text-3 dark:text-dark-text-3">
                              {item.adminNote ? `Note: ${item.adminNote}` : "—"}
                            </span>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {!isLoading && items.length > 0 && (
            <div className="px-5 py-4 border-t border-light-border dark:border-dark-border">
              <Pagination
                page={page}
                totalPages={pagination?.totalPages ?? 1}
                total={pagination?.total ?? 0}
                limit={15}
                onPageChange={(n) => updateParams({ page: String(n) })}
              />
            </div>
          )}
        </div>
      </motion.div>

      <Modal
        isOpen={!!rejectTarget}
        onClose={() => { setRejectTarget(null); setRejectNote(""); }}
        title={`Reject Upgrade — ${rejectTarget?.name}`}
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
              loading={rejectMutation.isPending}
              disabled={!rejectNote.trim()}
              className="!bg-brand-red !text-white"
            >
              Reject Request
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-[13px] text-light-text-2 dark:text-dark-text-2">
            Provide a reason — the driver will see this message and can re-apply later.
          </p>
          <textarea
            rows={4}
            value={rejectNote}
            onChange={(e) => setRejectNote(e.target.value)}
            placeholder="e.g. Profile record incomplete. Please update your details and re-apply."
            className="input-base resize-none"
          />
        </div>
      </Modal>
    </div>
  );
}

export default function RoleUpgradesPage() {
  return (
    <Suspense fallback={null}>
      <RoleUpgradesPageContent />
    </Suspense>
  );
}
