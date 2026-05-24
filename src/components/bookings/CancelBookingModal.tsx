"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { Booking } from "@/types/booking";

interface CancelBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  booking: Booking | null;
  loading?: boolean;
}

// Quick-fill preset reasons — clicking one fills the textarea, admin can then edit
const REASON_PRESETS = [
  "Duplicate booking",
  "Customer request",
  "Partner unavailable",
  "Fraudulent/fake booking",
  "Booking posted in error",
];

export function CancelBookingModal({
  isOpen,
  onClose,
  onConfirm,
  booking,
  loading,
}: CancelBookingModalProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const handleConfirm = () => {
    const trimmed = reason.trim();
    if (!trimmed) {
      setError("Please provide a reason — the partner will see this");
      return;
    }
    if (trimmed.length < 10) {
      setError("Reason must be at least 10 characters");
      return;
    }
    onConfirm(trimmed);
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
      title="Cancel Booking"
      size="sm"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={handleClose} disabled={loading}>
            Go Back
          </Button>
          <Button
            size="sm"
            onClick={handleConfirm}
            loading={loading}
            className="!bg-brand-red !text-white hover:!bg-red-600"
          >
            Cancel Booking
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Booking summary */}
        {booking && (
          <div className="px-3 py-3 rounded-xl bg-light-surface-2 dark:bg-dark-surface border border-light-border dark:border-dark-border">
            <p className="text-[13px] font-medium text-light-text dark:text-dark-text">
              {booking.pickupCity} → {booking.dropCity}
            </p>
            <p className="text-[12px] text-light-text-3 dark:text-dark-text-3 mt-0.5">
              {formatDateSimple(booking.date)} · {booking.time} · #{booking.id.slice(-8).toUpperCase()}
            </p>
          </div>
        )}

        {/* Partner visibility warning */}
        <div className="px-3 py-2.5 rounded-xl bg-brand-orange-muted border border-brand-orange/20">
          <p className="text-[12px] text-brand-orange font-medium">
            ⚠️ The partner who posted this booking will see the reason you write below.
            Write clearly so they understand why their booking was cancelled.
          </p>
        </div>

        {/* Quick-fill preset pills */}
        <div>
          <p className="text-[12px] font-medium text-light-text-2 dark:text-dark-text-2 mb-2">
            Quick fill (click to use, then edit if needed):
          </p>
          <div className="flex flex-wrap gap-1.5">
            {REASON_PRESETS.map((preset) => (
              <button
                key={preset}
                onClick={() => { setReason(preset); setError(""); }}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all duration-150",
                  reason === preset
                    ? "bg-brand-purple text-white border-brand-purple"
                    : "border-light-border dark:border-dark-border text-light-text-2 dark:text-dark-text-2 hover:border-brand-purple hover:text-brand-purple"
                )}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Mandatory reason textarea */}
        <div>
          <label className="block text-[12px] font-medium text-light-text dark:text-dark-text mb-1.5">
            Cancellation reason <span className="text-brand-red">*</span>
          </label>
          <textarea
            rows={3}
            value={reason}
            onChange={(e) => { setReason(e.target.value); setError(""); }}
            placeholder="Describe exactly why this booking is being cancelled..."
            className={cn(
              "input-base resize-none text-sm w-full",
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

function formatDateSimple(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
