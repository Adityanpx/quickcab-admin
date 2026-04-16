"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Eye,
  MoreVertical,
  ShieldOff,
  ShieldBan,
  ShieldCheck,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { StatusBadge, Badge } from "@/components/ui/Badge";
import { TableRowSkeleton } from "@/components/ui/SkeletonLoader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
import { formatDate, formatRelative, cn } from "@/lib/utils";
import type { Partner } from "@/types/partner";

interface PartnerTableProps {
  partners: Partner[];
  isLoading: boolean;
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
  onSuspend: (partner: Partner) => void;
  onBlock: (partner: Partner) => void;
  onUnsuspend: (partner: Partner) => void;
}

// ─── Row Action Menu ──────────────────────────────────────
function ActionMenu({
  partner,
  onSuspend,
  onBlock,
  onUnsuspend,
}: {
  partner: Partner;
  onSuspend: (p: Partner) => void;
  onBlock: (p: Partner) => void;
  onUnsuspend: (p: Partner) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const isSuspended = partner.status === "SUSPENDED";

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-7 h-7 rounded-lg flex items-center justify-center text-light-text-3 dark:text-dark-text-3 hover:bg-light-surface-2 dark:hover:bg-dark-surface hover:text-light-text dark:hover:text-dark-text transition-colors"
      >
        <MoreVertical size={14} />
      </button>

      {open && (
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: -6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.15 }}
          className={cn(
            "absolute right-0 top-8 w-48 z-20 rounded-xl overflow-hidden",
            "bg-white dark:bg-dark-surface",
            "border border-light-border dark:border-dark-border",
            "shadow-lg dark:shadow-black/30"
          )}
        >
          <div className="p-1">
            <Link
              href={`/partners/${partner.id}`}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-light-text dark:text-dark-text hover:bg-light-surface-2 dark:hover:bg-dark-surface-2 transition-colors"
              onClick={() => setOpen(false)}
            >
              <Eye size={14} className="text-light-text-3 dark:text-dark-text-3" />
              View Details
            </Link>

            {partner.status !== "BLOCKED" && (
              <>
                {isSuspended ? (
                  <button
                    onClick={() => { onUnsuspend(partner); setOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-brand-green hover:bg-brand-green-muted transition-colors"
                  >
                    <ShieldCheck size={14} />
                    Unsuspend
                  </button>
                ) : (
                  <button
                    onClick={() => { onSuspend(partner); setOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-brand-orange hover:bg-brand-orange-muted transition-colors"
                  >
                    <ShieldOff size={14} />
                    Suspend
                  </button>
                )}

                <button
                  onClick={() => { onBlock(partner); setOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-brand-red hover:bg-brand-red-muted transition-colors"
                >
                  <ShieldBan size={14} />
                  Block Permanently
                </button>
              </>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ─── Main Table ───────────────────────────────────────────
export function PartnerTable({
  partners,
  isLoading,
  page,
  totalPages,
  total,
  limit,
  onPageChange,
  onSuspend,
  onBlock,
  onUnsuspend,
}: PartnerTableProps) {
  return (
    <div className="card p-0 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="table-base">
          <thead>
            <tr>
              <th className="pl-5">Partner</th>
              <th>Type</th>
              <th>Status</th>
              <th>KYC</th>
              <th>Wallet</th>
              <th>Joined</th>
              <th>Last Active</th>
              <th className="pr-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <TableRowSkeleton key={i} cols={8} />
              ))
            ) : partners.length === 0 ? (
              <tr>
                <td colSpan={8}>
                  <EmptyState
                    title="No partners found"
                    description="Try adjusting your search or filters"
                  />
                </td>
              </tr>
            ) : (
              partners.map((partner, i) => (
                <motion.tr
                  key={partner.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.25 }}
                  className="group"
                >
                  {/* Partner name + mobile */}
                  <td className="pl-5">
                    <div className="flex items-center gap-3">
                      <Avatar name={partner.name} size="sm" />
                      <div className="min-w-0">
                        <Link
                          href={`/partners/${partner.id}`}
                          className="text-[13px] font-medium text-light-text dark:text-dark-text hover:text-brand-purple transition-colors truncate block"
                        >
                          {partner.name}
                        </Link>
                        <p className="text-[11px] text-light-text-3 dark:text-dark-text-3">
                          {partner.mobile}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Sub-type */}
                  <td>
                    {partner.partnerProfile ? (
                      <Badge
                        variant={
                          partner.partnerProfile.subType === "VEHICLE_OWNER"
                            ? "partner"
                            : "vendor"
                        }
                      >
                        {partner.partnerProfile.subType === "VEHICLE_OWNER"
                          ? "Owner"
                          : "Vendor"}
                      </Badge>
                    ) : (
                      <span className="text-[12px] text-light-text-3 dark:text-dark-text-3">
                        —
                      </span>
                    )}
                  </td>

                  {/* Status */}
                  <td>
                    <StatusBadge status={partner.status} />
                  </td>

                  {/* KYC status */}
                  <td>
                    {partner.kycRecord ? (
                      <StatusBadge status={partner.kycRecord.status} />
                    ) : (
                      <span className="text-[12px] text-light-text-3 dark:text-dark-text-3">
                        Not submitted
                      </span>
                    )}
                  </td>

                  {/* Wallet balance */}
                  <td>
                    <span className="text-[13px] font-medium text-light-text dark:text-dark-text">
                      ₹{partner.walletBalance.toLocaleString("en-IN")}
                    </span>
                  </td>

                  {/* Joined date */}
                  <td>
                    <span className="text-[12px] text-light-text-2 dark:text-dark-text-2">
                      {formatDate(partner.createdAt)}
                    </span>
                  </td>

                  {/* Last active */}
                  <td>
                    <span className="text-[12px] text-light-text-3 dark:text-dark-text-3">
                      {partner.lastLoginAt
                        ? formatRelative(partner.lastLoginAt)
                        : "Never"}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="pr-5 text-right">
                    <ActionMenu
                      partner={partner}
                      onSuspend={onSuspend}
                      onBlock={onBlock}
                      onUnsuspend={onUnsuspend}
                    />
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!isLoading && partners.length > 0 && (
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
