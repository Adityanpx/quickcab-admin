"use client";

import Link from "next/link";
import { useKycQueue } from "@/lib/hooks/usePartners";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { TableRowSkeleton } from "@/components/ui/SkeletonLoader";
import { formatRelative } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

export function KycQueue() {
  const { data, isLoading } = useKycQueue({ limit: 5 });
  const items = data?.items ?? [];

  return (
    <div className="card h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-[15px] text-light-text dark:text-dark-text">
            KYC Approval Queue
          </h3>
        </div>
        {data?.pagination.total !== undefined && data.pagination.total > 0 && (
          <span className="badge bg-brand-orange-muted dark:bg-brand-orange-muted text-brand-orange text-[11px]">
            {data.pagination.total} Pending
          </span>
        )}
      </div>

      {/* Table */}
      <div className="flex-1 overflow-hidden">
        <table className="table-base">
          <thead>
            <tr>
              <th>Partner</th>
              <th>Type</th>
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
                  No pending KYC requests
                </td>
              </tr>
            ) : (
              items.slice(0, 5).map((item: {
                userId: string;
                userName: string;
                mobile: string;
                subType?: string;
                submittedAt: string;
              }) => (
                <tr key={item.userId}>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <Avatar name={item.userName} size="sm" />
                      <div>
                        <p className="text-[13px] font-medium text-light-text dark:text-dark-text">
                          {item.userName}
                        </p>
                        <p className="text-[11px] text-light-text-3 dark:text-dark-text-3">
                          {item.mobile}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <Badge variant={item.subType === "VEHICLE_OWNER" ? "partner" : "vendor"}>
                      {item.subType === "VEHICLE_OWNER" ? "Owner" : "Vendor"}
                    </Badge>
                  </td>
                  <td>
                    <span className="text-[12px] text-light-text-3 dark:text-dark-text-3">
                      {formatRelative(item.submittedAt)}
                    </span>
                  </td>
                  <td>
                    <Link href={`/partners/${item.userId}`}>
                      <Button variant="outline" size="xs">
                        Review
                      </Button>
                    </Link>
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
          href="/kyc"
          className="flex items-center gap-1.5 text-[13px] font-medium text-brand-purple hover:underline"
        >
          View all KYC requests
          <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  );
}
