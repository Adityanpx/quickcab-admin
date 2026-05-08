"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Briefcase,
  Wrench,
  MapPin,
  User,
  UserCheck,
  X,
  Search,
  Send,
  Bell,
  MessageSquare,
  Image,
  Loader2,
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/Button";
import {
  notificationsApi,
  type BroadcastPayload,
  type BroadcastHistoryItem,
  type UserSearchResult,
  type AudienceType,
  type Channel,
} from "@/lib/api/notifications";
import { cn, formatRelative } from "@/lib/utils";
import { useDebounce } from "@/lib/hooks/useDebounce";
import toast from "react-hot-toast";

const broadcastSchema = z
  .object({
    title: z.string().min(3, "Title must be at least 3 characters").max(80),
    message: z.string().min(10, "Message must be at least 10 characters").max(500),
    audience: z.enum([
      "ALL",
      "PARTNERS_ONLY",
      "PROVIDERS_ONLY",
      "CITY",
      "INDIVIDUAL",
      "SPECIFIC_USERS",
    ]),
    city: z.string().optional(),
    roleFilter: z.enum(["ALL", "PARTNERS", "PROVIDERS"]).optional(),
    userId: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.audience === "CITY" && !data.city?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "City is required",
        path: ["city"],
      });
    }
    if (data.audience === "INDIVIDUAL" && !data.userId?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "User ID is required",
        path: ["userId"],
      });
    }
  });

type BroadcastFormData = z.infer<typeof broadcastSchema>;

const AUDIENCE_OPTIONS: {
  key: AudienceType;
  label: string;
  icon: React.ReactNode;
  description: string;
}[] = [
  {
    key: "ALL",
    label: "All Users",
    icon: <Users size={16} />,
    description: "Every Partner and Service Provider",
  },
  {
    key: "PARTNERS_ONLY",
    label: "Partners Only",
    icon: <Briefcase size={16} />,
    description: "All active Partners only",
  },
  {
    key: "PROVIDERS_ONLY",
    label: "Providers Only",
    icon: <Wrench size={16} />,
    description: "All Service Providers only",
  },
  {
    key: "CITY",
    label: "By City",
    icon: <MapPin size={16} />,
    description: "Target users in a specific city",
  },
  {
    key: "INDIVIDUAL",
    label: "Individual",
    icon: <User size={16} />,
    description: "One specific user by ID",
  },
  {
    key: "SPECIFIC_USERS",
    label: "Specific Users",
    icon: <UserCheck size={16} />,
    description: "Search and select multiple users",
  },
];

const ROLE_FILTER_OPTIONS = [
  { value: "ALL" as const, label: "All" },
  { value: "PARTNERS" as const, label: "Partners Only" },
  { value: "PROVIDERS" as const, label: "Providers Only" },
];

