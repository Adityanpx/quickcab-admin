"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Upload, Loader2, X } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { adsApi } from "@/lib/api/ads";
import type { Ad, CreateAdPayload } from "@/lib/api/ads";

const adSchema = z.object({
  name: z.string().min(2, "Internal name is required"),
  title: z.string().optional(),
  description: z.string().optional(),
  redirectUrl: z.string().url("Must be a valid URL starting with http:// or https://"),
});

type AdFormData = z.infer<typeof adSchema>;

interface AdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateAdPayload) => Promise<void>;
  editAd?: Ad | null;
  loading?: boolean;
}

export function AdModal({ isOpen, onClose, onSubmit, editAd, loading }: AdModalProps) {
  const isEdit = !!editAd;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [imageUrl, setImageUrl] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AdFormData>({
    resolver: zodResolver(adSchema),
  });

  useEffect(() => {
    if (editAd) {
      reset({
        name: editAd.name,
        title: editAd.title ?? "",
        description: editAd.description ?? "",
        redirectUrl: editAd.redirectUrl,
      });
      setImageUrl(editAd.imageUrl);
    } else {
      reset({ name: "", title: "", description: "", redirectUrl: "" });
      setImageUrl("");
    }
    setUploadError(null);
    setImageError(null);
  }, [editAd, reset]);

  const handleClose = () => {
    reset();
    setImageUrl("");
    setUploadError(null);
    setImageError(null);
    onClose();
  };

  const handleImageUpload = async (file: File) => {
    setIsUploading(true);
    setUploadError(null);
    setImageError(null);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const { uploadUrl, publicUrl } = await adsApi.getPresignedUploadUrl(ext);
      const putRes = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });
      if (!putRes.ok) throw new Error("Upload failed");
      setImageUrl(publicUrl);
    } catch {
      setUploadError("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageUpload(file);
    // reset input so same file can be re-selected after removal
    e.target.value = "";
  };

  const handleFormSubmit = async (data: AdFormData) => {
    if (!imageUrl) {
      setImageError("Please upload an image");
      return;
    }
    const payload: CreateAdPayload = {
      name: data.name,
      title: data.title || undefined,
      description: data.description || undefined,
      imageUrl,
      redirectUrl: data.redirectUrl,
    };
    await onSubmit(payload);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEdit ? `Edit Ad — ${editAd?.name}` : "Create New Ad"}
      size="lg"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit(handleFormSubmit)}
            loading={loading}
          >
            {isEdit ? "Save Changes" : "Create Ad"}
          </Button>
        </>
      }
    >
      <div className="max-h-[65vh] overflow-y-auto pr-1 space-y-4">
        {/* Internal Name */}
        <div>
          <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1.5">
            Internal Name <span className="text-brand-red">*</span>
          </label>
          <input
            {...register("name")}
            type="text"
            placeholder="e.g. Summer Promo Banner"
            className={cn("input-base", errors.name && "border-brand-red")}
          />
          {errors.name ? (
            <p className="text-xs text-brand-red mt-1">{errors.name.message}</p>
          ) : (
            <p className="text-[11px] text-light-text-3 dark:text-dark-text-3 mt-1">
              Used only in admin panel — not shown to users
            </p>
          )}
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1.5">
            Ad Image <span className="text-brand-red">*</span>
          </label>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />

          {!imageUrl && !isUploading && (
            <div
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors duration-150",
                "border-light-border dark:border-dark-border hover:border-brand-purple/50",
                imageError && "border-brand-red"
              )}
            >
              <Upload size={22} className="text-light-text-3 dark:text-dark-text-3" />
              <p className="text-[13px] font-medium text-light-text-2 dark:text-dark-text-2">
                Click to upload image
              </p>
              <p className="text-[11px] text-light-text-3 dark:text-dark-text-3">
                JPG, PNG, WebP, GIF supported
              </p>
            </div>
          )}

          {isUploading && (
            <div className="border-2 border-dashed border-brand-purple/50 rounded-xl p-8 flex flex-col items-center justify-center gap-2">
              <Loader2 size={22} className="text-brand-purple animate-spin" />
              <p className="text-[13px] font-medium text-light-text-2 dark:text-dark-text-2">
                Uploading...
              </p>
            </div>
          )}

          {imageUrl && !isUploading && (
            <div className="relative rounded-xl overflow-hidden" style={{ aspectRatio: "16/9" }}>
              <img
                src={imageUrl}
                alt="Ad preview"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => setImageUrl("")}
                className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-black/60 flex items-center justify-center text-white hover:bg-black/80 transition-colors"
              >
                <X size={13} />
              </button>
            </div>
          )}

          {uploadError && (
            <p className="text-xs text-brand-red mt-1">{uploadError}</p>
          )}
          {imageError && !uploadError && (
            <p className="text-xs text-brand-red mt-1">{imageError}</p>
          )}
        </div>

        {/* Title (optional) */}
        <div>
          <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1.5">
            Title{" "}
            <span className="text-light-text-3 dark:text-dark-text-3 font-normal">
              (optional)
            </span>
          </label>
          <input
            {...register("title")}
            type="text"
            placeholder="e.g. Summer Sale — 30% Off!"
            className="input-base"
          />
        </div>

        {/* Description (optional) */}
        <div>
          <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1.5">
            Description{" "}
            <span className="text-light-text-3 dark:text-dark-text-3 font-normal">
              (optional)
            </span>
          </label>
          <textarea
            {...register("description")}
            rows={2}
            placeholder="Short description shown below the ad title in the app..."
            className="input-base resize-none"
          />
        </div>

        {/* Redirect URL */}
        <div>
          <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1.5">
            Redirect URL <span className="text-brand-red">*</span>
          </label>
          <input
            {...register("redirectUrl")}
            type="url"
            placeholder="https://example.com/promo"
            className={cn("input-base", errors.redirectUrl && "border-brand-red")}
          />
          {errors.redirectUrl && (
            <p className="text-xs text-brand-red mt-1">
              {errors.redirectUrl.message}
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
}
