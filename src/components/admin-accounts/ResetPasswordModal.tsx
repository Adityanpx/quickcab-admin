"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Wand2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useResetAdminPassword } from "@/lib/hooks/useAdminAccounts";

const resetSchema = z
  .object({
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetFormData = z.infer<typeof resetSchema>;

function generatePassword(length = 12): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let out = "";
  for (let i = 0; i < length; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: { id: string; name: string } | null;
}

export function ResetPasswordModal({ isOpen, onClose, account }: ResetPasswordModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
  });

  const resetMutation = useResetAdminPassword();

  useEffect(() => {
    if (!isOpen) reset();
  }, [isOpen, reset]);

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFormSubmit = async (data: ResetFormData) => {
    if (!account) return;
    await resetMutation.mutateAsync({ id: account.id, newPassword: data.newPassword });
    handleClose();
  };

  const handleGenerate = () => {
    const pwd = generatePassword();
    setValue("newPassword", pwd, { shouldValidate: true });
    setValue("confirmPassword", pwd, { shouldValidate: true });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Reset Password — ${account?.name ?? ""}`}
      size="sm"
      footer={
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClose}
            disabled={resetMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit(handleFormSubmit)}
            loading={resetMutation.isPending}
          >
            Reset Password
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-medium text-light-text dark:text-dark-text">
              New Password <span className="text-brand-red">*</span>
            </label>
            <button
              type="button"
              onClick={handleGenerate}
              className="flex items-center gap-1 text-[12px] font-medium text-brand-purple hover:underline"
            >
              <Wand2 size={12} />
              Generate
            </button>
          </div>
          <input
            {...register("newPassword")}
            type="text"
            placeholder="At least 8 characters"
            className={cn("input-base font-mono", errors.newPassword && "border-brand-red")}
          />
          {errors.newPassword && (
            <p className="text-xs text-brand-red mt-1">{errors.newPassword.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1.5">
            Confirm Password <span className="text-brand-red">*</span>
          </label>
          <input
            {...register("confirmPassword")}
            type="text"
            placeholder="Re-enter the password"
            className={cn("input-base font-mono", errors.confirmPassword && "border-brand-red")}
          />
          {errors.confirmPassword && (
            <p className="text-xs text-brand-red mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>

        <div className="px-3 py-2.5 rounded-xl border bg-orange-50 dark:bg-brand-orange-muted border-brand-orange/20 text-orange-700 dark:text-brand-orange text-[12px] leading-relaxed">
          {account?.name ?? "They"} will be logged out of any active session and must log in
          again with the new password.
        </div>
      </div>
    </Modal>
  );
}
