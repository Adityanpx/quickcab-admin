"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Upload, Loader2, X } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { adsApi, AD_PLACEMENTS, AD_PLACEMENT_LABELS } from "@/lib/api/ads";
import type { Ad, CreateAdPayload } from "@/lib/api/ads";

const WA_LABEL_PICKS = ["Chat on WhatsApp", "Contact us", "Book a demo"];

// Same rule as the server: 10-digit Indian mobile (6–9 start), optional 91/+91 prefix.
function isValidWhatsapp(value: string): boolean {
  const d = value.replace(/\D/g, "");
  const local = d.length === 10 ? d : d.length === 12 && d.startsWith("91") ? d.slice(2) : "";
  return /^[6-9]\d{9}$/.test(local);
}

const adSchema = z
  .object({
    name: z.string().min(2, "Internal name is required"),
    title: z.string().optional(),
    description: z.string().optional(),
    redirectUrl: z
      .string()
      .trim()
      .refine((v) => v === "" || /^https?:\/\/\S+$/.test(v), "Must start with http:// or https://"),
    placement: z.enum(["ALL", "FEED", "NEARBY", "WALLET"]),
    whatsappEnabled: z.boolean(),
    whatsappNumber: z.string().trim(),
    whatsappLabel: z.string().trim().max(20, "Max 20 characters"),
    whatsappMessage: z.string().trim().max(300, "Max 300 characters"),
  })
  .superRefine((d, ctx) => {
    if (d.whatsappEnabled && !isValidWhatsapp(d.whatsappNumber)) {
      ctx.addIssue({
        code: "custom",
        path: ["whatsappNumber"],
        message: "Enter a valid 10-digit Indian mobile number",
      });
    }
    if (!d.redirectUrl && !d.whatsappEnabled) {
      ctx.addIssue({
        code: "custom",
        path: ["redirectUrl"],
        message: "Add a Redirect URL or turn on the WhatsApp button",
      });
    }
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
    watch,
    setValue,
    formState: { errors },
  } = useForm<AdFormData>({
    resolver: zodResolver(adSchema),
  });
  const whatsappEnabled = watch("whatsappEnabled");

  useEffect(() => {
    if (editAd) {
      reset({
        name: editAd.name,
        title: editAd.title ?? "",
        description: editAd.description ?? "",
        redirectUrl: editAd.redirectUrl ?? "",
        placement: editAd.placement ?? "ALL",
        whatsappEnabled: !!editAd.whatsappNumber,
        // Stored as 91XXXXXXXXXX — show the 10-digit part
        whatsappNumber: editAd.whatsappNumber ? editAd.whatsappNumber.replace(/^91/, "") : "",
        whatsappLabel: editAd.whatsappLabel ?? "",
        whatsappMessage: editAd.whatsappMessage ?? "",
      });
      setImageUrl(editAd.imageUrl);
    } else {
      reset({
        name: "",
        title: "",
        description: "",
        redirectUrl: "",
        placement: "ALL",
        whatsappEnabled: false,
        whatsappNumber: "",
        whatsappLabel: "",
        whatsappMessage: "",
      });
      setImageUrl("");
    }
    setUploadError(null);
    setImageError(null);
  }, [isOpen, editAd, reset]);

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
      redirectUrl: data.redirectUrl || null,
      placement: data.placement,
      // WhatsApp off → send nulls so the server clears all three fields
      whatsappNumber: data.whatsappEnabled ? data.whatsappNumber : null,
      whatsappLabel: data.whatsappEnabled ? data.whatsappLabel || null : null,
      whatsappMessage: data.whatsappEnabled ? data.whatsappMessage || null : null,
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

        {/* Placement */}
        <div>
          <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1.5">
            Show on <span className="text-brand-red">*</span>
          </label>
          <select {...register("placement")} className="input-base">
            {AD_PLACEMENTS.map((p) => (
              <option key={p} value={p}>
                {AD_PLACEMENT_LABELS[p]}
              </option>
            ))}
          </select>
          <p className="text-[11px] text-light-text-3 dark:text-dark-text-3 mt-1">
            &quot;All screens&quot; shows this ad everywhere ads appear in the app.
            Home feed shows up to 3 ads at a time; extra ads rotate on each app open.
          </p>
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
                JPG, PNG, WebP supported · Recommended 1200 × 675 (16:9), under 300 KB
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
            Redirect URL{" "}
            <span className="text-light-text-3 dark:text-dark-text-3 font-normal">
              (optional if WhatsApp button is on)
            </span>
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

        {/* WhatsApp button (optional) */}
        <div className="rounded-xl border border-light-border dark:border-dark-border p-3 space-y-3">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              {...register("whatsappEnabled")}
              className="h-4 w-4 accent-green-600"
            />
            <span className="text-sm font-medium text-light-text dark:text-dark-text">
              Add WhatsApp button
            </span>
            <span className="text-sm text-light-text-3 dark:text-dark-text-3">(optional)</span>
          </label>

          {whatsappEnabled && (
            <>
              <div>
                <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1.5">
                  WhatsApp number <span className="text-brand-red">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-light-text-2 dark:text-dark-text-2">+91</span>
                  <input
                    {...register("whatsappNumber")}
                    type="tel"
                    inputMode="numeric"
                    placeholder="9607024225"
                    className={cn("input-base", errors.whatsappNumber && "border-brand-red")}
                  />
                </div>
                {errors.whatsappNumber && (
                  <p className="text-xs text-brand-red mt-1">{errors.whatsappNumber.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1.5">
                  Button label{" "}
                  <span className="text-light-text-3 dark:text-dark-text-3 font-normal">
                    (optional, max 20)
                  </span>
                </label>
                <input
                  {...register("whatsappLabel")}
                  type="text"
                  maxLength={20}
                  placeholder="Chat on WhatsApp"
                  className={cn("input-base", errors.whatsappLabel && "border-brand-red")}
                />
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {WA_LABEL_PICKS.map((pick) => (
                    <button
                      key={pick}
                      type="button"
                      onClick={() => setValue("whatsappLabel", pick, { shouldValidate: true })}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-medium border border-light-border dark:border-dark-border text-light-text-2 dark:text-dark-text-2 hover:border-green-600 hover:text-green-700 transition-colors"
                    >
                      {pick}
                    </button>
                  ))}
                </div>
                {errors.whatsappLabel ? (
                  <p className="text-xs text-brand-red mt-1">{errors.whatsappLabel.message}</p>
                ) : (
                  <p className="text-[11px] text-light-text-3 dark:text-dark-text-3 mt-1">
                    Empty = &quot;Chat on WhatsApp&quot; (shown in the user&apos;s app language)
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1.5">
                  Pre-filled message{" "}
                  <span className="text-light-text-3 dark:text-dark-text-3 font-normal">
                    (optional, max 300)
                  </span>
                </label>
                <textarea
                  {...register("whatsappMessage")}
                  rows={2}
                  maxLength={300}
                  placeholder="Hi, I saw your ad on QuickCab."
                  className={cn("input-base resize-none", errors.whatsappMessage && "border-brand-red")}
                />
                {errors.whatsappMessage ? (
                  <p className="text-xs text-brand-red mt-1">{errors.whatsappMessage.message}</p>
                ) : (
                  <p className="text-[11px] text-light-text-3 dark:text-dark-text-3 mt-1">
                    Empty = &quot;Hi, I saw your ad on QuickCab.&quot;
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}
