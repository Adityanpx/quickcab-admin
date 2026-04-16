"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Save, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { SystemConfig } from "@/lib/api/settings";

const CONFIG_METADATA: Record<
  string,
  { label: string; description: string; type: "number" | "text" | "boolean"; unit?: string }
> = {
  coins_per_lead: {
    label: "Coins Per Lead Confirmed",
    description: "Coins credited to Partner A when their posted booking is confirmed",
    type: "number",
    unit: "coins",
  },
  coin_value_inr: {
    label: "Coin Value (INR)",
    description: "How much 1 coin is worth in Indian Rupees",
    type: "number",
    unit: "₹",
  },
  min_withdrawal_coins: {
    label: "Minimum Withdrawal",
    description: "Minimum coin balance required to request a withdrawal",
    type: "number",
    unit: "coins",
  },
  booking_expiry_hours: {
    label: "Booking Auto-Expire",
    description: "Hours after which an OPEN booking auto-expires if no one accepts",
    type: "number",
    unit: "hours",
  },
  rating_window_hours: {
    label: "Rating Window",
    description: "Hours after trip completion during which both partners can submit ratings",
    type: "number",
    unit: "hours",
  },
  subscription_partner_enabled: {
    label: "Partner Subscription",
    description: "Toggle subscription enforcement for Partners",
    type: "boolean",
  },
  subscription_provider_enabled: {
    label: "Provider Subscription",
    description: "Toggle subscription enforcement for Service Providers",
    type: "boolean",
  },
};

interface SystemConfigFormProps {
  configs: SystemConfig[];
  onSave: (key: string, value: string) => Promise<void>;
}

interface EditState {
  [key: string]: string;
}

export function SystemConfigForm({ configs, onSave }: SystemConfigFormProps) {
  const [editValues, setEditValues] = useState<EditState>({});
  const [savingKey, setSavingKey] = useState<string>("");

  const getValue = (key: string): string => {
    if (key in editValues) return editValues[key];
    return configs.find((c) => c.key === key)?.value ?? "";
  };

  const isDirty = (key: string): boolean => {
    const original = configs.find((c) => c.key === key)?.value ?? "";
    return key in editValues && editValues[key] !== original;
  };

  const handleChange = (key: string, value: string) => {
    setEditValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (key: string) => {
    if (!isDirty(key)) return;
    setSavingKey(key);
    try {
      await onSave(key, editValues[key]);
      setEditValues((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    } finally {
      setSavingKey("");
    }
  };

  const handleReset = (key: string) => {
    setEditValues((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  // Group configs
  const grouped = {
    wallet: ["coins_per_lead", "coin_value_inr", "min_withdrawal_coins"],
    bookings: ["booking_expiry_hours", "rating_window_hours"],
    subscriptions: ["subscription_partner_enabled", "subscription_provider_enabled"],
  };

  const groupLabels: Record<string, string> = {
    wallet: "Wallet & Coins",
    bookings: "Booking Settings",
    subscriptions: "Subscription Control",
  };

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([group, keys]) => (
        <div key={group} className="card">
          <h3 className="font-semibold text-[15px] text-light-text dark:text-dark-text mb-4 pb-3 border-b border-light-border dark:border-dark-border">
            {groupLabels[group]}
          </h3>
          <div className="space-y-4">
            {keys.map((key) => {
              const config = configs.find((c) => c.key === key);
              const meta = CONFIG_METADATA[key];
              if (!meta) return null;

              const currentValue = getValue(key);
              const dirty = isDirty(key);

              return (
                <motion.div
                  key={key}
                  layout
                  className={cn(
                    "flex items-start gap-4 p-4 rounded-xl border transition-all duration-150",
                    dirty
                      ? "border-brand-purple/40 bg-brand-purple-muted/30 dark:bg-brand-purple-muted-dark/30"
                      : "border-light-border dark:border-dark-border"
                  )}
                >
                  {/* Label + description */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold text-light-text dark:text-dark-text">
                      {meta.label}
                    </p>
                    <p className="text-[12px] text-light-text-2 dark:text-dark-text-2 mt-0.5">
                      {meta.description}
                    </p>
                    {config && (
                      <p className="text-[11px] text-light-text-3 dark:text-dark-text-3 mt-1 font-mono">
                        key: {key}
                      </p>
                    )}
                  </div>

                  {/* Input */}
                  <div className="flex items-center gap-2 shrink-0">
                    {meta.type === "boolean" ? (
                      <button
                        onClick={() =>
                          handleChange(
                            key,
                            currentValue === "true" ? "false" : "true"
                          )
                        }
                        className={cn(
                          "relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-purple/30",
                          currentValue === "true"
                            ? "bg-brand-purple"
                            : "bg-light-border dark:bg-dark-border"
                        )}
                      >
                        <motion.span
                          layout
                          transition={{ type: "spring", stiffness: 500, damping: 35 }}
                          className={cn(
                            "inline-block h-4 w-4 rounded-full bg-white shadow-sm",
                            currentValue === "true"
                              ? "translate-x-6"
                              : "translate-x-1"
                          )}
                        />
                      </button>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        {meta.unit && (
                          <span className="text-[13px] text-light-text-3 dark:text-dark-text-3">
                            {meta.unit}
                          </span>
                        )}
                        <input
                          type={meta.type === "number" ? "number" : "text"}
                          value={currentValue}
                          onChange={(e) => handleChange(key, e.target.value)}
                          className="input-base w-28 text-center text-sm py-1.5"
                          min={meta.type === "number" ? 0 : undefined}
                        />
                      </div>
                    )}

                    {/* Save / Reset */}
                    {dirty && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleReset(key)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-light-text-3 dark:text-dark-text-3 hover:bg-light-surface-2 dark:hover:bg-dark-surface transition-colors"
                          title="Reset"
                        >
                          <RefreshCw size={13} />
                        </button>
                        <Button
                          variant="primary"
                          size="xs"
                          icon={<Save size={12} />}
                          loading={savingKey === key}
                          onClick={() => handleSave(key)}
                        >
                          Save
                        </Button>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
