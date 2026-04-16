"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { Partner } from "@/types/partner";

const suspendSchema = z
  .object({
    reason: z.string().min(10, "Reason must be at least 10 characters"),
    isPermanent: z.boolean(),
    endDate: z.string().optional(),
  })
  .refine((data) => data.isPermanent || !!data.endDate, {
    message: "End date required for temporary suspension",
    path: ["endDate"],
  });

type SuspendFormData = z.infer<typeof suspendSchema>;

interface SuspendModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: SuspendFormData) => void;
  partner: Partner | null;
  loading?: boolean;
}

export function SuspendModal({
  isOpen,
  onClose,
  onConfirm,
  partner,
  loading,
}: SuspendModalProps) {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<SuspendFormData>({
    resolver: zodResolver(suspendSchema),
    defaultValues: { isPermanent: false },
  });

  const isPermanent = watch("isPermanent");

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Suspend ${partner?.name ?? "Partner"}`}
      size="md"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={handleSubmit(onConfirm)}
            loading={loading}
            className="!bg-brand-orange !text-white hover:!bg-orange-600"
          >
            Suspend Partner
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Warning banner */}
        <div className="flex items-start gap-3 px-3 py-3 rounded-xl bg-brand-orange-muted dark:bg-brand-orange-muted border border-brand-orange/20">
          <p className="text-[13px] text-brand-orange leading-relaxed">
            Suspended partners cannot access the app. They will see a suspension
            screen on login explaining the reason.
          </p>
        </div>

        {/* Reason */}
        <div>
          <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1.5">
            Suspension Reason <span className="text-brand-red">*</span>
          </label>
          <textarea
            {...register("reason")}
            rows={3}
            placeholder="Describe the reason for suspension..."
            className={cn(
              "input-base resize-none",
              errors.reason && "border-brand-red focus:border-brand-red"
            )}
          />
          {errors.reason && (
            <p className="text-xs text-brand-red mt-1">{errors.reason.message}</p>
          )}
        </div>

        {/* Permanent toggle */}
        <div className="flex items-center gap-3">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              {...register("isPermanent")}
              className="sr-only peer"
            />
            <div className="w-10 h-5 bg-light-border dark:bg-dark-border peer-focus:ring-2 peer-focus:ring-brand-purple/30 rounded-full peer peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-orange" />
          </label>
          <span className="text-sm font-medium text-light-text dark:text-dark-text">
            Suspend indefinitely
          </span>
        </div>

        {/* End date (only if not permanent) */}
        {!isPermanent && (
          <div>
            <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1.5">
              Suspension End Date <span className="text-brand-red">*</span>
            </label>
            <input
              type="date"
              {...register("endDate")}
              min={new Date().toISOString().split("T")[0]}
              className={cn(
                "input-base",
                errors.endDate && "border-brand-red focus:border-brand-red"
              )}
            />
            {errors.endDate && (
              <p className="text-xs text-brand-red mt-1">{errors.endDate.message}</p>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
