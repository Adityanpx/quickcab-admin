"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ZoomIn, Download, FileX, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface DocItem {
  label: string;
  url: string | null;
}

interface KycDocViewerProps {
  docs: DocItem[];
}

function DocCard({
  doc,
  onView,
}: {
  doc: DocItem;
  onView: (url: string) => void;
}) {
  if (!doc.url) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 h-36 rounded-xl border-2 border-dashed border-light-border dark:border-dark-border bg-light-surface-2 dark:bg-dark-surface">
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
    <div className="group relative rounded-xl overflow-hidden border border-light-border dark:border-dark-border bg-light-surface-2 dark:bg-dark-surface">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={doc.url}
        alt={doc.label}
        className="w-full h-36 object-cover"
      />
      {/* Overlay on hover */}
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
        <button
          onClick={() => onView(doc.url!)}
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
      {/* Label */}
      <div className="px-2.5 py-2 border-t border-light-border dark:border-dark-border">
        <p className="text-[12px] font-medium text-light-text dark:text-dark-text truncate">
          {doc.label}
        </p>
      </div>
    </div>
  );
}

export function KycDocViewer({ docs }: KycDocViewerProps) {
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  return (
    <>
      {/* Doc Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {docs.map((doc) => (
          <DocCard key={doc.label} doc={doc} onView={setLightboxUrl} />
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
    </>
  );
}

// ─── KYC Approve / Reject action bar ─────────────────────
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
          KYC Rejected
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
        Reject KYC
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
