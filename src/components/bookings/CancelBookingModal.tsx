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

const CANCEL_REASONS = [
  "Duplicate booking",
  "Customer request",
  "Partner unavailable",
  "Fake/fraudulent booking",
  "Booking error",
  "Other",
];

export function CancelBookingModal({
  isOpen,
  onClose,
  onConfirm,
  booking,
  loading,
}: CancelBookingModalProps) {
  const [selectedReason, setSelectedReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [error, setError] = useState("");

  const handleConfirm = () => {
    const finalReason =
      selectedReason === "Other" ? customReason.trim() : selectedReason;
    if (!finalReason) {
      setError("Please select or enter a reason");
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

        {/* Warning */}
        <div className="px-3 py-2.5 rounded-xl bg-brand-red-muted border border-brand-red/20">
          <p className="text-[12px] text-brand-red">
            This will cancel the booking immediately. Both partners will be notified.
            {booking?.coinsAwarded === false && " No coins have been awarded yet."}
          </p>
        </div>

        {/* Reason pills */}
        <div>
          <p className="text-sm font-medium text-light-text dark:text-dark-text mb-2">
            Reason <span className="text-brand-red">*</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {CANCEL_REASONS.map((r) => (
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
          {error && (
            <p className="text-xs text-brand-red mt-1.5">{error}</p>
          )}
        </div>

        {/* Custom reason if "Other" */}
        {selectedReason === "Other" && (
          <div>
            <textarea
              rows={3}
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder="Describe the reason..."
              className="input-base resize-none text-sm"
            />
          </div>
        )}
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
