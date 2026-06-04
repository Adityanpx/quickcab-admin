"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { Save, Megaphone, Users, Truck, AlertCircle, CheckCircle2 } from "lucide-react";
import { useAnnouncements, useUpsertAnnouncement } from "@/lib/hooks/useAnnouncements";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { DashboardSkeleton } from "@/components/ui/SkeletonLoader";
import { cn } from "@/lib/utils";
import { formatRelative } from "@/lib/utils";
import type { AnnouncementRole } from "@/lib/api/announcements";

// ─── Animation ────────────────────────────────────────────────────────────────

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as any },
  }),
};

// ─── Config ───────────────────────────────────────────────────────────────────

const ROLE_ORDER: AnnouncementRole[] = ["PARTNER", "SERVICE_PROVIDER", "BOTH"];

const ROLE_META: Record<
  AnnouncementRole,
  { label: string; description: string; icon: React.ReactNode; badge: string }
> = {
  PARTNER: {
    label: "Partners",
    description: "Visible to all Vehicle Owners and Vendors in the app",
    icon: <Users size={15} />,
    badge: "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300",
  },
  SERVICE_PROVIDER: {
    label: "Service Providers",
    description: "Visible to all Drivers, Mechanics, and other Service Providers",
    icon: <Truck size={15} />,
    badge: "bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300",
  },
  BOTH: {
    label: "Everyone",
    description: "Visible to both Partners and Service Providers",
    icon: <Megaphone size={15} />,
    badge: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
  },
};

// ─── Draft state per role ─────────────────────────────────────────────────────

interface DraftState {
  text: string;
  isActive: boolean;
  error: string | null;
}

type AllDrafts = Record<AnnouncementRole, DraftState>;

