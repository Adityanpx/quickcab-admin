"use client";

import { motion } from "framer-motion";
import { MessageSquare } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";
import { TableRowSkeleton } from "@/components/ui/SkeletonLoader";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatRelative, cn } from "@/lib/utils";
import type { SupportTicket, TicketStatus } from "@/lib/api/support";

const STATUS_STYLES: Record<TicketStatus, string> = {
  OPEN: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  IN_REVIEW:
    "bg-brand-orange-muted text-brand-orange dark:bg-brand-orange-muted dark:text-brand-orange",
  RESOLVED:
    "bg-green-50 text-green-700 dark:bg-brand-green-muted dark:text-brand-green",
  CLOSED:
    "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
};

interface TicketTableProps {
  tickets: SupportTicket[];
  isLoading: boolean;
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
  onReply: (ticket: SupportTicket) => void;
}

export function TicketTable({
  tickets,
  isLoading,
  page,
  totalPages,
  total,
  limit,
  onPageChange,
  onReply,
}: TicketTableProps) {
  return (
    <div className="card p-0 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="table-base">
          <thead>
            <tr>
              <th className="pl-5">User</th>
              <th>Issue</th>
              <th>Status</th>
              <th>Submitted</th>
              <th>Last Updated</th>
              <th className="pr-5 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <TableRowSkeleton key={i} cols={6} />
              ))
            ) : tickets.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <EmptyState
                    title="No tickets found"
                    description="No support tickets match your current filter"
                    icon={<MessageSquare size={22} />}
                  />
                </td>
              </tr>
            ) : (
              tickets.map((ticket, i) => (
                <motion.tr
                  key={ticket.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.25 }}
                  className={cn(
                    ticket.status === "OPEN" &&
                      "bg-blue-50/30 dark:bg-blue-950/20"
                  )}
                >
                  {/* User */}
                  <td className="pl-5">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={ticket.user.name} size="sm" />
                      <div>
                        <p className="text-[13px] font-medium text-light-text dark:text-dark-text">
                          {ticket.user.name}
                        </p>
                        <p className="text-[11px] text-light-text-3 dark:text-dark-text-3">
                          {ticket.user.mobile} ·{" "}
                          <span className="uppercase text-[10px]">
                            {ticket.user.role.replace("_", " ")}
                          </span>
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Issue */}
                  <td>
                    <p className="text-[13px] font-medium text-light-text dark:text-dark-text">
                      {ticket.issue}
                    </p>
                    <p className="text-[12px] text-light-text-3 dark:text-dark-text-3 max-w-[240px] truncate">
                      {ticket.message}
                    </p>
                  </td>

                  {/* Status */}
                  <td>
                    <span
                      className={cn(
                        "badge",
                        STATUS_STYLES[ticket.status]
                      )}
                    >
                      {ticket.status.replace("_", " ")}
                    </span>
                  </td>

                  {/* Submitted */}
                  <td>
                    <span className="text-[12px] text-light-text-2 dark:text-dark-text-2">
                      {formatRelative(ticket.createdAt)}
                    </span>
                  </td>

                  {/* Last updated */}
                  <td>
                    <span className="text-[12px] text-light-text-3 dark:text-dark-text-3">
                      {formatRelative(ticket.updatedAt)}
                    </span>
                  </td>

                  {/* Action */}
                  <td className="pr-5 text-right">
                    <Button
                      variant="outline"
                      size="xs"
                      icon={<MessageSquare size={13} />}
                      onClick={() => onReply(ticket)}
                    >
                      {ticket.status === "OPEN" || ticket.status === "IN_REVIEW"
                        ? "Reply"
                        : "View"}
                    </Button>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!isLoading && tickets.length > 0 && (
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
