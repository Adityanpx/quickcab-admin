"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, ZoomIn, ZoomOut, RotateCw, Download, FileX, CheckCircle, XCircle,
  AlertCircle, RefreshCw, Upload, Loader2, ChevronLeft, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Inline loaders (unique to KYC flow) ──────────────────
// Three-dot pulse loader — replaces Loader2 inside KYC action buttons.
// Tiny enough for xs buttons, smooth without dependencies.
function ThreeDotsLoader({ tone = "currentColor" }: { tone?: string }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className="inline-flex items-center gap-[3px]"
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="inline-block w-[5px] h-[5px] rounded-full kyc-dot-pulse"
          style={{
            background: tone,
            animationDelay: `${i * 140}ms`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes kycDotPulse {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.45; }
          40%           { transform: scale(1);   opacity: 1;    }
        }
        .kyc-dot-pulse {
          animation: kycDotPulse 1s ease-in-out infinite both;
        }
      `}</style>
    </span>
  );
}

// Card-level processing overlay — sits on top of the doc image while the
// admin's approve/reject is in-flight on THIS specific card. Tone = brand
// colour for approve (purple) or red for reject.
function CardProcessingOverlay({ label, tone }: { label: string; tone: "approve" | "reject" }) {
  const ring = tone === "approve" ? "#7C5CFF" : "#EF4444";
  const text = tone === "approve" ? "Approving" : "Rejecting";
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-gradient-to-b from-black/55 via-black/45 to-black/55 backdrop-blur-[2px] pointer-events-none"
    >
      {/* Spinning ring with fading tail */}
      <svg width="34" height="34" viewBox="0 0 34 34" className="kyc-ring-spin">
        <defs>
          <linearGradient id={`kyc-tail-${tone}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"  stopColor={ring} stopOpacity="0" />
            <stop offset="100%" stopColor={ring} stopOpacity="1" />
          </linearGradient>
        </defs>
        <circle cx="17" cy="17" r="13" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="2.5" />
        <circle
          cx="17" cy="17" r="13" fill="none"
          stroke={`url(#kyc-tail-${tone})`}
          strokeWidth="2.5" strokeLinecap="round"
          strokeDasharray="55 100" transform="rotate(-90 17 17)"
        />
      </svg>
      <p className="text-[11px] font-semibold text-white tracking-wide">
        {text} {label}…
      </p>
      <style jsx>{`
        @keyframes kycRingSpin { to { transform: rotate(360deg); } }
        .kyc-ring-spin { animation: kycRingSpin 0.9s linear infinite; }
      `}</style>
    </motion.div>
  );
}

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
  userId?: string;
  aadhaarNumber?: string | null;
  subjectName?: string | null;
  subjectMobile?: string | null;
  subjectDob?: string | null;   // already formatted for display by the caller
  subjectRole?: string | null;  // already formatted for display by the caller, e.g. "Vehicle Owner"
  onApproveDoc?: (fieldKey: string) => void;
  onRejectDoc?: (fieldKey: string, reason: string) => void;
  onUploadDoc?: (fieldKey: string, file: File) => void;
  uploadingField?: string | null;
  loading?: boolean;
  processingField?: string | null;
}

