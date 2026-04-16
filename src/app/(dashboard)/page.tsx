"use client";

import { motion } from "framer-motion";
import { useDashboardStats } from "@/lib/hooks/useDashboard";
import { StatCards } from "@/components/dashboard/StatCards";
import { LeadActivityChart } from "@/components/dashboard/LeadActivityChart";
import { PartnerDistribution } from "@/components/dashboard/PartnerDistribution";
import { KycQueue } from "@/components/dashboard/KycQueue";
import { RecentWithdrawals } from "@/components/dashboard/RecentWithdrawals";
import { DashboardSkeleton } from "@/components/ui/SkeletonLoader";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";

// Stagger children animation
const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 },
  },
};

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function DashboardPage() {
  const { data: stats, isLoading, isError, refetch, isFetching } = useDashboardStats();

  if (isLoading) return <DashboardSkeleton />;

  if (isError || !stats) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <p className="text-light-text-2 dark:text-dark-text-2 text-sm">
          Failed to load dashboard stats
        </p>
        <Button variant="outline" size="sm" onClick={() => refetch()} icon={<RefreshCw size={14} />}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 max-w-[1600px]"
    >
      {/* ── Page Header ─────────────────────────────── */}
      <motion.div variants={sectionVariants} className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-light-text dark:text-dark-text">
            Dashboard
          </h1>
          <p className="text-sm text-light-text-2 dark:text-dark-text-2 mt-0.5">
            {getGreeting()}, Admin — here&apos;s what&apos;s happening today
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          icon={
            <RefreshCw
              size={14}
              className={isFetching ? "animate-spin" : ""}
            />
          }
          onClick={() => refetch()}
          disabled={isFetching}
        >
          Refresh
        </Button>
      </motion.div>

      {/* ── Stat Cards ──────────────────────────────── */}
      <motion.div variants={sectionVariants}>
        <StatCards stats={stats} />
      </motion.div>

      {/* ── Charts Row ──────────────────────────────── */}
      <motion.div
        variants={sectionVariants}
        className="grid grid-cols-1 lg:grid-cols-3 gap-4"
      >
        {/* Area Chart — 2/3 width */}
        <div className="lg:col-span-2">
          <LeadActivityChart />
        </div>

        {/* Donut Chart — 1/3 width */}
        <div>
          <PartnerDistribution stats={stats} />
        </div>
      </motion.div>

      {/* ── Tables Row ──────────────────────────────── */}
      <motion.div
        variants={sectionVariants}
        className="grid grid-cols-1 lg:grid-cols-2 gap-4"
      >
        <KycQueue />
        <RecentWithdrawals />
      </motion.div>

      {/* ── Cached At ───────────────────────────────── */}
      {stats.cachedAt && (
        <motion.p
          variants={sectionVariants}
          className="text-[11px] text-light-text-3 dark:text-dark-text-3 text-right"
        >
          Stats cached · Last updated{" "}
          {new Date(stats.cachedAt).toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </motion.p>
      )}
    </motion.div>
  );
}
