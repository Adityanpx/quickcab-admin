"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, ZoomIn, Download, FileX, CheckCircle, XCircle,
  AlertCircle, RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────
export interface DocItem {
  label: string;
  fieldKey: string;        // e.g. "aadhaarFront", "drivingLicence"
  url: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  rejectReason: string | null;
  isResubmitted?: boolean; // true if this doc is in resubmittedDocuments[]
}

interface KycDocViewerProps {
  docs: DocItem[];
  onApproveDoc?: (fieldKey: string) => void;
  onRejectDoc?: (fieldKey: string, reason: string) => void;
  loading?: boolean;
}

// ─── Single Document Card ─────────────────────────────────
function DocCard({
  doc,
  onView,
  onApprove,
  onReject,
  loading,
}: {
  doc: DocItem;
  onView: (url: string, label: string) => void;
  onApprove?: (fieldKey: string) => void;
  onReject?: (fieldKey: string) => void;
  loading?: boolean;
}) {
  const statusBorder = {
    PENDING: "border-light-border dark:border-dark-border",
    APPROVED: "border-green-400 dark:border-brand-green",
    REJECTED: "border-brand-red",
  }[doc.status];

  const statusBg = {
    PENDING: "",
    APPROVED: "bg-green-50/40 dark:bg-brand-green-muted/20",
    REJECTED: "bg-red-50/40 dark:bg-brand-red-muted/20",
  }[doc.status];

  if (!doc.url) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-2 h-40 rounded-xl",
          "border-2 border-dashed",
          statusBorder,
          "bg-light-surface-2 dark:bg-dark-surface"
        )}
      >
        <FileX size={22} className="text-light-text-3 dark:text-dark-text-3" />
        <div className="text-center">
          <p className="text-[12px] font-medium text-light-text-2 dark:text-dark-text-2">
            {doc.label}
          </p>
          <p className="text-[11px] text-light-text-3 dark:text-dark-text-3">
            Not uploaded
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-xl overflow-hidden border-2",
        statusBorder, statusBg,
        "bg-white dark:bg-dark-surface transition-colors"
      )}
    >
      {/* Resubmitted badge */}
      {doc.isResubmitted && (
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-purple text-white text-[11px] font-semibold">
          <RefreshCw size={11} />
          Resubmitted — review again
        </div>
      )}

      {/* Image area */}
      <div className="group relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={doc.url}
          alt={doc.label}
          className="w-full h-36 object-cover"
        />
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button
            onClick={() => onView(doc.url!, doc.label)}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
            title="Zoom in"
          >
            <ZoomIn size={15} />
          </button>
          <a
            href={doc.url}
            download
            target="_blank"
            rel="noreferrer"
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
            title="Download"
          >
            <Download size={15} />
          </a>
        </div>
      </div>

      {/* Label + status */}
      <div className="px-3 py-2 border-t border-light-border dark:border-dark-border">
        <div className="flex items-center justify-between mb-1">
          <p className="text-[12px] font-semibold text-light-text dark:text-dark-text">
            {doc.label}
          </p>
          {doc.status === "APPROVED" && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 dark:text-brand-green">
              <CheckCircle size={11} /> APPROVED
            </span>
          )}
          {doc.status === "REJECTED" && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-brand-red">
              <XCircle size={11} /> REJECTED
            </span>
          )}
          {doc.status === "PENDING" && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-light-text-3 dark:text-dark-text-3">
              <AlertCircle size={11} /> PENDING
            </span>
          )}
        </div>

        {/* Reject reason display */}
        {doc.rejectReason && doc.status === "REJECTED" && (
          <p className="text-[11px] text-brand-red mt-1 leading-relaxed">
            Reason: {doc.rejectReason}
          </p>
        )}
      </div>

      {/* Per-document action buttons */}
      {(onApprove || onReject) && doc.status !== "APPROVED" && (
        <div className="px-3 pb-3 flex gap-2">
          {onApprove && (
            <button
              onClick={() => onApprove(doc.fieldKey)}
              disabled={loading}
              className={cn(
                "flex-1 py-1.5 rounded-lg text-[11px] font-semibold",
                "text-white bg-brand-purple hover:bg-brand-purple-dark",
                "transition-colors disabled:opacity-50"
              )}
            >
              ✓ Approve
            </button>
          )}
          {doc.status !== "REJECTED" && onReject && (
            <button
              onClick={() => onReject(doc.fieldKey)}
              disabled={loading}
              className={cn(
                "flex-1 py-1.5 rounded-lg text-[11px] font-semibold",
                "text-brand-red bg-brand-red-muted border border-brand-red/20",
                "hover:bg-red-100 dark:hover:bg-red-950 transition-colors disabled:opacity-50"
              )}
            >
              ✕ Reject
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main KycDocViewer ────────────────────────────────────
export function KycDocViewer({
  docs,
  onApproveDoc,
  onRejectDoc,
  loading,
}: KycDocViewerProps) {
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [lightboxLabel, setLightboxLabel] = useState("");
  const [rejectTarget, setRejectTarget] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const handleRejectConfirm = () => {
    if (!rejectTarget || !rejectReason.trim()) return;
    onRejectDoc?.(rejectTarget, rejectReason.trim());
    setRejectTarget(null);
    setRejectReason("");
  };

  return (
    <>
      {/* Doc Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {docs.map((doc) => (
          <DocCard
            key={doc.fieldKey}
            doc={doc}
            onView={(url, label) => {
              setLightboxUrl(url);
              setLightboxLabel(label);
            }}
            onApprove={onApproveDoc ? (key) => onApproveDoc(key) : undefined}
            onReject={
              onRejectDoc
                ? (key) => {
                    setRejectTarget(key);
                    setRejectReason("");
                  }
                : undefined
            }
            loading={loading}
          />
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxUrl && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLightboxUrl(null)}
              className="absolute inset-0 bg-black/85"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="relative z-10 max-w-2xl w-full"
            >
              <p className="text-white text-center text-sm font-medium mb-3">
                {lightboxLabel}
              </p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={lightboxUrl}
                alt="KYC Document"
                className="w-full rounded-2xl object-contain max-h-[80vh]"
              />
              <button
                onClick={() => setLightboxUrl(null)}
                className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-white text-gray-800 flex items-center justify-center shadow-lg hover:bg-gray-100 transition-colors"
              >
                <X size={15} />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Per-document Reject Reason Modal */}
      <AnimatePresence>
        {rejectTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setRejectTarget(null)}
              className="absolute inset-0 bg-black/60"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="relative z-10 w-full max-w-md bg-white dark:bg-dark-surface rounded-2xl p-6 shadow-2xl"
            >
              <h3 className="font-bold text-[15px] text-light-text dark:text-dark-text mb-1">
                Reject Document
              </h3>
              <p className="text-[13px] text-light-text-2 dark:text-dark-text-2 mb-4">
                Type the reason — the partner will see this exact message and must fix this document before resubmitting.
              </p>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Image is blurry, please upload a clearer photo..."
                className="input-base resize-none w-full mb-4"
                autoFocus
              />
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setRejectTarget(null)}
                  className="px-4 py-2 rounded-xl text-[13px] font-medium text-light-text-2 dark:text-dark-text-2 hover:bg-light-surface-2 dark:hover:bg-dark-surface transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRejectConfirm}
                  disabled={!rejectReason.trim() || loading}
                  className="px-4 py-2 rounded-xl text-[13px] font-semibold text-white bg-brand-red hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  Reject Document
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── KYC Approve / Reject action bar (full KYC decision) ──
export function KycActionBar({
  kycStatus,
  onApprove,
  onReject,
  loading,
}: {
  kycStatus: string;
  onApprove: () => void;
  onReject: () => void;
  loading?: boolean;
}) {
  if (kycStatus === "APPROVED") {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-green-50 dark:bg-brand-green-muted border border-green-200 dark:border-brand-green/20">
        <CheckCircle size={16} className="text-green-600 dark:text-brand-green" />
        <p className="text-[13px] font-medium text-green-700 dark:text-brand-green">
          KYC Approved
        </p>
      </div>
    );
  }

  if (kycStatus === "REJECTED") {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-brand-red-muted border border-brand-red/20">
        <XCircle size={16} className="text-brand-red" />
        <p className="text-[13px] font-medium text-brand-red">
          KYC Rejected — awaiting resubmission
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={onReject}
        disabled={loading}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-medium",
          "text-brand-red bg-brand-red-muted border border-brand-red/20",
          "hover:bg-red-100 dark:hover:bg-red-950 transition-colors disabled:opacity-50"
        )}
      >
        <XCircle size={14} />
        Reject KYC (all pending docs)
      </button>
      <button
        onClick={onApprove}
        disabled={loading}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-medium",
          "text-white bg-brand-purple hover:bg-brand-purple-dark",
          "shadow-purple-glow transition-colors disabled:opacity-50"
        )}
      >
        <CheckCircle size={14} />
        Approve KYC
      </button>
    </div>
  );
}
