"use client";

import { Users, BookOpen, FileCheck, Wallet } from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import type { DashboardStats } from "@/lib/api/dashboard";
import { formatCurrency } from "@/lib/utils";

interface StatCardsProps {
  stats: DashboardStats;
}

export function StatCards({ stats }: StatCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        index={0}
        label="Total Partners"
        value={stats.partners.total.toLocaleString("en-IN")}
        subtext={`${stats.partners.active} active`}
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
        value={stats.partners.pendingKyc}
        subtext="Needs attention"
        trend={stats.partners.pendingKyc > 10 ? "down" : "neutral"}
        trendValue={stats.partners.pendingKyc > 10 ? "High queue" : undefined}
        icon={<FileCheck size={16} />}
        accentColor={stats.partners.pendingKyc > 10 ? "orange" : "purple"}
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
    </div>
  );
}
