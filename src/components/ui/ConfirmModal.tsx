"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "./Button";
import { cn } from "@/lib/utils";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning";
  loading?: boolean;
}

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.94, y: 12 },
  visible: {
    opacity: 1, scale: 1, y: 0,
    transition: { duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
  exit: {
    opacity: 0, scale: 0.94, y: 12,
    transition: { duration: 0.16 },
  },
};

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  loading = false,
}: ConfirmModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={cn(
              "relative w-full max-w-sm z-10",
              "bg-white dark:bg-dark-surface rounded-2xl",
              "border border-light-border dark:border-dark-border",
              "shadow-xl dark:shadow-black/40 p-6"
            )}
          >
            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-7 h-7 rounded-lg flex items-center justify-center text-light-text-3 dark:text-dark-text-3 hover:bg-light-surface-2 dark:hover:bg-dark-surface-2 transition-colors"
            >
              <X size={14} />
            </button>

            {/* Icon */}
            <div
              className={cn(
                "w-11 h-11 rounded-2xl flex items-center justify-center mb-4",
                variant === "danger"
                  ? "bg-brand-red-muted text-brand-red"
                  : "bg-brand-orange-muted text-brand-orange"
              )}
            >
              <AlertTriangle size={20} />
            </div>

            {/* Content */}
            <h3 className="font-semibold text-[15px] text-light-text dark:text-dark-text mb-2">
              {title}
            </h3>
            <p className="text-sm text-light-text-2 dark:text-dark-text-2 leading-relaxed mb-6">
              {description}
            </p>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                className="flex-1"
                disabled={loading}
              >
                {cancelLabel}
              </Button>
              <Button
                variant={variant === "danger" ? "danger" : "secondary"}
                size="sm"
                onClick={onConfirm}
                loading={loading}
                className={cn(
                  "flex-1",
                  variant === "danger"
                    ? "!bg-brand-red !text-white hover:!bg-red-600"
                    : "!bg-brand-orange !text-white hover:!bg-orange-600"
                )}
              >
                {confirmLabel}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
