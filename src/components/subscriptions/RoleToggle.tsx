"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useToggleSubscription } from "@/lib/hooks/useSubscriptions";

interface RoleToggleProps {
  role: "PARTNER" | "PROVIDER";
  enabled: boolean;
  label: string;
  description: string;
}

export function RoleToggle({
  role,
  enabled,
  label,
  description,
}: RoleToggleProps) {
  const toggleMutation = useToggleSubscription();

  const handleToggle = () => {
    toggleMutation.mutate({ role, enabled: !enabled });
  };

  return (
    <div
      className={cn(
        "flex items-start justify-between gap-4 p-4 rounded-2xl border transition-all duration-200",
        enabled
          ? "border-brand-purple/30 bg-brand-purple-muted dark:bg-brand-purple-muted-dark"
          : "border-light-border dark:border-dark-border bg-light-surface-2 dark:bg-dark-surface"
      )}
    >
      <div className="min-w-0">
        <p className="font-semibold text-[14px] text-light-text dark:text-dark-text">
          {label}
        </p>
        <p className="text-[12px] text-light-text-2 dark:text-dark-text-2 mt-0.5">
          {description}
        </p>
        <span
          className={cn(
            "inline-block mt-2 text-[11px] font-semibold px-2 py-0.5 rounded-full",
            enabled
              ? "bg-brand-green text-white"
              : "bg-light-border dark:bg-dark-border text-light-text-3 dark:text-dark-text-3"
          )}
        >
          {enabled ? "ACTIVE" : "INACTIVE"}
        </span>
      </div>

      {/* Toggle Switch */}
      <button
        onClick={handleToggle}
        disabled={toggleMutation.isPending}
        className={cn(
          "relative inline-flex h-6 w-11 items-center rounded-full shrink-0",
          "transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-purple/30",
          enabled
            ? "bg-brand-purple"
            : "bg-light-border dark:bg-dark-border",
          toggleMutation.isPending && "opacity-50 cursor-not-allowed"
        )}
      >
        <motion.span
          layout
          transition={{ type: "spring", stiffness: 500, damping: 35 }}
          className={cn(
            "inline-block h-4 w-4 rounded-full bg-white shadow-sm",
            enabled ? "translate-x-6" : "translate-x-1"
          )}
        />
      </button>
    </div>
  );
}
