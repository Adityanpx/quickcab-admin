"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { FilterSelect } from "@/components/ui/FilterSelect";
import { cn } from "@/lib/utils";
import { formatDateTime } from "@/lib/utils";
import type { SupportTicket, TicketStatus } from "@/lib/api/support";
import { useSupportTicket } from "@/lib/hooks/useSupport";

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

  // Fetch the full ticket so we get the entire message thread, not just the
  // latest message the list endpoint returns.
  const { data: detailTicket, isLoading: isDetailLoading } = useSupportTicket(
    ticket?.id ?? ""
  );
  const messages = detailTicket?.messages ?? ticket?.messages ?? [];

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
          {/* Ticket header */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] font-semibold text-light-text dark:text-dark-text">
                {detailTicket?.subject ?? "Support ticket"}
              </p>
              <p className="text-[11px] text-light-text-3 dark:text-dark-text-3">
                {ticket.user.name} · {ticket.user.mobile}
                {detailTicket?.category ? ` · ${detailTicket.category}` : ""}
              </p>
            </div>
            <span className="text-[11px] text-light-text-3 dark:text-dark-text-3">
              {formatDateTime(ticket.createdAt)}
            </span>
          </div>

          {/* Conversation thread */}
          <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
            {isDetailLoading ? (
              <p className="text-[12px] text-light-text-3 dark:text-dark-text-3">
                Loading conversation…
              </p>
            ) : messages.length === 0 ? (
              <p className="text-[12px] text-light-text-3 dark:text-dark-text-3">
                No messages in this ticket.
              </p>
            ) : (
              messages.map((m) => {
                const isAdmin = m.senderType === "ADMIN";
                return (
                  <div
                    key={m.id}
                    className={cn(
                      "px-3 py-2 rounded-xl max-w-[85%]",
                      isAdmin
                        ? "ml-auto bg-brand-purple-muted dark:bg-brand-purple-muted-dark border border-brand-purple/20"
                        : "mr-auto bg-light-surface-2 dark:bg-dark-surface border border-light-border dark:border-dark-border"
                    )}
                  >
                    <p className="text-[10px] font-semibold mb-0.5 text-light-text-3 dark:text-dark-text-3">
                      {isAdmin ? "Admin" : ticket.user.name}
                    </p>
                    <p className="text-[13px] text-light-text dark:text-dark-text leading-relaxed whitespace-pre-wrap">
                      {m.message}
                    </p>
                    <p className="text-[10px] text-light-text-3 dark:text-dark-text-3 mt-1">
                      {formatDateTime(m.createdAt)}
                    </p>
                  </div>
                );
              })
            )}
          </div>

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
