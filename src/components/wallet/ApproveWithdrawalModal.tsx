"use client";

import { useState } from "react";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { WithdrawalRequest } from "@/types/wallet";

interface ApproveWithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (utr?: string) => Promise<void>;
  withdrawal: WithdrawalRequest | null;
  loading: boolean;
}

export function ApproveWithdrawalModal({
  isOpen,
  onClose,
  onConfirm,
  withdrawal,
  loading,
}: ApproveWithdrawalModalProps) {
  const [utr, setUtr] = useState("");

  if (!isOpen || !withdrawal) return null;

  const handleConfirm = async () => {
    await onConfirm(utr.trim() || undefined);
    setUtr("");
  };

  const handleClose = () => {
    setUtr("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md bg-light-surface dark:bg-dark-surface rounded-2xl shadow-2xl border border-light-border dark:border-dark-border p-6">

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <CheckCircle size={18} className="text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h2 className="text-[15px] font-semibold text-light-text dark:text-dark-text">
              Confirm Payment
            </h2>
            <p className="text-[12px] text-light-text-3 dark:text-dark-text-3">
              Mark this withdrawal as paid
            </p>
          </div>
        </div>

        {/* Withdrawal summary */}
        <div className="p-4 rounded-xl bg-light-surface-2 dark:bg-dark-surface-2 border border-light-border dark:border-dark-border mb-5 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[12px] text-light-text-3 dark:text-dark-text-3">Partner</span>
            <span className="text-[13px] font-medium text-light-text dark:text-dark-text">
              {withdrawal.user.name}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[12px] text-light-text-3 dark:text-dark-text-3">Amount</span>
            <span className="text-[15px] font-bold text-light-text dark:text-dark-text">
              ₹{withdrawal.amountINR.toLocaleString("en-IN")}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[12px] text-light-text-3 dark:text-dark-text-3">Account</span>
            <span className="text-[12px] font-mono text-light-text-2 dark:text-dark-text-2">
              {withdrawal.bankAccount} · {withdrawal.ifsc}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[12px] text-light-text-3 dark:text-dark-text-3">Holder</span>
            <span className="text-[12px] text-light-text-2 dark:text-dark-text-2">
              {withdrawal.accountHolder}
            </span>
          </div>
        </div>

        {/* UTR input */}
        <div className="mb-5">
          <label className="block text-[13px] font-medium text-light-text dark:text-dark-text mb-1.5">
            UTR / Transaction Reference
            <span className="ml-1.5 text-[11px] font-normal text-light-text-3 dark:text-dark-text-3">
              (optional)
            </span>
          </label>
          <input
            type="text"
            value={utr}
            onChange={(e) => setUtr(e.target.value)}
            placeholder="e.g. 407316372649"
            className="input-base w-full"
            autoFocus
          />
          <p className="text-[11px] text-light-text-3 dark:text-dark-text-3 mt-1.5">
            Enter the UTR number from your banking app after transferring the money. The partner will see this in their wallet.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="flex-1"
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="success"
            size="sm"
            className="flex-1"
            icon={<CheckCircle size={14} />}
            loading={loading}
            onClick={handleConfirm}
          >
            Mark as Paid
          </Button>
        </div>
      </div>
    </div>
  );
}
