"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { Partner } from "@/types/partner";

interface DeleteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  partner: Partner | null;
  loading?: boolean;
}

export function DeleteUserModal({
  isOpen,
  onClose,
  onConfirm,
  partner,
  loading,
}: DeleteUserModalProps) {
  const [confirmText, setConfirmText] = useState("");

  const handleClose = () => {
    setConfirmText("");
    onClose();
  };

  const isConfirmed = confirmText === "DELETE";

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Delete User Permanently"
      size="sm"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={onConfirm}
            loading={loading}
            disabled={!isConfirmed || loading}
            className="!bg-brand-red !text-white hover:!bg-red-700 disabled:opacity-40"
          >
            Delete Permanently
          </Button>
        </>
      }
    >
      <div className="space-y-4">

        {/* Partner summary */}
        {partner && (
          <div className="px-3 py-3 rounded-xl bg-light-surface-2 dark:bg-dark-surface border border-light-border dark:border-dark-border">
            <p className="text-[13px] font-semibold text-light-text dark:text-dark-text">
              {partner.name}
            </p>
            <p className="text-[12px] text-light-text-3 dark:text-dark-text-3 mt-0.5">
              {partner.mobile} · {partner.partnerProfile?.subType === "VEHICLE_OWNER" ? "Vehicle Owner" : "Vendor"}
            </p>
          </div>
        )}

        {/* Danger banner */}
        <div className="px-3 py-3 rounded-xl bg-brand-red-muted border border-brand-red/20 space-y-1">
          <p className="text-[13px] font-bold text-brand-red">
            ⚠️ This action is permanent and cannot be undone.
          </p>
          <p className="text-[12px] text-brand-red/80 leading-relaxed">
            This will delete the user&apos;s account, all bookings, wallet history,
            KYC documents, images stored in R2, support tickets, and every other
            record associated with this user. There is no recovery.
          </p>
        </div>

        {/* Confirmation input */}
        <div>
          <label className="block text-[12px] font-medium text-light-text dark:text-dark-text mb-1.5">
            Type <span className="font-mono font-bold text-brand-red">DELETE</span> to confirm
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="Type DELETE here"
            className={cn(
              "input-base w-full font-mono",
              isConfirmed && "border-brand-red focus:border-brand-red"
            )}
            autoComplete="off"
          />
        </div>

      </div>
    </Modal>
  );
}
