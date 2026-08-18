"use client";

import { Users, BookOpen, FileCheck, Wallet, Activity } from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import { StatCardSkeleton } from "@/components/ui/SkeletonLoader";
import type { DashboardStats } from "@/lib/api/dashboard";
import { useActiveUsersToday } from "@/lib/hooks/useDashboard";
import { formatCurrency } from "@/lib/utils";

interface StatCardsProps {
  stats: DashboardStats;
}

function ActiveUsersTodayCard({ index }: { index: number }) {
  const { data, isLoading } = useActiveUsersToday();

  if (isLoading) return <StatCardSkeleton />;

  return (
    <StatCard
      index={index}
      label="Active Users Today"
      value={(data?.todayCount ?? 0).toLocaleString("en-IN")}
      subtext="Unique active users"
      icon={<Activity size={16} />}
      accentColor="green"
    />
  );
}

export function StatCards({ stats }: StatCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        index={0}
        label="Total Users"
        value={(stats.partners.total + stats.providers.total).toLocaleString("en-IN")}
        subtext={`${(stats.partners.active + stats.providers.active).toLocaleString("en-IN")} active`}
        trend="up"
        trendValue="12% this month"
        icon={<Users size={16} />}
        accentColor="purple"
      />
      <StatCard
        index={1}
        label="Active Bookings"
        value={stats.bookings.open.toLocaleString("en-IN")}
        subtext={`${stats.bookings.today} posted today`}
        trend="up"
        trendValue="8% today"
        icon={<BookOpen size={16} />}
        accentColor="green"
      />
      <StatCard
        index={2}
        label="Pending KYC"
        value={stats.kyc.pendingTotal}
        subtext="Needs attention"
        trend={stats.kyc.pendingTotal > 10 ? "down" : "neutral"}
        trendValue={stats.kyc.pendingTotal > 10 ? "High queue" : undefined}
        icon={<FileCheck size={16} />}
        accentColor={stats.kyc.pendingTotal > 10 ? "orange" : "purple"}
      />
      <StatCard
        index={3}
        label="Pending Payouts"
        value={formatCurrency(stats.wallet.pendingWithdrawalAmount)}
        subtext={`${stats.wallet.pendingWithdrawals} requests pending`}
        trend="neutral"
        icon={<Wallet size={16} />}
        accentColor="green"
      />
      <ActiveUsersTodayCard index={4} />
    </div>
  );
}
