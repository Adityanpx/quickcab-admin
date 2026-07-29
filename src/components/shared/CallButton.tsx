"use client";

import { useState } from "react";
import { Phone } from "lucide-react";
import toast from "react-hot-toast";
import { adminAccountsApi, type LogCallPayload } from "@/lib/api/admin-accounts";

const OUTCOMES: { value: LogCallPayload["outcome"]; label: string }[] = [
  { value: "CONNECTED", label: "Connected" },
  { value: "NOT_REACHABLE", label: "Not Reachable" },
  { value: "CALL_BACK_LATER", label: "Call Back Later" },
  { value: "OTHER", label: "Other" },
];

export function CallButton({
  userId,
  phone,
  targetName,
  className,
}: {
  userId: string;
  phone: string; // digits only, e.g. "919876543210"
  targetName?: string | null;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [outcome, setOutcome] = useState<LogCallPayload["outcome"] | null>(null);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const handleCallTap = () => {
    window.location.href = `tel:+${phone}`;
    // Prompt for outcome once the user returns to this tab after the call.
    setTimeout(() => setOpen(true), 400);
  };

  const submit = async () => {
    if (!outcome) return;
    setSaving(true);
    try {
      await adminAccountsApi.logCall(userId, { targetName: targetName ?? undefined, outcome, note: note || undefined });
      toast.success("Call logged");
      setOpen(false);
      setOutcome(null);
      setNote("");
    } catch {
      toast.error("Failed to log call");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleCallTap}
        title="Call"
        className={
          className ??
          "w-8 h-8 rounded-lg bg-light-surface-2 dark:bg-dark-surface hover:bg-light-border dark:hover:bg-dark-border flex items-center justify-center text-light-text-2 dark:text-dark-text-2 transition-colors"
        }
      >
        <Phone size={15} />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="card w-full max-w-sm p-5">
            <h3 className="text-[15px] font-semibold mb-3">Log this call</h3>
            <div className="flex flex-col gap-2 mb-3">
              {OUTCOMES.map((o) => (
                <button
                  key={o.value}
                  onClick={() => setOutcome(o.value)}
                  className={`text-left px-3 py-2 rounded-lg border text-[13px] transition-colors ${
                    outcome === o.value
                      ? "border-brand-purple bg-brand-purple/10"
                      : "border-light-border dark:border-dark-border"
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Optional note"
              className="w-full text-[13px] rounded-lg border border-light-border dark:border-dark-border p-2 mb-3 bg-transparent"
              rows={2}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setOpen(false)}
                className="px-3 py-1.5 text-[13px] rounded-lg text-light-text-2 dark:text-dark-text-2"
              >
                Cancel
              </button>
              <button
                onClick={submit}
                disabled={!outcome || saving}
                className="px-3 py-1.5 text-[13px] rounded-lg bg-brand-purple text-white disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
