"use client";

import { motion } from "framer-motion";
import { CheckCircle, XCircle } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";
import { TableRowSkeleton } from "@/components/ui/SkeletonLoader";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency, formatRelative, formatDate } from "@/lib/utils";
import type { WithdrawalRequest } from "@/types/wallet";

interface WithdrawalTableProps {
  withdrawals: WithdrawalRequest[];
  isLoading: boolean;
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
  onApprove: (withdrawal: WithdrawalRequest) => void;
  onReject: (withdrawal: WithdrawalRequest) => void;
  approvingId?: string;
}

export function WithdrawalTable({
  withdrawals,
  isLoading,
  page,
  totalPages,
  total,
  limit,
  onPageChange,
  onApprove,
  onReject,
  approvingId,
}: WithdrawalTableProps) {
  return (
    <div className="card p-0 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="table-base">
          <thead>
            <tr>
              <th className="pl-5">Partner</th>
              <th>Amount</th>
              <th>Bank Details</th>
              <th>Status</th>
              <th>Requested</th>
              <th>Processed</th>
              <th className="pr-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <TableRowSkeleton key={i} cols={7} />
              ))
            ) : withdrawals.length === 0 ? (
              <tr>
                <td colSpan={7}>
                  <EmptyState
                    title="No withdrawals found"
                    description="No withdrawal requests match your current filter"
                    icon={<CheckCircle size={22} />}
                  />
                </td>
              </tr>
            ) : (
              withdrawals.map((w, i) => (
                <motion.tr
                  key={w.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.025, duration: 0.25 }}
                >
                  {/* Partner */}
                  <td className="pl-5">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={w.user.name} size="sm" />
                      <div>
                        <p className="text-[13px] font-medium text-light-text dark:text-dark-text">
                          {w.user.name}
                        </p>
                        <p className="text-[11px] text-light-text-3 dark:text-dark-text-3">
                          {w.user.mobile}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Amount */}
                  <td>
                    <p className="text-[14px] font-bold text-light-text dark:text-dark-text">
                      {formatCurrency(w.amountINR)}
                    </p>
                  </td>

                  {/* Bank details */}
                  <td>
                    <p className="text-[12px] text-light-text dark:text-dark-text">
                      {w.accountHolder}
                    </p>
                    <p className="text-[11px] font-mono text-light-text-3 dark:text-dark-text-3">
                      {w.bankAccount} · {w.ifsc}
                    </p>
                  </td>

                  {/* Status */}
                  <td>
                    <StatusBadge status={w.status} />
                    {w.razorpayPayoutId && (
                      <p className="text-[10px] font-mono text-light-text-3 dark:text-dark-text-3 mt-0.5">
                        {w.razorpayPayoutId.slice(0, 16)}…
                      </p>
                    )}
                  </td>

                  {/* Requested */}
                  <td>
                    <span className="text-[12px] text-light-text-2 dark:text-dark-text-2">
                      {formatRelative(w.createdAt)}
                    </span>
                  </td>

                  {/* Processed */}
                  <td>
                    <span className="text-[12px] text-light-text-3 dark:text-dark-text-3">
                      {w.processedAt ? formatDate(w.processedAt) : "—"}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="pr-5">
                    {w.status === "PENDING" ? (
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="danger"
                          size="xs"
                          icon={<XCircle size={13} />}
                          onClick={() => onReject(w)}
                        >
                          Reject
                        </Button>
                        <Button
                          variant="success"
                          size="xs"
                          icon={<CheckCircle size={13} />}
                          loading={approvingId === w.id}
                          onClick={() => onApprove(w)}
                        >
                          Approve
                        </Button>
                      </div>
                    ) : (
                      <div className="flex justify-end">
                        <span className="text-[12px] text-light-text-3 dark:text-dark-text-3">
                          {w.status === "PROCESSED"  && "Paid out"}
                          {w.status === "PROCESSING" && "⏳ Processing..."}
                          {w.status === "REJECTED"   && "Rejected"}
                          {w.status === "FAILED"     && "⚠ Failed"}
                        </span>
                      </div>
                    )}
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!isLoading && withdrawals.length > 0 && (
        <div className="px-5 py-4 border-t border-light-border dark:border-dark-border">
          <Pagination
            page={page}
            totalPages={totalPages}
            total={total}
            limit={limit}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
}
