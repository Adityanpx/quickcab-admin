"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Wand2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useCreateAdminAccount } from "@/lib/hooks/useAdminAccounts";

const createSchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type CreateFormData = z.infer<typeof createSchema>;

function generatePassword(length = 12): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let out = "";
  for (let i = 0; i < length; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

interface CreateSubAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateSubAdminModal({ isOpen, onClose }: CreateSubAdminModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CreateFormData>({
    resolver: zodResolver(createSchema),
  });

  const createMutation = useCreateAdminAccount();

  useEffect(() => {
    if (!isOpen) reset();
  }, [isOpen, reset]);

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFormSubmit = async (data: CreateFormData) => {
    await createMutation.mutateAsync({
      name: data.name,
      email: data.email.toLowerCase(),
      password: data.password,
    });
    handleClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add Subadmin"
      size="sm"
      footer={
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClose}
            disabled={createMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit(handleFormSubmit)}
            loading={createMutation.isPending}
          >
            Create Subadmin
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1.5">
            Name <span className="text-brand-red">*</span>
          </label>
          <input
            {...register("name")}
            type="text"
            placeholder="e.g. Priya Sharma"
            className={cn("input-base", errors.name && "border-brand-red")}
          />
          {errors.name && (
            <p className="text-xs text-brand-red mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1.5">
            Email <span className="text-brand-red">*</span>
          </label>
          <input
            {...register("email")}
            type="email"
            placeholder="priya@example.com"
            className={cn("input-base", errors.email && "border-brand-red")}
          />
          {errors.email && (
            <p className="text-xs text-brand-red mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-medium text-light-text dark:text-dark-text">
              Password <span className="text-brand-red">*</span>
            </label>
            <button
              type="button"
              onClick={() => setValue("password", generatePassword(), { shouldValidate: true })}
              className="flex items-center gap-1 text-[12px] font-medium text-brand-purple hover:underline"
            >
              <Wand2 size={12} />
              Generate
            </button>
          </div>
          <input
            {...register("password")}
            type="text"
            placeholder="At least 8 characters"
            className={cn("input-base font-mono", errors.password && "border-brand-red")}
          />
          {errors.password && (
            <p className="text-xs text-brand-red mt-1">{errors.password.message}</p>
          )}
        </div>

        <div className="px-3 py-2.5 rounded-xl border bg-orange-50 dark:bg-brand-orange-muted border-brand-orange/20 text-orange-700 dark:text-brand-orange text-[12px] leading-relaxed">
          Share this password with them directly — it won&apos;t be emailed automatically.
        </div>
      </div>
    </Modal>
  );
}
