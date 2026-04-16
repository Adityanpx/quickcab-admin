"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bell, MessageSquare, Users, MapPin, User } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { notificationsApi, type BroadcastPayload } from "@/lib/api/notifications";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

const broadcastSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(80),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(500),
  audience: z.enum(["ALL", "CITY", "INDIVIDUAL"]),
  city: z.string().optional(),
  userId: z.string().optional(),
}).refine(
  (data) => {
    if (data.audience === "CITY" && !data.city?.trim()) return false;
    if (data.audience === "INDIVIDUAL" && !data.userId?.trim()) return false;
    return true;
  },
  {
    message: "Please fill in the required audience field",
    path: ["city"],
  }
);

type BroadcastFormData = z.infer<typeof broadcastSchema>;

type AudienceType = "ALL" | "CITY" | "INDIVIDUAL";
type Channel = "PUSH" | "WHATSAPP";

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
    description: "Send to every Partner and Service Provider",
  },
  {
    key: "CITY",
    label: "By City",
    icon: <MapPin size={16} />,
    description: "Send to all users in a specific city",
  },
  {
    key: "INDIVIDUAL",
    label: "Individual",
    icon: <User size={16} />,
    description: "Send to a specific user by User ID",
  },
];

interface RecentBroadcast {
  id: string;
  title: string;
  audience: string;
  channels: string[];
  sentAt: string;
}

export function BroadcastForm() {
  const [channels, setChannels] = useState<Channel[]>(["PUSH"]);
  const [isSending, setIsSending] = useState(false);
  const [recentBroadcasts] = useState<RecentBroadcast[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<BroadcastFormData>({
    resolver: zodResolver(broadcastSchema),
    defaultValues: { audience: "ALL" },
  });

  const selectedAudience = watch("audience");
  const title = watch("title") ?? "";
  const message = watch("message") ?? "";

  const toggleChannel = (channel: Channel) => {
    setChannels((prev) =>
      prev.includes(channel)
        ? prev.filter((c) => c !== channel)
        : [...prev, channel]
    );
  };

  const onSubmit = async (data: BroadcastFormData) => {
    if (channels.length === 0) {
      toast.error("Select at least one delivery channel");
      return;
    }
    setIsSending(true);
    try {
      const payload: BroadcastPayload = {
        title: data.title,
        message: data.message,
        audience: data.audience,
        city: data.audience === "CITY" ? data.city : undefined,
        userId: data.audience === "INDIVIDUAL" ? data.userId : undefined,
        channels,
      };
      await notificationsApi.broadcast(payload);
      toast.success("Notification broadcast sent successfully");
      reset();
      setChannels(["PUSH"]);
    } catch {
      toast.error("Failed to send broadcast");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* ── Left: Compose Form ──────────────────── */}
      <div className="lg:col-span-2 space-y-5">
        {/* Audience selector */}
        <div className="card">
          <h3 className="font-semibold text-[14px] text-light-text dark:text-dark-text mb-3">
            1. Select Audience
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
            {selectedAudience !== "ALL" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-3 overflow-hidden"
              >
                {selectedAudience === "CITY" && (
                  <div>
                    <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1.5">
                      City Name <span className="text-brand-red">*</span>
                    </label>
                    <input
                      {...register("city")}
                      type="text"
                      placeholder="e.g. Pune, Mumbai, Nashik..."
                      className={cn(
                        "input-base",
                        errors.city && "border-brand-red"
                      )}
                    />
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
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Channels */}
        <div className="card">
          <h3 className="font-semibold text-[14px] text-light-text dark:text-dark-text mb-3">
            2. Delivery Channels
          </h3>
          <div className="flex gap-3">
            {(
              [
                { key: "PUSH" as Channel, label: "Push Notification", icon: <Bell size={16} />, desc: "Firebase FCM" },
                { key: "WHATSAPP" as Channel, label: "WhatsApp", icon: <MessageSquare size={16} />, desc: "WhatsApp Business API" },
              ]
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
                  <p className="text-[11px] text-light-text-3 dark:text-dark-text-3">
                    {desc}
                  </p>
                </div>
                {/* Checkbox indicator */}
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

        {/* Compose */}
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
                className={cn(
                  "input-base",
                  errors.title && "border-brand-red"
                )}
              />
              {errors.title && (
                <p className="text-xs text-brand-red mt-1">
                  {errors.title.message}
                </p>
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
                className={cn(
                  "input-base resize-none",
                  errors.message && "border-brand-red"
                )}
              />
              {errors.message && (
                <p className="text-xs text-brand-red mt-1">
                  {errors.message.message}
                </p>
              )}
            </div>
          </div>
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
          </div>
          <div className="mt-3 space-y-1.5">
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-light-text-2 dark:text-dark-text-2">
                Audience
              </span>
              <span className="font-medium text-light-text dark:text-dark-text">
                {selectedAudience === "ALL"
                  ? "All Users"
                  : selectedAudience === "CITY"
                  ? `City: ${watch("city") || "—"}`
                  : "Individual"}
              </span>
            </div>
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-light-text-2 dark:text-dark-text-2">
                Channels
              </span>
              <span className="font-medium text-light-text dark:text-dark-text">
                {channels.length === 0
                  ? "None selected"
                  : channels.join(" + ")}
              </span>
            </div>
          </div>
        </div>

        {/* Recent broadcasts placeholder */}
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
                  <p className="text-[13px] font-medium text-light-text dark:text-dark-text">
                    {b.title}
                  </p>
                  <p className="text-[11px] text-light-text-3 dark:text-dark-text-3 mt-0.5">
                    {b.audience} · {b.channels.join(", ")} · {b.sentAt}
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
