"use client";

import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { walletApi } from "@/lib/api/wallet";
import { Avatar } from "@/components/ui/Avatar";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { TableRowSkeleton } from "@/components/ui/SkeletonLoader";
import { formatCurrency, formatRelative } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import type { WithdrawalRequest } from "@/types/wallet";
import toast from "react-hot-toast";

export function RecentWithdrawals() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["wallet", "withdrawals", "recent"],
    queryFn: () => walletApi.getWithdrawals({ status: "PENDING", limit: 5 }),
    staleTime: 30 * 1000,
  });

  const items: WithdrawalRequest[] = data?.items ?? [];

  const handleApprove = async (id: string) => {
    try {
      await walletApi.approveWithdrawal(id);
      qc.invalidateQueries({ queryKey: ["wallet"] });
      toast.success("Withdrawal approved");
    } catch {
      toast.error("Failed to approve withdrawal");
    }
  };

  return (
    <div className="card h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-[15px] text-light-text dark:text-dark-text">
            Pending Withdrawals
          </h3>
        </div>
        {items.length > 0 && (
          <span className="badge bg-brand-orange-muted dark:bg-brand-orange-muted text-brand-orange text-[11px]">
            {items.length} Pending
          </span>
        )}
      </div>

      {/* Table */}
      <div className="flex-1 overflow-hidden">
        <table className="table-base">
          <thead>
            <tr>
              <th>Partner</th>
              <th>Amount</th>
              <th>Submitted</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRowSkeleton key={i} cols={4} />
              ))
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-8 text-light-text-3 dark:text-dark-text-3 text-sm">
                  No pending withdrawals
                </td>
              </tr>
            ) : (
              items.slice(0, 5).map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <Avatar name={item.user.name} size="sm" />
                      <div>
                        <p className="text-[13px] font-medium text-light-text dark:text-dark-text">
                          {item.user.name}
                        </p>
                        <p className="text-[11px] text-light-text-3 dark:text-dark-text-3">
                          {item.user.mobile}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="text-[13px] font-semibold text-light-text dark:text-dark-text">
                      {formatCurrency(item.amountINR)}
                    </span>
                  </td>
                  <td>
                    <span className="text-[12px] text-light-text-3 dark:text-dark-text-3">
                      {formatRelative(item.createdAt)}
                    </span>
                  </td>
                  <td>
                    <Button
                      variant="success"
                      size="xs"
                      onClick={() => handleApprove(item.id)}
                    >
                      Approve
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="pt-3 mt-3 border-t border-light-border dark:border-dark-border">
        <Link
          href="/wallet"
          className="flex items-center gap-1.5 text-[13px] font-medium text-brand-purple hover:underline"
        >
          View all withdrawals
          <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  );
}
