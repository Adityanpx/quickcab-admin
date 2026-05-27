"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  Eye,
  EyeOff,
  Save,
  Power,
  PowerOff,
  User,
  Lock,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import {
  useSubAdminCredentials,
  useChangeSubAdminPassword,
  useChangeSubAdminUsername,
  useToggleSubAdminAccess,
} from "@/lib/hooks/useDashboard";

export function SubAdminSettingsCard() {
  const { data: creds, isLoading } = useSubAdminCredentials();

  const changePasswordMutation = useChangeSubAdminPassword();
  const changeUsernameMutation = useChangeSubAdminUsername();
  const toggleAccessMutation = useToggleSubAdminAccess();

  // Username change state
  const [newUsername, setNewUsername] = useState("");
  const [usernameError, setUsernameError] = useState("");

  // Password change state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  // Toggle access confirmation
  const [showToggleConfirm, setShowToggleConfirm] = useState(false);

  const handleUsernameChange = async () => {
    const trimmed = newUsername.trim().toLowerCase();
    if (trimmed.length < 3) {
      setUsernameError("Username must be at least 3 characters");
      return;
    }
    setUsernameError("");
    await changeUsernameMutation.mutateAsync(trimmed);
    setNewUsername("");
  };

  const handlePasswordChange = async () => {
    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }
    setPasswordError("");
    await changePasswordMutation.mutateAsync(newPassword);
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleToggleAccess = async () => {
    if (!creds) return;
    await toggleAccessMutation.mutateAsync(!creds.isActive);
    setShowToggleConfirm(false);
  };

  if (isLoading) {
    return (
      <div className="card space-y-4 animate-pulse">
        <div className="h-5 w-40 bg-light-surface-2 dark:bg-dark-surface rounded-lg" />
        <div className="h-4 w-64 bg-light-surface-2 dark:bg-dark-surface rounded-lg" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.35 }}
      className="card space-y-6"
    >
      {/* Card header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-purple-muted dark:bg-brand-purple-muted-dark flex items-center justify-center">
            <Shield size={18} className="text-brand-purple" />
          </div>
          <div>
            <h3 className="text-[15px] font-semibold text-light-text dark:text-dark-text">
              SubAdmin Access
            </h3>
            <p className="text-[12px] text-light-text-2 dark:text-dark-text-2 mt-0.5">
              Manage the shared credentials for all subadmins
            </p>
          </div>
        </div>

        {/* Current status badge */}
        {creds && (
          <span className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold",
            creds.isActive
              ? "bg-green-50 text-green-700 dark:bg-brand-green-muted/20 dark:text-brand-green"
              : "bg-brand-red-muted text-brand-red"
          )}>
            <span className={cn(
              "w-1.5 h-1.5 rounded-full",
              creds.isActive ? "bg-green-500 dark:bg-brand-green" : "bg-brand-red"
            )} />
            {creds.isActive ? "Access Enabled" : "Access Disabled"}
          </span>
        )}
      </div>

      {/* Current credentials info */}
      {creds && (
        <div className="px-4 py-3 rounded-xl bg-light-surface-2 dark:bg-dark-surface border border-light-border dark:border-dark-border">
          <p className="text-[12px] text-light-text-3 dark:text-dark-text-3 mb-1">
            Current username
          </p>
          <p className="text-[15px] font-semibold font-mono text-light-text dark:text-dark-text">
            {creds.username}
          </p>
        </div>
      )}

      <div className="border-t border-light-border dark:border-dark-border" />

      {/* ── Toggle Access ─────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <Power size={14} className="text-light-text-2 dark:text-dark-text-2" />
          <h4 className="text-[13px] font-semibold text-light-text dark:text-dark-text">
            Enable / Disable All SubAdmin Access
          </h4>
        </div>
        <p className="text-[12px] text-light-text-2 dark:text-dark-text-2 leading-relaxed">
          Disabling access immediately locks out all subadmins — their next API request
          returns a 403 and they see a "Access Disabled" screen. Re-enabling restores access
          instantly without requiring them to log in again.
        </p>

        {!showToggleConfirm ? (
          <Button
            variant={creds?.isActive ? "danger" : "success"}
            size="sm"
            icon={creds?.isActive ? <PowerOff size={14} /> : <Power size={14} />}
            onClick={() => setShowToggleConfirm(true)}
            className={creds?.isActive
              ? "!bg-brand-red !text-white hover:!bg-red-700"
              : "!bg-green-600 !text-white hover:!bg-green-700"
            }
          >
            {creds?.isActive ? "Disable SubAdmin Access" : "Enable SubAdmin Access"}
          </Button>
        ) : (
          <div className="px-4 py-3 rounded-xl bg-brand-orange-muted border border-brand-orange/20 space-y-3">
            <div className="flex items-start gap-2">
              <AlertTriangle size={15} className="text-brand-orange mt-0.5 shrink-0" />
              <p className="text-[12px] text-light-text dark:text-dark-text leading-relaxed">
                {creds?.isActive
                  ? "This will immediately lock out all subadmins. Are you sure?"
                  : "This will restore access for all subadmins. Are you sure?"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={handleToggleAccess}
                loading={toggleAccessMutation.isPending}
                className={creds?.isActive
                  ? "!bg-brand-red !text-white hover:!bg-red-700"
                  : "!bg-green-600 !text-white hover:!bg-green-700"
                }
              >
                Yes, confirm
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowToggleConfirm(false)}
                disabled={toggleAccessMutation.isPending}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-light-border dark:border-dark-border" />

      {/* ── Change Username ───────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <User size={14} className="text-light-text-2 dark:text-dark-text-2" />
          <h4 className="text-[13px] font-semibold text-light-text dark:text-dark-text">
            Change Username
          </h4>
        </div>
        <p className="text-[12px] text-light-text-2 dark:text-dark-text-2">
          All subadmins must use this new username to log in after this change.
        </p>
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <input
              type="text"
              value={newUsername}
              onChange={(e) => { setNewUsername(e.target.value); setUsernameError(""); }}
              placeholder={`New username (current: ${creds?.username ?? "..."})`}
              className={cn("input-base", usernameError && "border-brand-red")}
              autoComplete="off"
            />
            {usernameError && (
              <p className="text-xs text-brand-red mt-1">{usernameError}</p>
            )}
          </div>
          <Button
            size="sm"
            icon={<Save size={14} />}
            onClick={handleUsernameChange}
            loading={changeUsernameMutation.isPending}
            disabled={!newUsername.trim() || newUsername.trim().length < 3}
            className="shrink-0"
          >
            Save
          </Button>
        </div>
      </div>

      <div className="border-t border-light-border dark:border-dark-border" />

      {/* ── Change Password ───────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <Lock size={14} className="text-light-text-2 dark:text-dark-text-2" />
          <h4 className="text-[13px] font-semibold text-light-text dark:text-dark-text">
            Change Password
          </h4>
        </div>
        <p className="text-[12px] text-light-text-2 dark:text-dark-text-2">
          All subadmins will need to log in again with the new password. Minimum 8 characters.
        </p>

        <div className="space-y-2.5">
          {/* New password */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => { setNewPassword(e.target.value); setPasswordError(""); }}
              placeholder="New password"
              className={cn("input-base pr-10", passwordError && "border-brand-red")}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-light-text-3 hover:text-light-text transition-colors p-0.5"
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>

          {/* Confirm password */}
          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); setPasswordError(""); }}
              placeholder="Confirm new password"
              className={cn("input-base pr-10", passwordError && "border-brand-red")}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-light-text-3 hover:text-light-text transition-colors p-0.5"
            >
              {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>

          {passwordError && (
            <p className="text-xs text-brand-red">{passwordError}</p>
          )}

          <Button
            size="sm"
            icon={<Save size={14} />}
            onClick={handlePasswordChange}
            loading={changePasswordMutation.isPending}
            disabled={!newPassword || !confirmPassword}
          >
            Update Password
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
