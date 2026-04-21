"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { Plus } from "lucide-react";
import { useWithdrawals, useApproveWithdrawal, useRejectWithdrawal } from "@/lib/hooks/useWallet";
import { WalletStats } from "@/components/wallet/WalletStats";
import { WithdrawalTable } from "@/components/wallet/WithdrawalTable";
import { ManualAdjustModal } from "@/components/wallet/ManualAdjustModal";
import { RejectWithdrawalModal } from "@/components/wallet/RejectWithdrawalModal";
import { FilterSelect } from "@/components/ui/FilterSelect";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import type { WithdrawalRequest } from "@/types/wallet";

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as any },
  }),
};

const STATUS_OPTIONS = [
  { value: "PENDING", label: "Pending" },
  { value: "PROCESSED", label: "Processed" },
  { value: "REJECTED", label: "Rejected" },
];

export default function WalletPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [showAdjust, setShowAdjust] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<WithdrawalRequest | null>(null);
  const [approvingId, setApprovingId] = useState<string>("");

  const { data, isLoading } = useWithdrawals({
    status: statusFilter || undefined,
    page,
    limit: 15,
  });

  const approveMutation = useApproveWithdrawal();
  const rejectMutation = useRejectWithdrawal();

  const withdrawals = data?.items ?? [];
  const pagination = data?.pagination;

  const handleApprove = async (withdrawal: WithdrawalRequest) => {
    setApprovingId(withdrawal.id);
    try {
      await approveMutation.mutateAsync(withdrawal.id);
    } finally {
      setApprovingId("");
    }
  };

  const handleRejectConfirm = async (reason: string) => {
    if (!rejectTarget) return;
    await rejectMutation.mutateAsync({ id: rejectTarget.id, reason });
    setRejectTarget(null);
  };

  return (
    <div className="space-y-6 max-w-[1600px]">
      {/* Header */}
      <motion.div custom={0} variants={sectionVariants} initial="hidden" animate="visible">
        <PageHeader
          title="Wallet & Payouts"
          subtitle="Manage withdrawal requests and wallet adjustments"
          actions={
            <Button
              variant="primary"
              size="sm"
              icon={<Plus size={14} />}
              onClick={() => setShowAdjust(true)}
            >
              Manual Adjustment
            </Button>
          }
        />
      </motion.div>

      {/* Stats */}
      <motion.div custom={1} variants={sectionVariants} initial="hidden" animate="visible">
        <WalletStats />
      </motion.div>

      {/* Withdrawals section */}
      <motion.div custom={2} variants={sectionVariants} initial="hidden" animate="visible" className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-[15px] text-light-text dark:text-dark-text">
            Withdrawal Requests
          </h2>
          <FilterSelect
            value={statusFilter}
            onChange={(v) => { setStatusFilter(v); setPage(1); }}
            options={STATUS_OPTIONS}
            placeholder="All"
            className="w-40"
          />
        </div>

        <WithdrawalTable
          withdrawals={withdrawals}
          isLoading={isLoading}
          page={page}
          totalPages={pagination?.totalPages ?? 1}
          total={pagination?.total ?? 0}
          limit={15}
          onPageChange={setPage}
          onApprove={handleApprove}
          onReject={setRejectTarget}
          approvingId={approvingId}
        />
      </motion.div>

      {/* Modals */}
      <ManualAdjustModal
        isOpen={showAdjust}
        onClose={() => setShowAdjust(false)}
      />

      <RejectWithdrawalModal
        isOpen={!!rejectTarget}
        onClose={() => setRejectTarget(null)}
        onConfirm={handleRejectConfirm}
        withdrawal={rejectTarget}
        loading={rejectMutation.isPending}
      />
    </div>
  );
}
