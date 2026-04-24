"use client";

import { Wallet, TrendingDown, Clock, CheckCircle } from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import { StatCardSkeleton } from "@/components/ui/SkeletonLoader";
import { useWalletStats } from "@/lib/hooks/useWallet";
import { formatCurrency } from "@/lib/utils";

export function WalletStats() {
  const { data: stats, isLoading } = useWalletStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        index={0}
        label="Pending Approvals"
        value={stats?.pendingWithdrawalCount ?? 0}
        subtext="awaiting your action"
        icon={<Clock size={16} />}
        accentColor={(stats?.pendingWithdrawalCount ?? 0) > 5 ? "orange" : "purple"}
      />
      <StatCard
        index={1}
        label="Pending Amount"
        value={formatCurrency(stats?.pendingWithdrawalAmount ?? 0)}
        subtext="to be approved"
        icon={<Wallet size={16} />}
        accentColor="orange"
      />
      <StatCard
        index={2}
        label="In Processing"
        value={stats?.processingWithdrawalCount ?? 0}
        subtext={`${formatCurrency(stats?.processingWithdrawalAmount ?? 0)} in flight`}
        icon={<TrendingDown size={16} />}
        accentColor={(stats?.processingWithdrawalCount ?? 0) > 0 ? "orange" : "purple"}
      />
      <StatCard
        index={3}
        label="Total Paid Out"
        value={formatCurrency(stats?.totalWithdrawnINR ?? 0)}
        subtext="all time via Razorpay"
        icon={<CheckCircle size={16} />}
        accentColor="green"
      />
    </div>
  );
}
