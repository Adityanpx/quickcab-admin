"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { Rating } from "@/lib/api/ratings";

const REMOVE_REASONS = [
  "Fake/fraudulent rating",
  "Abusive content",
  "Spam",
  "Rating for wrong booking",
  "Admin correction",
  "Other",
];

interface RemoveRatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  rating: Rating | null;
  loading?: boolean;
}

export function RemoveRatingModal({
  isOpen,
  onClose,
  onConfirm,
  rating,
  loading,
}: RemoveRatingModalProps) {
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
      title="Remove Rating"
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
            Remove Rating
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {rating && (
          <div className="px-3 py-3 rounded-xl bg-light-surface-2 dark:bg-dark-surface border border-light-border dark:border-dark-border text-[13px]">
            <p className="font-medium text-light-text dark:text-dark-text">
              {rating.ratedBy.name} → {rating.ratedTo.name}
            </p>
            <p className="text-light-text-3 dark:text-dark-text-3 mt-0.5">
              {"⭐".repeat(rating.stars)} ({rating.stars}/5)
              {rating.comment && ` · "${rating.comment}"`}
            </p>
          </div>
        )}

        <div>
          <p className="text-sm font-medium text-light-text dark:text-dark-text mb-2">
            Removal Reason <span className="text-brand-red">*</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {REMOVE_REASONS.map((r) => (
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
            placeholder="Describe the reason..."
            className="input-base resize-none text-sm"
          />
        )}
      </div>
    </Modal>
  );
}
