"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { FilterSelect } from "@/components/ui/FilterSelect";
import { cn } from "@/lib/utils";
import { formatDateTime } from "@/lib/utils";
import type { SupportTicket, TicketStatus } from "@/lib/api/support";

const STATUS_OPTIONS: { value: TicketStatus; label: string }[] = [
  { value: "IN_REVIEW", label: "Mark In Review" },
  { value: "RESOLVED", label: "Mark Resolved" },
  { value: "CLOSED", label: "Close Ticket" },
];

interface TicketReplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (status: TicketStatus, note: string) => void;
  ticket: SupportTicket | null;
  loading?: boolean;
}

export function TicketReplyModal({
  isOpen,
  onClose,
  onConfirm,
  ticket,
  loading,
}: TicketReplyModalProps) {
  const [status, setStatus] = useState<TicketStatus>("IN_REVIEW");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  const handleConfirm = () => {
    if (!note.trim() || note.trim().length < 5) {
      setError("Please write a reply (min 5 characters)");
      return;
    }
    onConfirm(status, note.trim());
  };

  const handleClose = () => {
    setNote("");
    setError("");
    setStatus("IN_REVIEW");
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Reply to Ticket"
      size="md"
      footer={
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleConfirm}
            loading={loading}
          >
            Send Reply
          </Button>
        </>
      }
    >
      {ticket && (
        <div className="space-y-4">
          {/* Original ticket */}
          <div className="px-4 py-3 rounded-xl bg-light-surface-2 dark:bg-dark-surface border border-light-border dark:border-dark-border">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[13px] font-semibold text-light-text dark:text-dark-text">
                {ticket.issue}
              </p>
              <span className="text-[11px] text-light-text-3 dark:text-dark-text-3">
                {formatDateTime(ticket.createdAt)}
              </span>
            </div>
            <p className="text-[13px] text-light-text-2 dark:text-dark-text-2 leading-relaxed">
              {ticket.message}
            </p>
            <p className="text-[11px] text-light-text-3 dark:text-dark-text-3 mt-2">
              From: {ticket.user.name} · {ticket.user.mobile}
            </p>
          </div>

          {/* Previous admin note */}
          {ticket.adminNote && (
            <div className="px-4 py-3 rounded-xl bg-brand-purple-muted dark:bg-brand-purple-muted-dark border border-brand-purple/20">
              <p className="text-[11px] font-semibold text-brand-purple mb-1">
                Previous Admin Note
              </p>
              <p className="text-[13px] text-light-text dark:text-dark-text">
                {ticket.adminNote}
              </p>
            </div>
          )}

          {/* New status */}
          <div>
            <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1.5">
              Update Status
            </label>
            <FilterSelect
              value={status}
              onChange={(v) => setStatus(v as TicketStatus)}
              options={STATUS_OPTIONS}
              className="w-full"
            />
          </div>

          {/* Reply note */}
          <div>
            <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1.5">
              Your Reply <span className="text-brand-red">*</span>
            </label>
            <textarea
              rows={4}
              value={note}
              onChange={(e) => { setNote(e.target.value); setError(""); }}
              placeholder="Write your reply to the user. This will be sent via push notification and WhatsApp..."
              className={cn(
                "input-base resize-none",
                error && "border-brand-red"
              )}
            />
            {error && (
              <p className="text-xs text-brand-red mt-1">{error}</p>
            )}
            <p className="text-[11px] text-light-text-3 dark:text-dark-text-3 mt-1">
              Sent via Push Notification + WhatsApp to the user
            </p>
          </div>
        </div>
      )}
    </Modal>
  );
}
