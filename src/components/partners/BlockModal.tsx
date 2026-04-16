"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { Partner } from "@/types/partner";

interface BlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  partner: Partner | null;
  loading?: boolean;
}

export function BlockModal({
  isOpen,
  onClose,
  onConfirm,
  partner,
  loading,
}: BlockModalProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const handleConfirm = () => {
    if (reason.trim().length < 10) {
      setError("Please provide at least 10 characters");
      return;
    }
    onConfirm(reason.trim());
  };

  const handleClose = () => {
    setReason("");
    setError("");
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Block ${partner?.name ?? "Partner"}`}
      size="sm"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={handleConfirm}
            loading={loading}
            className="!bg-brand-red !text-white hover:!bg-red-600"
          >
            Block Permanently
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Danger banner */}
        <div className="px-3 py-3 rounded-xl bg-brand-red-muted border border-brand-red/20">
          <p className="text-[13px] text-brand-red leading-relaxed">
            <strong>This action is severe.</strong> Blocked partners cannot access
            the app at all and cannot be automatically reactivated.
          </p>
        </div>

        {/* Reason */}
        <div>
          <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1.5">
            Block Reason <span className="text-brand-red">*</span>
          </label>
          <textarea
            rows={3}
            value={reason}
            onChange={(e) => { setReason(e.target.value); setError(""); }}
            placeholder="Provide a detailed reason for blocking..."
            className={cn(
              "input-base resize-none",
              error && "border-brand-red focus:border-brand-red"
            )}
          />
          {error && (
            <p className="text-xs text-brand-red mt-1">{error}</p>
          )}
        </div>
      </div>
    </Modal>
  );
}