export function BroadcastForm() {
  const qc = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [channels, setChannels] = useState<Channel[]>(["PUSH"]);
  const [isSending, setIsSending] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<UserSearchResult[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const debouncedSearch = useDebounce(searchQuery, 400);

  const { data: historyData } = useQuery({
    queryKey: ["notifications", "history"],
    queryFn: () => notificationsApi.getHistory({ limit: 10 }),
    staleTime: 30 * 1000,
  });

  const { data: searchResults = [] } = useQuery({
    queryKey: ["notifications", "user-search", debouncedSearch],
    queryFn: () => notificationsApi.searchUsers(debouncedSearch),
    enabled: debouncedSearch.trim().length >= 2,
    staleTime: 10 * 1000,
  });

  const recentBroadcasts: BroadcastHistoryItem[] = historyData?.items ?? [];

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<BroadcastFormData>({
    resolver: zodResolver(broadcastSchema),
    defaultValues: { audience: "ALL", roleFilter: "ALL" },
  });

  const selectedAudience = watch("audience");
  const title = watch("title") ?? "";
  const message = watch("message") ?? "";
  const watchedCity = watch("city");
  const watchedRoleFilter = watch("roleFilter");

  const toggleChannel = (channel: Channel) => {
    setChannels((prev) =>
      prev.includes(channel) ? prev.filter((c) => c !== channel) : [...prev, channel]
    );
  };

  const addUser = (user: UserSearchResult) => {
    if (!selectedUsers.find((u) => u.id === user.id)) {
      setSelectedUsers((prev) => [...prev, user]);
    }
    setSearchQuery("");
  };

  const removeUser = (userId: string) => {
    setSelectedUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  const handleImageUpload = async (file: File) => {
    setIsUploading(true);
    setUploadError(null);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const { uploadUrl, publicUrl } = await notificationsApi.getPresignedUploadUrl(ext);
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
    e.target.value = "";
  };

  const onSubmit = async (data: BroadcastFormData) => {
    if (channels.length === 0) {
      toast.error("Select at least one delivery channel");
      return;
    }
    if (data.audience === "SPECIFIC_USERS" && selectedUsers.length === 0) {
      toast.error("Select at least one user");
      return;
    }
    setIsSending(true);
    try {
      const payload: BroadcastPayload = {
        title: data.title,
        message: data.message,
        audience: data.audience,
        channels,
        city: data.audience === "CITY" ? data.city : undefined,
        roleFilter: data.audience === "CITY" ? (data.roleFilter ?? "ALL") : undefined,
        userId: data.audience === "INDIVIDUAL" ? data.userId : undefined,
        userIds: data.audience === "SPECIFIC_USERS" ? selectedUsers.map((u) => u.id) : undefined,
        imageUrl: imageUrl || undefined,
      };
      await notificationsApi.broadcast(payload);
      toast.success("Notification broadcast sent successfully");
      qc.invalidateQueries({ queryKey: ["notifications", "history"] });
      reset();
      setChannels(["PUSH"]);
      setSelectedUsers([]);
      setImageUrl("");
    } catch {
      toast.error("Failed to send broadcast");
    } finally {
      setIsSending(false);
    }
  };

  const audienceLabel =
    selectedAudience === "ALL"
      ? "All Users"
      : selectedAudience === "PARTNERS_ONLY"
      ? "Partners Only"
      : selectedAudience === "PROVIDERS_ONLY"
      ? "Providers Only"
      : selectedAudience === "CITY"
      ? `City: ${watchedCity || "—"}${watchedRoleFilter && watchedRoleFilter !== "ALL" ? ` (${watchedRoleFilter})` : ""}`
      : selectedAudience === "INDIVIDUAL"
      ? "Individual User"
      : `${selectedUsers.length} user${selectedUsers.length !== 1 ? "s" : ""} selected`;

  const filteredSearchResults = searchResults.filter(
    (u) => !selectedUsers.find((s) => s.id === u.id)
  );

  const hasConditionalField =
    selectedAudience === "CITY" ||
    selectedAudience === "INDIVIDUAL" ||
    selectedAudience === "SPECIFIC_USERS";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* ── Left: Compose Form ──────────────────── */}
      <div className="lg:col-span-2 space-y-5">
        {/* Step 1: Audience */}
        <div className="card">
          <h3 className="font-semibold text-[14px] text-light-text dark:text-dark-text mb-3">
            1. Select Audience
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {AUDIENCE_OPTIONS.map(({ key, label, icon, description }) => (
              <button
                key={key}
                type="button"
                onClick={() => setValue("audience", key)}
                className={cn(
                  "flex flex-col items-start gap-2 p-3 rounded-xl border text-left transition-all duration-150",
                  selectedAudience === key
                    ? "border-brand-purple bg-brand-purple-muted dark:bg-brand-purple-muted-dark"
                    : "border-light-border dark:border-dark-border hover:border-brand-purple/50"
                )}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center",
                    selectedAudience === key
                      ? "bg-brand-purple text-white"
                      : "bg-light-surface-2 dark:bg-dark-surface text-light-text-2 dark:text-dark-text-2"
                  )}
                >
                  {icon}
                </div>
                <div>
                  <p
                    className={cn(
                      "text-[13px] font-semibold",
                      selectedAudience === key
                        ? "text-brand-purple"
                        : "text-light-text dark:text-dark-text"
                    )}
                  >
                    {label}
                  </p>
                  <p className="text-[11px] text-light-text-3 dark:text-dark-text-3 mt-0.5">
                    {description}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {/* Conditional audience fields */}
          <AnimatePresence>
            {hasConditionalField && (
              <motion.div
                key="audience-extra"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-3 overflow-hidden"
              >
                {selectedAudience === "CITY" && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1.5">
                        City Name <span className="text-brand-red">*</span>
                      </label>
                      <input
                        {...register("city")}
                        type="text"
                        placeholder="e.g. Pune, Mumbai, Nashik..."
                        className={cn("input-base", errors.city && "border-brand-red")}
                      />
                      {errors.city && (
                        <p className="text-xs text-brand-red mt-1">{errors.city.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1.5">
                        Filter by Role
                      </label>
                      <div className="flex gap-2">
                        {ROLE_FILTER_OPTIONS.map(({ value, label }) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => setValue("roleFilter", value)}
                            className={cn(
                              "px-3 py-1.5 text-xs rounded-lg border font-medium transition-all duration-150",
                              watchedRoleFilter === value
                                ? "border-brand-purple bg-brand-purple-muted dark:bg-brand-purple-muted-dark text-brand-purple"
                                : "border-light-border dark:border-dark-border text-light-text dark:text-dark-text hover:border-brand-purple/50"
                            )}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {selectedAudience === "INDIVIDUAL" && (
                  <div>
                    <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1.5">
                      User ID <span className="text-brand-red">*</span>
                    </label>
                    <input
                      {...register("userId")}
                      type="text"
                      placeholder="Partner or Provider User ID..."
                      className={cn(
                        "input-base font-mono text-sm",
                        errors.userId && "border-brand-red"
                      )}
                    />
                    {errors.userId && (
                      <p className="text-xs text-brand-red mt-1">{errors.userId.message}</p>
                    )}
                  </div>
                )}

                {selectedAudience === "SPECIFIC_USERS" && (
                  <div className="space-y-3">
                    <div className="relative">
                      <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1.5">
                        Search Users
                      </label>
                      <div className="relative">
                        <Search
                          size={14}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-light-text-3 dark:text-dark-text-3 pointer-events-none"
                        />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onFocus={() => setIsSearchFocused(true)}
                          onBlur={() => setTimeout(() => setIsSearchFocused(false), 150)}
                          placeholder="Search by name or mobile..."
                          className="input-base pl-8"
                        />
                      </div>
                      {isSearchFocused && filteredSearchResults.length > 0 && (
                        <div className="absolute z-10 w-full top-full mt-1 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-xl shadow-lg max-h-48 overflow-y-auto">
                          {filteredSearchResults.map((user) => (
                            <button
                              key={user.id}
                              type="button"
                              onMouseDown={() => addUser(user)}
                              className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-light-surface-2 dark:hover:bg-dark-surface transition-colors"
                            >
                              <div className="flex-1 min-w-0">
                                <p className="text-[13px] font-medium text-light-text dark:text-dark-text truncate">
                                  {user.name}
                                </p>
                                <p className="text-[11px] text-light-text-3 dark:text-dark-text-3">
                                  {user.mobile}
                                  {user.city ? ` · ${user.city}` : ""}
                                </p>
                              </div>
                              <span
                                className={cn(
                                  "shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full",
                                  user.role === "PARTNER"
                                    ? "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-300"
                                    : "bg-brand-purple-muted dark:bg-brand-purple-muted-dark text-brand-purple"
                                )}
                              >
                                {user.role === "PARTNER" ? "Partner" : "Provider"}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    {selectedUsers.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {selectedUsers.map((user) => (
                          <span
                            key={user.id}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-purple/10 text-brand-purple text-[12px] font-medium"
                          >
                            {user.name} · {user.mobile}
                            <button
                              type="button"
                              onClick={() => removeUser(user.id)}
                              className="text-brand-purple hover:text-brand-purple-dark"
                            >
                              <X size={12} />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Step 2: Channels */}
        <div className="card">
          <h3 className="font-semibold text-[14px] text-light-text dark:text-dark-text mb-3">
            2. Delivery Channels
          </h3>
          <div className="flex gap-3">
            {(
              [
                {
                  key: "PUSH" as Channel,
                  label: "Push Notification",
                  icon: <Bell size={16} />,
                  desc: "Firebase FCM",
                },
                {
                  key: "WHATSAPP" as Channel,
                  label: "WhatsApp",
                  icon: <MessageSquare size={16} />,
                  desc: "WhatsApp Business API",
                },
              ] as const
            ).map(({ key, label, icon, desc }) => (
              <button
                key={key}
                type="button"
                onClick={() => toggleChannel(key)}
                className={cn(
                  "flex items-start gap-3 flex-1 p-3 rounded-xl border text-left transition-all duration-150",
                  channels.includes(key)
                    ? "border-brand-purple bg-brand-purple-muted dark:bg-brand-purple-muted-dark"
                    : "border-light-border dark:border-dark-border hover:border-brand-purple/50"
                )}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                    channels.includes(key)
                      ? "bg-brand-purple text-white"
                      : "bg-light-surface-2 dark:bg-dark-surface text-light-text-2 dark:text-dark-text-2"
                  )}
                >
                  {icon}
                </div>
                <div>
                  <p
                    className={cn(
                      "text-[13px] font-semibold",
                      channels.includes(key)
                        ? "text-brand-purple"
                        : "text-light-text dark:text-dark-text"
                    )}
                  >
                    {label}
                  </p>
                  <p className="text-[11px] text-light-text-3 dark:text-dark-text-3">{desc}</p>
                </div>
                <div
                  className={cn(
                    "ml-auto w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 mt-0.5",
                    channels.includes(key)
                      ? "bg-brand-purple border-brand-purple"
                      : "border-light-border dark:border-dark-border"
                  )}
                >
                  {channels.includes(key) && (
                    <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                      <path
                        d="M1 3L3 5L7 1"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Step 3: Compose */}
        <div className="card">
          <h3 className="font-semibold text-[14px] text-light-text dark:text-dark-text mb-3">
            3. Compose Message
          </h3>
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-light-text dark:text-dark-text">
                  Title <span className="text-brand-red">*</span>
                </label>
                <span className="text-[11px] text-light-text-3 dark:text-dark-text-3">
                  {title.length}/80
                </span>
              </div>
              <input
                {...register("title")}
                type="text"
                maxLength={80}
                placeholder="Notification title..."
                className={cn("input-base", errors.title && "border-brand-red")}
              />
              {errors.title && (
                <p className="text-xs text-brand-red mt-1">{errors.title.message}</p>
              )}
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-light-text dark:text-dark-text">
                  Message <span className="text-brand-red">*</span>
                </label>
                <span className="text-[11px] text-light-text-3 dark:text-dark-text-3">
                  {message.length}/500
                </span>
              </div>
              <textarea
                {...register("message")}
                rows={4}
                maxLength={500}
                placeholder="Write your broadcast message..."
                className={cn("input-base resize-none", errors.message && "border-brand-red")}
              />
              {errors.message && (
                <p className="text-xs text-brand-red mt-1">{errors.message.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Step 4: Image upload */}
        <div className="card">
          <h3 className="font-semibold text-[14px] text-light-text dark:text-dark-text mb-3">
            4. Notification Image (Optional)
          </h3>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileChange}
          />
          {!imageUrl && !isUploading && (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-light-border dark:border-dark-border rounded-xl p-6 text-center cursor-pointer hover:border-brand-purple/50 transition-colors"
            >
              <Image
                size={22}
                className="mx-auto mb-2 text-light-text-3 dark:text-dark-text-3"
              />
              <p className="text-[13px] font-medium text-light-text-2 dark:text-dark-text-2">
                Click to upload image
              </p>
              <p className="text-[11px] text-light-text-3 dark:text-dark-text-3 mt-0.5">
                JPG, PNG, WebP supported
              </p>
            </div>
          )}
          {isUploading && (
            <div className="border-2 border-dashed border-brand-purple/50 rounded-xl p-6 flex flex-col items-center justify-center gap-2">
              <Loader2 size={22} className="text-brand-purple animate-spin" />
              <p className="text-[13px] font-medium text-light-text-2 dark:text-dark-text-2">
                Uploading...
              </p>
            </div>
          )}
          {imageUrl && !isUploading && (
            <div className="relative rounded-xl overflow-hidden" style={{ aspectRatio: "16/9" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt="Notification image preview"
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
            <p className="text-xs text-brand-red mt-2">{uploadError}</p>
          )}
        </div>

        {/* Send button */}
        <Button
          variant="primary"
          size="lg"
          icon={<Send size={16} />}
          onClick={handleSubmit(onSubmit)}
          loading={isSending}
          className="w-full"
        >
          Send Broadcast
        </Button>
      </div>

      {/* ── Right: Preview + History ────────────── */}
      <div className="space-y-4">
        {/* Phone preview */}
        <div className="card">
          <h3 className="font-semibold text-[14px] text-light-text dark:text-dark-text mb-3">
            Preview
          </h3>
          <div className="bg-light-surface-2 dark:bg-dark-surface rounded-xl p-3 border border-light-border dark:border-dark-border">
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-brand-purple flex items-center justify-center shrink-0">
                <span className="text-sm">🚕</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-light-text dark:text-dark-text">
                  {title || "Notification Title"}
                </p>
                <p className="text-[12px] text-light-text-2 dark:text-dark-text-2 mt-0.5 leading-relaxed">
                  {message || "Your notification message will appear here..."}
                </p>
                <p className="text-[10px] text-light-text-3 dark:text-dark-text-3 mt-1">
                  now · QuickCab
                </p>
              </div>
            </div>
            {imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt=""
                className="mt-2 rounded-lg max-h-24 object-cover w-full"
              />
            )}
          </div>
          <div className="mt-3 space-y-1.5">
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-light-text-2 dark:text-dark-text-2">Audience</span>
              <span className="font-medium text-light-text dark:text-dark-text">
                {audienceLabel}
              </span>
            </div>
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-light-text-2 dark:text-dark-text-2">Channels</span>
              <span className="font-medium text-light-text dark:text-dark-text">
                {channels.length === 0 ? "None selected" : channels.join(" + ")}
              </span>
            </div>
          </div>
        </div>

        {/* Recent broadcasts */}
        <div className="card">
          <h3 className="font-semibold text-[14px] text-light-text dark:text-dark-text mb-3">
            Recent Broadcasts
          </h3>
          {recentBroadcasts.length === 0 ? (
            <p className="text-[13px] text-light-text-3 dark:text-dark-text-3 text-center py-6">
              No broadcasts sent yet
            </p>
          ) : (
            <div className="space-y-3">
              {recentBroadcasts.map((b) => (
                <div
                  key={b.id}
                  className="border-b border-light-border dark:border-dark-border pb-3 last:border-0 last:pb-0"
                >
                  {b.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={b.imageUrl}
                      alt=""
                      className="w-full h-16 object-cover rounded-lg mb-2"
                    />
                  )}
                  <p className="text-[13px] font-medium text-light-text dark:text-dark-text">
                    {b.title}
                  </p>
                  <p className="text-[11px] text-light-text-3 dark:text-dark-text-3 mt-0.5">
                    {b.audience}
                    {b.roleFilter && b.roleFilter !== "ALL" ? ` · ${b.roleFilter}` : ""}
                    {b.city ? ` · ${b.city}` : ""}
                    {" · "}
                    {b.channels?.join(", ")}
                    {" · "}
                    {b.userCount ?? 0} users
                    {b.sentAt ? `· ${formatRelative(b.sentAt)}` : ""}
                  </p>
                  <p className="text-[10px] text-light-text-3 dark:text-dark-text-3 mt-0.5">
                    by {b.sentBy?.name ?? "—"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
