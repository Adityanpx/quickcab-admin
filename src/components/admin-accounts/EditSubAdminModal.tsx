"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useUpdateAdminAccount } from "@/lib/hooks/useAdminAccounts";

const editSchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  email: z.string().trim().email("Enter a valid email"),
});

type EditFormData = z.infer<typeof editSchema>;

interface EditSubAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: { id: string; name: string; email: string } | null;
}

export function EditSubAdminModal({ isOpen, onClose, account }: EditSubAdminModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditFormData>({
    resolver: zodResolver(editSchema),
  });

  const updateMutation = useUpdateAdminAccount();

  useEffect(() => {
    if (isOpen && account) {
      reset({ name: account.name, email: account.email });
    }
  }, [isOpen, account, reset]);

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFormSubmit = async (data: EditFormData) => {
    if (!account) return;
    await updateMutation.mutateAsync({
      id: account.id,
      payload: { name: data.name, email: data.email.toLowerCase() },
    });
    handleClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Edit Subadmin — ${account?.name ?? ""}`}
      size="sm"
      footer={
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClose}
            disabled={updateMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit(handleFormSubmit)}
            loading={updateMutation.isPending}
          >
            Save Changes
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
            className={cn("input-base", errors.email && "border-brand-red")}
          />
          {errors.email && (
            <p className="text-xs text-brand-red mt-1">{errors.email.message}</p>
          )}
        </div>
      </div>
    </Modal>
  );
}