// ─── Single Document Card ─────────────────────────────────
function DocCard({
  doc,
  onView,
  onApprove,
  onReject,
  onUpload,
  isUploading,
  loading,
  processingField,
}: {
  doc: DocItem;
  onView: (fieldKey: string) => void;
  onApprove?: (fieldKey: string) => void;
  onReject?: (fieldKey: string) => void;
  onUpload?: (fieldKey: string, file: File) => void;
  isUploading?: boolean;
  loading?: boolean;
  processingField?: string | null;
}) {
  console.log(`[KYC_DOC] Rendering doc: ${doc.label}`);
  console.log(`[KYC_DOC] URL received from API: ${doc.url}`);
  console.log(`[KYC_DOC] Status: ${doc.status}`);

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
        {onUpload && (
          <label className={cn(
            "mt-1 flex items-center gap-1.5 px-3 py-1.5 rounded-lg cursor-pointer",
            "text-[11px] font-semibold text-brand-purple",
            "bg-brand-purple-muted dark:bg-brand-purple-muted-dark",
            "hover:bg-brand-purple/20 transition-colors",
            isUploading && "opacity-50 pointer-events-none"
          )}>
            {isUploading ? (
              <><Loader2 size={11} className="animate-spin" /> Uploading...</>
            ) : (
              <><Upload size={11} /> Add Image</>
            )}
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png"
              className="sr-only"
              disabled={isUploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onUpload(doc.fieldKey, file);
                e.target.value = "";
              }}
            />
          </label>
        )}
      </div>
    );
  }

  const isProcessing = processingField === doc.fieldKey;

  return (
    <div
      className={cn(
        "rounded-xl overflow-hidden border-2 transition-all",
        statusBorder, statusBg,
        "bg-white dark:bg-dark-surface",
        isProcessing && "kyc-card-glow"
      )}
    >
      {isProcessing && (
        <style jsx>{`
          @keyframes kycCardGlow {
            0%, 100% { box-shadow: 0 0 0 0 rgba(124, 92, 255, 0.0); }
            50%      { box-shadow: 0 0 0 6px rgba(124, 92, 255, 0.18); }
          }
          .kyc-card-glow { animation: kycCardGlow 1.4s ease-in-out infinite; }
        `}</style>
      )}
      {/* Resubmitted badge */}
      {doc.isResubmitted && (
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-purple text-white text-[11px] font-semibold">
          <RefreshCw size={11} />
          Resubmitted — review again
        </div>
      )}

      {/* Image area — click anywhere to open viewer */}
      <div
        className="group relative overflow-hidden cursor-pointer"
        onClick={() => onView(doc.fieldKey)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={doc.url}
          alt={doc.label}
          className="w-full h-36 object-cover transition-transform duration-300 group-hover:scale-105"
          onLoad={() => {
            console.log(`[KYC_DOC] ✅ Image loaded successfully — ${doc.label}`);
            console.log(`[KYC_DOC] URL: ${doc.url}`);
          }}
          onError={(e) => {
            console.error(`[KYC_DOC] ❌ Image failed to load — ${doc.label}`);
            console.error(`[KYC_DOC] URL that failed: ${doc.url}`);
            console.error(`[KYC_DOC] Error event:`, e);
          }}
        />
        {/* Subtle dark tint on hover — no buttons */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 pointer-events-none" />

        {/* Processing overlay — only on the card currently being approved/rejected */}
        <AnimatePresence>
          {processingField === doc.fieldKey && (
            <CardProcessingOverlay
              label={doc.label}
              tone={doc.status === "REJECTED" ? "reject" : "approve"}
            />
          )}
        </AnimatePresence>
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
        <div className="px-3 pb-2 flex gap-2">
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
              {processingField === doc.fieldKey ? (
                <ThreeDotsLoader tone="#FFFFFF" />
              ) : (
                <CheckCircle size={11} />
              )}
              {processingField === doc.fieldKey ? "Approving..." : "Approve"}
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
              {processingField === doc.fieldKey ? (
                <ThreeDotsLoader />
              ) : (
                <XCircle size={11} />
              )}
              {processingField === doc.fieldKey ? "Rejecting..." : "Reject"}
            </button>
          )}
        </div>
      )}

      {/* Admin upload/replace image button — always shown when onUpload is provided */}
      {onUpload && (
        <div className="px-3 pb-3">
          <label className={cn(
            "flex items-center justify-center gap-1.5 w-full py-1.5 rounded-lg cursor-pointer",
            "text-[11px] font-semibold",
            "border border-light-border dark:border-dark-border",
            "text-light-text-2 dark:text-dark-text-2",
            "hover:bg-light-surface-2 dark:hover:bg-dark-surface hover:border-brand-purple hover:text-brand-purple",
            "transition-colors",
            isUploading && "opacity-50 pointer-events-none"
          )}>
            {isUploading ? (
              <><Loader2 size={11} className="animate-spin" /> Uploading...</>
            ) : (
              <><Upload size={11} /> {doc.url ? "Replace Image" : "Upload Image"}</>
            )}
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png"
              className="sr-only"
              disabled={isUploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onUpload(doc.fieldKey, file);
                e.target.value = "";
              }}
            />
          </label>
        </div>
      )}
    </div>
  );
}

const QUICK_REJECT_REASONS = [
  "Image is blurry",
  "Details don't match profile",
  "Document expired",
  "Wrong document uploaded",
  "Image is cropped / incomplete",
];

