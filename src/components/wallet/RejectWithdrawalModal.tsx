"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { WithdrawalRequest } from "@/types/wallet";
import { formatCurrency } from "@/lib/utils";

const REJECT_REASONS = [
  "Incorrect bank details",
  "KYC not completed",
  "Suspicious activity",
  "Minimum balance not maintained",
  "Other",
];

interface RejectWithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  withdrawal: WithdrawalRequest | null;
  loading?: boolean;
}

export function RejectWithdrawalModal({
  isOpen,
  onClose,
  onConfirm,
  withdrawal,
  loading,
}: RejectWithdrawalModalProps) {
  const [selectedReason, setSelectedReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [error, setError] = useState("");

  const handleConfirm = () => {
    const finalReason =
      selectedReason === "Other" ? customReason.trim() : selectedReason;
    if (!finalReason) {
      setError("Please select a reason");
      return;
    }
    onConfirm(finalReason);
  };

  const handleClose = () => {
    setSelectedReason("");
    setCustomReason("");
    setError("");
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Reject Withdrawal"
      size="sm"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleConfirm}
            loading={loading}
            className="!bg-brand-red !text-white hover:!bg-red-600"
          >
            Reject Request
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {withdrawal && (
          <div className="px-3 py-3 rounded-xl bg-light-surface-2 dark:bg-dark-surface border border-light-border dark:border-dark-border">
            <p className="text-[13px] font-medium text-light-text dark:text-dark-text">
              {withdrawal.user.name}
            </p>
            <p className="text-[12px] text-light-text-3 dark:text-dark-text-3 mt-0.5">
              {formatCurrency(withdrawal.amountINR)} · {withdrawal.accountHolder} · {withdrawal.bankAccount}
            </p>
          </div>
        )}

        <div>
          <p className="text-sm font-medium text-light-text dark:text-dark-text mb-2">
            Rejection Reason <span className="text-brand-red">*</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {REJECT_REASONS.map((r) => (
              <button
                key={r}
                onClick={() => { setSelectedReason(r); setError(""); }}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-[12px] font-medium border transition-all duration-150",
                  selectedReason === r
                    ? "bg-brand-purple text-white border-brand-purple"
                    : "border-light-border dark:border-dark-border text-light-text-2 dark:text-dark-text-2 hover:border-brand-purple hover:text-brand-purple"
                )}
              >
                {r}
              </button>
            ))}
          </div>
          {error && <p className="text-xs text-brand-red mt-1.5">{error}</p>}
        </div>

        {selectedReason === "Other" && (
          <textarea
            rows={3}
            value={customReason}
            onChange={(e) => setCustomReason(e.target.value)}
            placeholder="Describe the reason for rejection..."
            className="input-base resize-none text-sm"
          />
        )}
      </div>
    </Modal>
  );
}
