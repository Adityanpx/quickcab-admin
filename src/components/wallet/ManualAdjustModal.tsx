"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useManualAdjust } from "@/lib/hooks/useWallet";

const adjustSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  amount: z.number().min(1, "Amount must be at least 1").max(100000, "Max 100,000 coins"),
  type: z.enum(["CREDIT", "DEBIT"]),
  reason: z.string().min(5, "Reason must be at least 5 characters"),
});

type AdjustFormData = z.infer<typeof adjustSchema>;

interface ManualAdjustModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefillUserId?: string;
  prefillUserName?: string;
}

export function ManualAdjustModal({
  isOpen,
  onClose,
  prefillUserId,
  prefillUserName,
}: ManualAdjustModalProps) {
  const adjustMutation = useManualAdjust();
  const [adjustType, setAdjustType] = useState<"CREDIT" | "DEBIT">("CREDIT");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<AdjustFormData>({
    resolver: zodResolver(adjustSchema),
    defaultValues: {
      userId: prefillUserId ?? "",
      type: "CREDIT",
      amount: undefined,
      reason: "",
    },
  });

  const onSubmit = async (data: AdjustFormData) => {
    await adjustMutation.mutateAsync(data);
    reset();
    onClose();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Manual Wallet Adjustment"
      size="md"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={handleClose} disabled={adjustMutation.isPending}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit(onSubmit)}
            loading={adjustMutation.isPending}
          >
            Apply Adjustment
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Warning */}
        <div className="px-3 py-2.5 rounded-xl bg-brand-orange-muted border border-brand-orange/20">
          <p className="text-[12px] text-brand-orange">
            Manual wallet adjustments are logged with your admin account and cannot be undone.
          </p>
        </div>

        {/* User ID */}
        <div>
          <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1.5">
            Partner / User
            {prefillUserName && (
              <span className="ml-2 font-normal text-brand-purple">
                ({prefillUserName})
              </span>
            )}
          </label>
          <input
            {...register("userId")}
            type="text"
            placeholder="User ID"
            readOnly={!!prefillUserId}
            className={cn(
              "input-base",
              prefillUserId && "bg-light-surface-2 dark:bg-dark-surface cursor-not-allowed",
              errors.userId && "border-brand-red"
            )}
          />
          {errors.userId && (
            <p className="text-xs text-brand-red mt-1">{errors.userId.message}</p>
          )}
        </div>

        {/* Credit / Debit toggle */}
        <div>
          <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
            Adjustment Type
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { setAdjustType("CREDIT"); setValue("type", "CREDIT"); }}
              className={cn(
                "flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all duration-150",
                adjustType === "CREDIT"
                  ? "bg-brand-green text-white border-brand-green shadow-[0_0_12px_rgba(2,230,66,0.2)]"
                  : "border-light-border dark:border-dark-border text-light-text-2 dark:text-dark-text-2 hover:border-brand-green hover:text-brand-green"
              )}
            >
              + Credit Coins
            </button>
            <button
              type="button"
              onClick={() => { setAdjustType("DEBIT"); setValue("type", "DEBIT"); }}
              className={cn(
                "flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all duration-150",
                adjustType === "DEBIT"
                  ? "bg-brand-red text-white border-brand-red"
                  : "border-light-border dark:border-dark-border text-light-text-2 dark:text-dark-text-2 hover:border-brand-red hover:text-brand-red"
              )}
            >
              − Debit Coins
            </button>
          </div>
          <input type="hidden" {...register("type")} value={adjustType} />
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1.5">
            Coins <span className="text-[12px] text-light-text-3 dark:text-dark-text-3">(1 coin = ₹1)</span>
          </label>
          <input
            {...register("amount", { valueAsNumber: true })}
            type="number"
            min={1}
            max={100000}
            placeholder="e.g. 50"
            className={cn("input-base", errors.amount && "border-brand-red")}
          />
          {errors.amount && (
            <p className="text-xs text-brand-red mt-1">{errors.amount.message}</p>
          )}
        </div>

        {/* Reason */}
        <div>
          <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1.5">
            Reason / Note <span className="text-brand-red">*</span>
          </label>
          <textarea
            {...register("reason")}
            rows={3}
            placeholder="e.g. Compensation for booking dispute #12345..."
            className={cn("input-base resize-none", errors.reason && "border-brand-red")}
          />
          {errors.reason && (
            <p className="text-xs text-brand-red mt-1">{errors.reason.message}</p>
          )}
        </div>
      </div>
    </Modal>
  );
}
