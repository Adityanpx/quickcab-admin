"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Users } from "lucide-react";
import { useSubscribers, useSubscriptionPlans } from "@/lib/hooks/useSubscriptions";
import { Avatar } from "@/components/ui/Avatar";
import { FilterSelect } from "@/components/ui/FilterSelect";
import { Pagination } from "@/components/ui/Pagination";
import { TableRowSkeleton } from "@/components/ui/SkeletonLoader";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Subscriber } from "@/lib/api/subscriptions";

const STATUS_OPTIONS = [
  { value: "ACTIVE",    label: "Active" },
  { value: "EXPIRED",   label: "Expired" },
  { value: "CANCELLED", label: "Cancelled" },
];

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getDaysRemaining(endDate: string) {
  const diff = new Date(endDate).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function StatusChip({ status }: { status: Subscriber["status"] }) {
  const map: Record<Subscriber["status"], string> = {
    ACTIVE:    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    EXPIRED:   "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    CANCELLED: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${map[status]}`}>
      {status}
    </span>
  );
}

interface Props {
  role: "PARTNER" | "SERVICE_PROVIDER";
}

export function SubscriberTable({ role }: Props) {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [planFilter, setPlanFilter] = useState("");

  const { data: plansData } = useSubscriptionPlans();
  const plans = (plansData?.plans ?? []).filter(
    (p) => p.userType === role || p.userType === "BOTH"
  );
  const planOptions = plans.map((p) => ({ value: p.id, label: p.name }));

  const { data, isLoading } = useSubscribers({
    role,
    status: (statusFilter as Subscriber["status"]) || undefined,
    planId: planFilter || undefined,
    page,
    limit: 15,
  });

  const items = data?.items ?? [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <FilterSelect
          value={statusFilter}
          onChange={(v) => { setStatusFilter(v); setPage(1); }}
          options={STATUS_OPTIONS}
          placeholder="All Statuses"
          className="sm:w-40"
        />
        {planOptions.length > 0 && (
          <FilterSelect
            value={planFilter}
            onChange={(v) => { setPlanFilter(v); setPage(1); }}
            options={planOptions}
            placeholder="All Plans"
            className="sm:w-48"
          />
        )}
        <div className="flex-1" />
        {pagination && (
          <span className="text-[12px] text-light-text-3 dark:text-dark-text-3">
            {pagination.total} subscriber{pagination.total !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th className="pl-5">User</th>
                <th>Plan</th>
                <th>Amount</th>
                <th>Started</th>
                <th>Expires</th>
                <th>Days Left</th>
                <th>Status</th>
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
                      title="No subscribers found"
                      description="No one has purchased a plan yet for this role."
                      icon={<Users size={22} />}
                    />
                  </td>
                </tr>
              ) : (
                items.map((sub, i) => {
                  const daysLeft = getDaysRemaining(sub.endDate);
                  return (
                    <motion.tr
                      key={sub.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.02, duration: 0.2 }}
                    >
                      {/* User */}
                      <td className="pl-5">
                        <div className="flex items-center gap-3">
                          <Avatar name={sub.user.name} size="sm" />
                          <div>
                            <p className="text-[13px] font-medium text-light-text dark:text-dark-text">
                              {sub.user.name}
                            </p>
                            <p className="text-[11px] text-light-text-3 dark:text-dark-text-3">
                              {sub.user.mobile}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Plan */}
                      <td>
                        <span className="text-[13px] font-medium text-light-text dark:text-dark-text">
                          {sub.plan.name}
                        </span>
                        <p className="text-[11px] text-light-text-3 dark:text-dark-text-3">
                          {sub.plan.durationDays} days
                        </p>
                      </td>

                      {/* Amount */}
                      <td>
                        <span className="text-[13px] font-semibold text-light-text dark:text-dark-text">
                          ₹{sub.plan.price.toLocaleString("en-IN")}
                        </span>
                      </td>

                      {/* Started */}
                      <td>
                        <span className="text-[12px] text-light-text-2 dark:text-dark-text-2">
                          {formatDate(sub.startDate)}
                        </span>
                      </td>

                      {/* Expires */}
                      <td>
                        <span className="text-[12px] text-light-text-2 dark:text-dark-text-2">
                          {formatDate(sub.endDate)}
                        </span>
                      </td>

                      {/* Days Left */}
                      <td>
                        {sub.status === "ACTIVE" ? (
                          <span className={`text-[12px] font-semibold ${
                            daysLeft <= 3
                              ? "text-red-500"
                              : daysLeft <= 7
                              ? "text-orange-500"
                              : "text-green-600 dark:text-green-400"
                          }`}>
                            {daysLeft > 0 ? `${daysLeft}d` : "Expiring today"}
                          </span>
                        ) : (
                          <span className="text-[12px] text-light-text-3 dark:text-dark-text-3">—</span>
                        )}
                      </td>

                      {/* Status */}
                      <td>
                        <StatusChip status={sub.status} />
                      </td>
                    </motion.tr>
                  );
                })
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
    </div>
  );
}