const DEFAULT_DRAFTS: AllDrafts = {
  PARTNER:          { text: "", isActive: false, error: null },
  SERVICE_PROVIDER: { text: "", isActive: false, error: null },
  BOTH:             { text: "", isActive: false, error: null },
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AnnouncementsPage() {
  const { data, isLoading, isError } = useAnnouncements();
  const upsertMutation = useUpsertAnnouncement();

  const [drafts, setDrafts] = useState<AllDrafts>(DEFAULT_DRAFTS);
  const [savingRole, setSavingRole] = useState<AnnouncementRole | null>(null);
  const [savedRole, setSavedRole] = useState<AnnouncementRole | null>(null); // for success flash

  // Pre-fill drafts once server data arrives
  useEffect(() => {
    if (!data) return;
    setDrafts((prev) => {
      const next = { ...prev };
      for (const ann of data) {
        next[ann.role] = {
          text: ann.text ?? "",
          isActive: ann.isActive,
          error: null,
        };
      }
      return next;
    });
  }, [data]);

  // ── Helpers ─────────────────────────────────────────────────────────────────

  const getServerState = (role: AnnouncementRole) =>
    data?.find((a) => a.role === role);

  const isDirty = (role: AnnouncementRole): boolean => {
    const server = getServerState(role);
    const draft = drafts[role];
    if (!server) return draft.text.trim() !== "" || draft.isActive !== false;
    return draft.text.trim() !== (server.text ?? "").trim() || draft.isActive !== server.isActive;
  };

  // ── Toggle handler — validate before allowing ON ─────────────────────────────

  const handleToggle = (role: AnnouncementRole) => {
    const draft = drafts[role];
    const turningOn = !draft.isActive;

    // If turning ON but text is empty — show inline error, do NOT flip toggle
    if (turningOn && draft.text.trim() === "") {
      setDrafts((prev) => ({
        ...prev,
        [role]: {
          ...prev[role],
          error: "Please type a message before turning this ON.",
        },
      }));
      return;
    }

    // Clear any error and flip toggle
    setDrafts((prev) => ({
      ...prev,
      [role]: {
        ...prev[role],
        isActive: turningOn,
        error: null,
      },
    }));
  };

  // ── Text change handler ──────────────────────────────────────────────────────

  const handleTextChange = (role: AnnouncementRole, value: string) => {
    setDrafts((prev) => ({
      ...prev,
      [role]: {
        ...prev[role],
        text: value,
        // Clear error as soon as user starts typing
        error: prev[role].error && value.trim() !== "" ? null : prev[role].error,
      },
    }));
  };

  // ── Save handler ─────────────────────────────────────────────────────────────

  const handleSave = async (role: AnnouncementRole) => {
    const draft = drafts[role];

    // Final validation before save
    if (draft.isActive && draft.text.trim() === "") {
      setDrafts((prev) => ({
        ...prev,
        [role]: {
          ...prev[role],
          error: "Cannot save an active announcement with no message.",
        },
      }));
      return;
    }

    setSavingRole(role);
    setSavedRole(null);

    try {
      await upsertMutation.mutateAsync({
        role,
        text: draft.text.trim(),
        isActive: draft.isActive,
      });
      setSavedRole(role);
      // Clear success flash after 2.5s
      setTimeout(() => setSavedRole((r) => (r === role ? null : r)), 2500);
    } finally {
      setSavingRole(null);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────

  if (isLoading) return <DashboardSkeleton />;

  if (isError) return (
    <div className="flex flex-col items-center justify-center py-24 gap-3">
      <AlertCircle size={22} className="text-brand-red" />
      <p className="text-[14px] font-medium text-light-text dark:text-dark-text">
        Failed to load announcements
      </p>
    </div>
  );

  return (
    <div className="space-y-6 max-w-[860px]">

      {/* Header */}
      <PageHeader
        title="Announcements"
        subtitle="Set a message per audience — Flutter app shows it when toggled ON. Save after every change."
      />

      {/* One card per role */}
      {ROLE_ORDER.map((role, i) => {
        const meta    = ROLE_META[role];
        const draft   = drafts[role];
        const server  = getServerState(role);
        const dirty   = isDirty(role);
        const saving  = savingRole === role;
        const saved   = savedRole === role;
        const hasError = !!draft.error;

        return (
          <motion.div
            key={role}
            custom={i}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
          >
            <div
              className={cn(
                "card p-5 transition-all duration-150",
                dirty && !hasError && "ring-1 ring-brand-purple/40",
                hasError && "ring-1 ring-brand-red/40",
              )}
            >
              {/* ── Card header ─────────────────────────────────────────── */}
              <div className="flex items-start justify-between gap-4 mb-4 pb-4 border-b border-light-border dark:border-dark-border">

                {/* Role label + description */}
                <div className="flex items-center gap-2.5">
                  <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12px] font-semibold", meta.badge)}>
                    {meta.icon}
                    {meta.label}
                  </span>
                  <p className="text-[12px] text-light-text-3 dark:text-dark-text-3 hidden sm:block">
                    {meta.description}
                  </p>
                </div>

                {/* Toggle + status label */}
                <div className="flex items-center gap-2.5 shrink-0">
                  <span className={cn(
                    "text-[11px] font-semibold transition-colors",
                    draft.isActive
                      ? "text-brand-green"
                      : "text-light-text-3 dark:text-dark-text-3"
                  )}>
                    {draft.isActive ? "ON" : "OFF"}
                  </span>
                  <button
                    type="button"
                    aria-label={`Toggle announcement for ${meta.label}`}
                    onClick={() => handleToggle(role)}
                    disabled={saving}
                    className={cn(
                      "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full",
                      "transition-colors duration-200",
                      "focus:outline-none focus:ring-2 focus:ring-brand-purple/30",
                      "disabled:opacity-50 disabled:cursor-not-allowed",
                      draft.isActive
                        ? "bg-brand-purple"
                        : "bg-light-border dark:bg-dark-border"
                    )}
                  >
                    <motion.span
                      layout
                      transition={{ type: "spring", stiffness: 500, damping: 35 }}
                      className={cn(
                        "inline-block h-4 w-4 rounded-full bg-white shadow-sm",
                        draft.isActive ? "translate-x-6" : "translate-x-1"
                      )}
                    />
                  </button>
                </div>
              </div>

              {/* ── Textarea ─────────────────────────────────────────────── */}
              <div className="space-y-1.5">
                <textarea
                  value={draft.text}
                  onChange={(e) => handleTextChange(role, e.target.value)}
                  disabled={saving}
                  placeholder={`Type announcement message for ${meta.label}…`}
                  rows={3}
                  maxLength={500}
                  className={cn(
                    "input-base w-full resize-none text-[14px] leading-relaxed py-3 px-4",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    hasError && "border-brand-red/60 focus:border-brand-red focus:shadow-none"
                  )}
                />

                {/* Character count + error row */}
                <div className="flex items-center justify-between min-h-[18px]">
                  {/* Inline error */}
                  {hasError ? (
                    <p className="flex items-center gap-1 text-[12px] text-brand-red font-medium">
                      <AlertCircle size={12} />
                      {draft.error}
                    </p>
                  ) : (
                    <span /> /* spacer */
                  )}

                  {/* Char count */}
                  <p className={cn(
                    "text-[11px] tabular-nums",
                    draft.text.length > 450
                      ? "text-brand-red"
                      : "text-light-text-3 dark:text-dark-text-3"
                  )}>
                    {draft.text.length} / 500
                  </p>
                </div>
              </div>

              {/* ── Footer: last saved + save button ─────────────────────── */}
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-light-border dark:border-dark-border">

                {/* Last saved info */}
                <div className="text-[11px] text-light-text-3 dark:text-dark-text-3">
                  {saved ? (
                    <span className="flex items-center gap-1 text-brand-green font-medium">
                      <CheckCircle2 size={12} />
                      Saved
                    </span>
                  ) : server?.updatedAt ? (
                    <span>Last saved {formatRelative(server.updatedAt)}</span>
                  ) : (
                    <span>Not saved yet</span>
                  )}
                </div>

                {/* Save button — always visible, disabled when not dirty */}
                <Button
                  variant="primary"
                  size="sm"
                  icon={<Save size={13} />}
                  loading={saving}
                  disabled={!dirty || saving}
                  onClick={() => handleSave(role)}
                >
                  Save
                </Button>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}