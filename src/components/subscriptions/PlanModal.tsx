"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, X } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { FilterSelect } from "@/components/ui/FilterSelect";
import { cn } from "@/lib/utils";
import type { SubscriptionPlan } from "@/lib/api/subscriptions";

const planSchema = z.object({
  name: z.string().min(2, "Name is required"),
  description: z.string().min(5, "Description is required"),
  price: z.number().min(1, "Price must be at least ₹1").max(100000),
  durationDays: z.number().min(1).max(3650),
  userType: z.enum(["PARTNER", "SERVICE_PROVIDER", "BOTH"]),
});

type PlanFormData = z.infer<typeof planSchema>;

const DURATION_PRESETS = [
  { label: "7 days", value: 7 },
  { label: "30 days", value: 30 },
  { label: "90 days", value: 90 },
  { label: "180 days", value: 180 },
  { label: "365 days", value: 365 },
];

const USER_TYPE_OPTIONS = [
  { value: "PARTNER", label: "Partners Only" },
  { value: "SERVICE_PROVIDER", label: "Service Providers Only" },
  { value: "BOTH", label: "All Users" },
];

interface PlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PlanFormData & { benefits: string[] }) => void;
  editPlan?: SubscriptionPlan | null;
  loading?: boolean;
}

export function PlanModal({
  isOpen,
  onClose,
  onSubmit,
  editPlan,
  loading,
}: PlanModalProps) {
  const [benefits, setBenefits] = useState<string[]>([""]);
  const isEdit = !!editPlan;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PlanFormData>({
    resolver: zodResolver(planSchema),
    defaultValues: {
      userType: "PARTNER",
      durationDays: 30,
    },
  });

  const selectedDuration = watch("durationDays");

  // Populate form when editing
  useEffect(() => {
    if (editPlan) {
      reset({
        name: editPlan.name,
        description: editPlan.description,
        price: editPlan.price,
        durationDays: editPlan.durationDays,
        userType: editPlan.userType,
      });
      setBenefits(editPlan.benefits.length > 0 ? editPlan.benefits : [""]);
    } else {
      reset({ userType: "PARTNER", durationDays: 30 });
      setBenefits([""]);
    }
  }, [editPlan, reset]);

  const handleClose = () => {
    reset();
    setBenefits([""]);
    onClose();
  };

  const handleFormSubmit = (data: PlanFormData) => {
    const cleanBenefits = benefits.filter((b) => b.trim().length > 0);
    onSubmit({ ...data, benefits: cleanBenefits });
  };

  const addBenefit = () => setBenefits((prev) => [...prev, ""]);
  const removeBenefit = (i: number) =>
    setBenefits((prev) => prev.filter((_, idx) => idx !== i));
  const updateBenefit = (i: number, value: string) =>
    setBenefits((prev) => prev.map((b, idx) => (idx === i ? value : b)));

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEdit ? `Edit Plan — ${editPlan?.name}` : "Create New Plan"}
      size="md"
      footer={
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit(handleFormSubmit)}
            loading={loading}
          >
            {isEdit ? "Save Changes" : "Create Plan"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1.5">
            Plan Name <span className="text-brand-red">*</span>
          </label>
          <input
            {...register("name")}
            type="text"
            placeholder="e.g. Partner Monthly Basic"
            className={cn("input-base", errors.name && "border-brand-red")}
          />
          {errors.name && (
            <p className="text-xs text-brand-red mt-1">{errors.name.message}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1.5">
            Description
          </label>
          <textarea
            {...register("description")}
            rows={2}
            placeholder="Brief description shown to users..."
            className={cn(
              "input-base resize-none",
              errors.description && "border-brand-red"
            )}
          />
        </div>

        {/* Price + User Type */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1.5">
              Price (₹) <span className="text-brand-red">*</span>
            </label>
            <input
              {...register("price", { valueAsNumber: true })}
              type="number"
              min={1}
              placeholder="499"
              className={cn("input-base", errors.price && "border-brand-red")}
            />
            {errors.price && (
              <p className="text-xs text-brand-red mt-1">
                {errors.price.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1.5">
              Applies To
            </label>
            <FilterSelect
              value={watch("userType")}
              onChange={(v) =>
                setValue("userType", v as "PARTNER" | "SERVICE_PROVIDER" | "BOTH")
              }
              options={USER_TYPE_OPTIONS}
              placeholder="Select"
              className="w-full"
            />
          </div>
        </div>

        {/* Duration presets */}
        <div>
          <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
            Duration <span className="text-brand-red">*</span>
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {DURATION_PRESETS.map((preset) => (
              <button
                key={preset.value}
                type="button"
                onClick={() => setValue("durationDays", preset.value)}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-[12px] font-medium border transition-all duration-150",
                  selectedDuration === preset.value
                    ? "bg-brand-purple text-white border-brand-purple"
                    : "border-light-border dark:border-dark-border text-light-text-2 dark:text-dark-text-2 hover:border-brand-purple hover:text-brand-purple"
                )}
              >
                {preset.label}
              </button>
            ))}
          </div>
          <input
            {...register("durationDays", { valueAsNumber: true })}
            type="number"
            min={1}
            placeholder="Custom days"
            className={cn(
              "input-base text-sm",
              errors.durationDays && "border-brand-red"
            )}
          />
        </div>

        {/* Benefits builder */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-light-text dark:text-dark-text">
              Benefits
            </label>
            <button
              type="button"
              onClick={addBenefit}
              className="flex items-center gap-1 text-[12px] font-medium text-brand-purple hover:underline"
            >
              <Plus size={12} />
              Add benefit
            </button>
          </div>
          <div className="space-y-2">
            {benefits.map((benefit, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="text"
                  value={benefit}
                  onChange={(e) => updateBenefit(i, e.target.value)}
                  placeholder={`Benefit ${i + 1}...`}
                  className="input-base text-sm flex-1"
                />
                {benefits.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeBenefit(i)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-light-text-3 dark:text-dark-text-3 hover:text-brand-red hover:bg-brand-red-muted transition-colors shrink-0"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}