// Formats a raw 12-digit Aadhaar number into 3 groups of 4 for display,
// e.g. "907692483828" -> "9076 9248 3828". Returns null if the input
// isn't a clean 12-digit number, so callers can safely skip rendering.
function formatAadhaarNumber(raw?: string | null): string | null {
  if (!raw) return null;
  const digitsOnly = raw.replace(/\D/g, "");
  if (digitsOnly.length !== 12) return raw; // fall back to raw value if unexpected format
  return `${digitsOnly.slice(0, 4)} ${digitsOnly.slice(4, 8)} ${digitsOnly.slice(8, 12)}`;
}

// ─── Main KycDocViewer ────────────────────────────────────
export function KycDocViewer({
  docs,
  userId,
  aadhaarNumber,
  subjectName,
  subjectMobile,
  subjectDob,
  subjectRole,
  onApproveDoc,
  onRejectDoc,
  onUploadDoc,
  uploadingField,
  loading,
  processingField,
}: KycDocViewerProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useState({ x: 0, y: 0, panX: 0, panY: 0 })[0];
  const [showRejectPanel, setShowRejectPanel] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  // Only documents that actually have an uploaded image can be viewed/navigated.
  const viewableDocs = docs.filter((d) => !!d.url);
  const currentDoc = lightboxIndex !== null ? viewableDocs[lightboxIndex] : null;

  const resetView = () => {
    setZoom(1);
    setRotation(0);
    setPan({ x: 0, y: 0 });
  };

  const openLightbox = (fieldKey: string) => {
    const idx = viewableDocs.findIndex((d) => d.fieldKey === fieldKey);
    if (idx === -1) return;
    setLightboxIndex(idx);
    resetView();
    setShowRejectPanel(false);
    setRejectReason("");
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
    resetView();
    setShowRejectPanel(false);
    setRejectReason("");
  };

  const goTo = (idx: number) => {
    if (idx < 0 || idx >= viewableDocs.length) return;
    setLightboxIndex(idx);
    resetView();
    setShowRejectPanel(false);
    setRejectReason("");
  };

  const goNext = () => {
    if (lightboxIndex === null) return;
    goTo(lightboxIndex + 1);
  };

  const goPrev = () => {
    if (lightboxIndex === null) return;
    goTo(lightboxIndex - 1);
  };

  const handleApproveCurrent = () => {
    if (!currentDoc) return;
    onApproveDoc?.(currentDoc.fieldKey);
    // Optimistic advance — the parent tracks real in-flight state via processingField.
    if (lightboxIndex !== null && lightboxIndex < viewableDocs.length - 1) {
      goNext();
    } else {
      closeLightbox();
    }
  };

  const handleRejectConfirm = () => {
    if (!currentDoc || !rejectReason.trim()) return;
    onRejectDoc?.(currentDoc.fieldKey, rejectReason.trim());
    setShowRejectPanel(false);
    setRejectReason("");
    if (lightboxIndex !== null && lightboxIndex < viewableDocs.length - 1) {
      goNext();
    } else {
      closeLightbox();
    }
  };

  // Legacy modal path kept for the DocCard's own inline Reject button
  // (grid view, outside the lightbox) — unchanged behavior.
  const [cardRejectTarget, setCardRejectTarget] = useState<string | null>(null);
  const [cardRejectReason, setCardRejectReason] = useState("");
  const handleCardRejectConfirm = () => {
    if (!cardRejectTarget || !cardRejectReason.trim()) return;
    onRejectDoc?.(cardRejectTarget, cardRejectReason.trim());
    setCardRejectTarget(null);
    setCardRejectReason("");
  };

  // ── Drag-to-pan ─────────────────────────────────────────
  const handlePointerDown = (e: React.PointerEvent) => {
    if (zoom <= 1) return; // only pan when zoomed in
    setIsDragging(true);
    dragStartRef.x = e.clientX;
    dragStartRef.y = e.clientY;
    dragStartRef.panX = pan.x;
    dragStartRef.panY = pan.y;
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.x;
    const dy = e.clientY - dragStartRef.y;
    setPan({ x: dragStartRef.panX + dx, y: dragStartRef.panY + dy });
  };

  const handlePointerUp = () => setIsDragging(false);

  // Reset pan whenever zoom returns to 100% so the image re-centers.
  const applyZoom = (next: number) => {
    const clamped = Math.min(5, Math.max(0.25, parseFloat(next.toFixed(2))));
    setZoom(clamped);
    if (clamped <= 1) setPan({ x: 0, y: 0 });
  };

  // ── Keyboard shortcuts ──────────────────────────────────
  React.useEffect(() => {
    if (lightboxIndex === null) return;
    const handler = (e: KeyboardEvent) => {
      // Don't hijack keys while typing in the reject textarea.
      if (showRejectPanel) {
        if (e.key === "Escape") { setShowRejectPanel(false); setRejectReason(""); }
        return;
      }
      if (e.key === "Escape") closeLightbox();
      else if (e.key === "ArrowRight") goNext();
      else if (e.key === "ArrowLeft") goPrev();
      else if (e.key.toLowerCase() === "a" && currentDoc?.status !== "APPROVED") handleApproveCurrent();
      else if (e.key.toLowerCase() === "r" && currentDoc?.status !== "REJECTED") setShowRejectPanel(true);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightboxIndex, showRejectPanel, currentDoc]);

  return (
    <>
      {/* Doc Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {docs.map((doc) => (
          <DocCard
            key={doc.fieldKey}
            doc={doc}
            onView={openLightbox}
            onApprove={onApproveDoc ? (key) => onApproveDoc(key) : undefined}
            onReject={
              onRejectDoc
                ? (key) => {
                    setCardRejectTarget(key);
                    setCardRejectReason("");
                  }
                : undefined
            }
            onUpload={onUploadDoc}
            isUploading={uploadingField === doc.fieldKey}
            loading={loading}
            processingField={processingField}
          />
        ))}
      </div>

      {/* Full-screen Lightbox — zoom · rotate · drag-to-pan · inline approve/reject · nav */}
      <AnimatePresence>
        {currentDoc && lightboxIndex !== null && (
          <div className="fixed inset-0 z-50 flex flex-col select-none bg-black">
            {/* Backdrop (click empty toolbar area or Esc to close — image drag doesn't close) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black"
            />

            {/* Toolbar */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="relative z-10 flex items-center justify-between gap-2 px-4 py-3 bg-white/5 backdrop-blur-sm"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-white text-[13px] font-semibold truncate max-w-[200px]">
                  {currentDoc.label}
                </span>
                <span className="text-white/40 text-[12px] font-mono whitespace-nowrap">
                  {lightboxIndex + 1} / {viewableDocs.length}
                </span>
                {currentDoc.status === "APPROVED" && (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-brand-green whitespace-nowrap">
                    <CheckCircle size={12} /> APPROVED
                  </span>
                )}
                {currentDoc.status === "REJECTED" && (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-brand-red whitespace-nowrap">
                    <XCircle size={12} /> REJECTED
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 flex-wrap justify-end">
                {/* Prev / Next */}
                <button
                  onClick={goPrev}
                  disabled={lightboxIndex === 0}
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/25 disabled:opacity-30 disabled:hover:bg-white/10 flex items-center justify-center text-white transition-colors"
                  title="Previous (←)"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={goNext}
                  disabled={lightboxIndex === viewableDocs.length - 1}
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/25 disabled:opacity-30 disabled:hover:bg-white/10 flex items-center justify-center text-white transition-colors"
                  title="Next (→)"
                >
                  <ChevronRight size={16} />
                </button>

                <div className="w-px h-5 bg-white/20 mx-1" />

                <button
                  onClick={() => applyZoom(zoom - 0.1)}
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition-colors"
                  title="Zoom out"
                >
                  <ZoomOut size={15} />
                </button>
                <span className="text-white/60 text-[12px] font-mono w-11 text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  onClick={() => applyZoom(zoom + 0.1)}
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition-colors"
                  title="Zoom in"
                >
                  <ZoomIn size={15} />
                </button>

                <div className="w-px h-5 bg-white/20 mx-1" />

                <button
                  onClick={() => setRotation((p) => (p + 90) % 360)}
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition-colors"
                  title="Rotate 90°"
                >
                  <RotateCw size={15} />
                </button>
                <button
                  onClick={resetView}
                  className="px-3 h-8 rounded-lg bg-white/10 hover:bg-white/25 text-white/60 hover:text-white text-[11px] font-medium transition-colors"
                >
                  Reset
                </button>

                <div className="w-px h-5 bg-white/20 mx-1" />

                <a
                  href={currentDoc.url!}
                  download
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition-colors"
                  title="Download"
                >
                  <Download size={15} />
                </a>
                <button
                  onClick={closeLightbox}
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-red-500/50 flex items-center justify-center text-white transition-colors"
                  title="Close (Esc)"
                >
                  <X size={15} />
                </button>
              </div>
            </motion.div>

            {/* Image viewport — full remaining screen, drag-to-pan when zoomed */}
            <div
              className="relative z-10 flex-1 overflow-hidden"
              style={{ cursor: zoom > 1 ? (isDragging ? "grabbing" : "grab") : "default" }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
              onWheel={(e) => applyZoom(zoom + (e.deltaY < 0 ? 0.1 : -0.1))}
            >
              {(currentDoc.fieldKey === "aadhaarFront" || currentDoc.fieldKey === "aadhaarBack") && (
                <div className="absolute top-4 left-4 z-20 rounded-xl bg-black/55 backdrop-blur-md border border-white/10 px-4 py-3 pointer-events-none max-w-[260px]">
                  <p className="text-white/50 text-[10px] font-semibold tracking-wide uppercase mb-2">
                    Verify against document
                  </p>
                  <div className="space-y-1.5">
                    <div className="flex items-baseline gap-2">
                      <span className="text-white/40 text-[11px] w-16 shrink-0">Name</span>
                      <span className="text-white text-[13px] font-medium truncate">
                        {subjectName || "—"}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-white/40 text-[11px] w-16 shrink-0">Mobile</span>
                      <span className="text-white text-[13px] font-mono">
                        {subjectMobile || "—"}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-white/40 text-[11px] w-16 shrink-0">DOB</span>
                      <span className="text-white text-[13px]">
                        {subjectDob || "—"}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-white/40 text-[11px] w-16 shrink-0">Aadhaar</span>
                      <span className="text-white text-[13px] font-mono font-semibold tracking-wide">
                        {formatAadhaarNumber(aadhaarNumber) || "—"}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-white/40 text-[11px] w-16 shrink-0">Role</span>
                      <span className="text-white text-[13px]">
                        {subjectRole || "—"}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              <div className="w-full h-full flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentDoc.url!}
                  alt={currentDoc.label}
                  draggable={false}
                  className="select-none max-w-[92vw] max-h-[92vh] object-contain"
                  style={{
                    transform: `translate(${pan.x}px, ${pan.y}px) rotate(${rotation}deg) scale(${zoom})`,
                    transition: isDragging ? "none" : "transform 0.15s ease",
                    transformOrigin: "center center",
                  }}
                />
              </div>
            </div>

            {/* Inline Approve / Reject bar (hidden once this doc is approved) */}
            {!showRejectPanel && currentDoc.status !== "APPROVED" && (onApproveDoc || onRejectDoc) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="relative z-10 flex items-center justify-center gap-3 px-4 py-4 bg-white/5 backdrop-blur-sm"
              >
                {onRejectDoc && currentDoc.status !== "REJECTED" && (
                  <button
                    onClick={() => setShowRejectPanel(true)}
                    disabled={loading}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold text-brand-red bg-brand-red-muted border border-brand-red/20 hover:bg-red-100 transition-colors disabled:opacity-50"
                  >
                    <XCircle size={15} /> Reject <span className="text-white/30 font-normal">(R)</span>
                  </button>
                )}
                {onApproveDoc && (
                  <button
                    onClick={handleApproveCurrent}
                    disabled={loading}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white bg-brand-purple hover:bg-brand-purple-dark shadow-purple-glow transition-colors disabled:opacity-50"
                  >
                    <CheckCircle size={15} /> Approve <span className="text-white/50 font-normal">(A)</span>
                  </button>
                )}
                <span className="text-white/25 text-[11px] ml-2 hidden sm:inline">
                  ← → to navigate · Esc to close
                </span>
              </motion.div>
            )}

            {/* Inline Reject panel — quick-pick chips + editable reason, no separate modal */}
            {showRejectPanel && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="relative z-10 px-4 py-4 bg-white/5 backdrop-blur-sm"
              >
                <div className="max-w-xl mx-auto">
                  <p className="text-white/70 text-[12px] mb-2">
                    Why is this document being rejected? Tap a reason or type your own.
                  </p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {QUICK_REJECT_REASONS.map((reason) => (
                      <button
                        key={reason}
                        onClick={() => setRejectReason(reason)}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-[11px] font-medium border transition-colors",
                          rejectReason === reason
                            ? "bg-brand-red text-white border-brand-red"
                            : "bg-white/10 text-white/70 border-white/15 hover:bg-white/20"
                        )}
                      >
                        {reason}
                      </button>
                    ))}
                  </div>
                  <textarea
                    rows={2}
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Or type a custom reason..."
                    className="w-full rounded-xl bg-white/10 border border-white/15 text-white placeholder-white/30 text-[13px] px-3 py-2 resize-none focus:outline-none focus:border-brand-red/50"
                    autoFocus
                  />
                  <div className="flex justify-end gap-2 mt-3">
                    <button
                      onClick={() => { setShowRejectPanel(false); setRejectReason(""); }}
                      className="px-4 py-2 rounded-xl text-[13px] font-medium text-white/60 hover:bg-white/10 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleRejectConfirm}
                      disabled={!rejectReason.trim() || loading}
                      className="px-4 py-2 rounded-xl text-[13px] font-semibold text-white bg-brand-red hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      Confirm Reject
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </AnimatePresence>

      {/* Per-document Reject Reason Modal — grid-view Reject button (outside lightbox), unchanged */}
      <AnimatePresence>
        {cardRejectTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCardRejectTarget(null)}
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
                value={cardRejectReason}
                onChange={(e) => setCardRejectReason(e.target.value)}
                placeholder="e.g. Image is blurry, please upload a clearer photo..."
                className="input-base resize-none w-full mb-4"
                autoFocus
              />
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setCardRejectTarget(null)}
                  className="px-4 py-2 rounded-xl text-[13px] font-medium text-light-text-2 dark:text-dark-text-2 hover:bg-light-surface-2 dark:hover:bg-dark-surface transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCardRejectConfirm}
                  disabled={!cardRejectReason.trim() || loading}
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
  approving,
  rejecting,
}: {
  kycStatus: string;
  onApprove: () => void;
  onReject: () => void;
  loading?: boolean;
  // Optional, additive — when provided, only the matching button shows a
  // spinner. Falls back to `loading` so existing callers keep working.
  approving?: boolean;
  rejecting?: boolean;
}) {
  const showApproveSpinner = approving ?? loading ?? false;
  const showRejectSpinner  = rejecting ?? loading ?? false;
  const isBusy = !!(loading || approving || rejecting);
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
        disabled={isBusy}
        className={cn(
          "relative overflow-hidden flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-medium",
          "text-brand-red bg-brand-red-muted border border-brand-red/20",
          "hover:bg-red-100 dark:hover:bg-red-950 transition-colors disabled:opacity-60"
        )}
      >
        {showRejectSpinner ? <ThreeDotsLoader /> : <XCircle size={14} />}
        {showRejectSpinner ? "Rejecting KYC..." : "Reject KYC (all pending docs)"}
        {showRejectSpinner && (
          <>
            <span className="kyc-shimmer absolute inset-0 pointer-events-none" />
            <style jsx>{`
              @keyframes kycShimmer {
                0%   { transform: translateX(-120%); }
                100% { transform: translateX(120%); }
              }
              .kyc-shimmer {
                background: linear-gradient(90deg, transparent, rgba(239,68,68,0.18), transparent);
                animation: kycShimmer 1.4s ease-in-out infinite;
              }
            `}</style>
          </>
        )}
      </button>
      <button
        onClick={onApprove}
        disabled={isBusy}
        className={cn(
          "relative overflow-hidden flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-medium",
          "text-white bg-brand-purple hover:bg-brand-purple-dark",
          "shadow-purple-glow transition-colors disabled:opacity-60"
        )}
      >
        {showApproveSpinner ? <ThreeDotsLoader tone="#FFFFFF" /> : <CheckCircle size={14} />}
        {showApproveSpinner ? "Approving KYC..." : "Approve KYC"}
        {showApproveSpinner && (
          <>
            <span className="kyc-shimmer-approve absolute inset-0 pointer-events-none" />
            <style jsx>{`
              @keyframes kycShimmerApprove {
                0%   { transform: translateX(-120%); }
                100% { transform: translateX(120%); }
              }
              .kyc-shimmer-approve {
                background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent);
                animation: kycShimmerApprove 1.4s ease-in-out infinite;
              }
            `}</style>
          </>
        )}
      </button>
    </div>
  );
}
