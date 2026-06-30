"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Activity, Clock, ChevronRight, Users, Plus } from "lucide-react";
import { useAdminAccounts } from "@/lib/hooks/useAdminAccounts";
import { PageHeader } from "@/components/ui/PageHeader";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/SkeletonLoader";
import { CreateSubAdminModal } from "@/components/admin-accounts/CreateSubAdminModal";
import { cn, formatDateTime } from "@/lib/utils";
import type { AdminAccount } from "@/lib/api/admin-accounts";

// ─── Single SubAdmin Card ─────────────────────────────────
function SubAdminCard({
  item,
  index,
}: {
  item: AdminAccount;
  index: number;
}) {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35 }}
      onClick={() => router.push(`/subadmin-logs/${item.id}`)}
      className={cn(
        "card cursor-pointer group transition-all duration-200",
        "hover:border-brand-purple/30 hover:shadow-purple-glow"
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
        {item.isActive ? (
          <Badge variant="active" dot>
            Active
          </Badge>
        ) : (
          <Badge variant="gray" dot>
            Inactive
          </Badge>
        )}
      </div>

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
        {item.lastActionAt && (
          <div className="flex items-center gap-1.5">
            <Clock size={12} className="text-light-text-3 dark:text-dark-text-3" />
            <span className="text-[11px] text-light-text-3 dark:text-dark-text-3">
              Last active {formatDateTime(item.lastActionAt)}
            </span>
          </div>
        )}
      </div>

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
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────
export default function SubAdminLogsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { data, isLoading } = useAdminAccounts({ role: "SUBADMIN" });
  const items = data?.items ?? [];

  const activeCount = items.filter((i) => i.isActive).length;
  const inactiveCount = items.filter((i) => !i.isActive).length;

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
              : `${items.length} subadmin${items.length !== 1 ? "s" : ""} · ${activeCount} active${inactiveCount > 0 ? ` · ${inactiveCount} inactive` : ""}`
          }
          actions={
            <Button
              variant="primary"
              size="sm"
              icon={<Plus size={14} />}
              onClick={() => setShowCreateModal(true)}
            >
              Add Subadmin
            </Button>
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
            title="No subadmins yet"
            description="Add a subadmin account to get started. Their activity will appear here once they start using the panel."
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item, i) => (
            <SubAdminCard key={item.id} item={item} index={i} />
          ))}
        </div>
      )}

      <CreateSubAdminModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
}
