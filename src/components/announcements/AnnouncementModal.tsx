"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Search, Loader2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { announcementsApi } from "@/lib/api/announcements";
import type { Announcement, CreateAnnouncementPayload } from "@/lib/api/announcements";
import { useDebounce } from "@/lib/hooks/useDebounce";

const schema = z.object({
  message: z.string().min(5, "Message must be at least 5 characters"),
  title: z.string().optional(),
  priority: z.enum(["NORMAL", "HIGH"]),
  targetType: z.enum(["ALL", "CITY", "STATE", "USER"]),
  targetValue: z.string().optional(),
  expiresAt: z.string().min(1, "Expiry date is required"),
});

type FormData = z.infer<typeof schema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateAnnouncementPayload) => Promise<void>;
  editItem?: Announcement | null;
  loading?: boolean;
}

export function AnnouncementModal({ isOpen, onClose, onSubmit, editItem, loading }: Props) {
  const isEdit = !!editItem;
  const [userSearch, setUserSearch] = useState("");
  const [userResults, setUserResults] = useState<any[]>([]);
  const [searchingUsers, setSearchingUsers] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{ id: string; name: string; mobile: string } | null>(null);
  const debouncedSearch = useDebounce(userSearch, 400);

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { priority: "NORMAL", targetType: "ALL" },
  });

  const targetType = watch("targetType");

  useEffect(() => {
    if (editItem) {
      reset({
        message: editItem.message,
        title: editItem.title ?? "",
        priority: editItem.priority,
        targetType: editItem.targetType,
        targetValue: editItem.targetValue ?? "",
        expiresAt: editItem.expiresAt.slice(0, 16),
      });
    } else {
      reset({ message: "", title: "", priority: "NORMAL", targetType: "ALL", targetValue: "", expiresAt: "" });
      setSelectedUser(null);
      setUserSearch("");
    }
  }, [isOpen, editItem, reset]);

  useEffect(() => {
    if (targetType !== "USER" || !debouncedSearch) { setUserResults([]); return; }
    setSearchingUsers(true);
    announcementsApi.searchUsers(debouncedSearch)
      .then(setUserResults)
      .finally(() => setSearchingUsers(false));
  }, [debouncedSearch, targetType]);

  const handleFormSubmit = async (data: FormData) => {
    let targetValue = data.targetValue;
    if (data.targetType === "USER") {
      if (!selectedUser) { return; }
      targetValue = selectedUser.id;
    }
    await onSubmit({
      message: data.message,
      title: data.title || undefined,
      priority: data.priority,
      targetType: data.targetType,
      targetValue: ["CITY", "STATE", "USER"].includes(data.targetType) ? targetValue : undefined,
      expiresAt: new Date(data.expiresAt).toISOString(),
    });
  };

  const minDateTime = new Date(Date.now() + 5 * 60 * 1000).toISOString().slice(0, 16);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit Announcement" : "New Announcement"}
      size="lg"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button variant="primary" size="sm" onClick={handleSubmit(handleFormSubmit)} loading={loading}>
            {isEdit ? "Save Changes" : "Create & Send"}
          </Button>
        </>
      }
    >
      <div className="max-h-[65vh] overflow-y-auto pr-1 space-y-4">

        {/* Message */}
        <div>
          <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1.5">
            Message <span className="text-brand-red">*</span>
          </label>
          <textarea
            {...register("message")}
            rows={3}
            placeholder="e.g. Heavy rain in Pune today. Be cautious while driving."
            className={cn("input-base resize-none", errors.message && "border-brand-red")}
          />
          {errors.message && <p className="text-xs text-brand-red mt-1">{errors.message.message}</p>}
        </div>

        {/* Title (optional) */}
        <div>
          <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1.5">
            Title <span className="text-light-text-3 dark:text-dark-text-3 font-normal">(optional)</span>
          </label>
          <input
            {...register("title")}
            type="text"
            placeholder="e.g. Weather Alert"
            className="input-base"
          />
          <p className="text-[11px] text-light-text-3 dark:text-dark-text-3 mt-1">
            Shown as bold header above the message in the app
          </p>
        </div>

        {/* Priority + Target Type — side by side */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1.5">
              Priority
            </label>
            <select {...register("priority")} className="input-base">
              <option value="NORMAL">Normal — slim banner</option>
              <option value="HIGH">High — prominent card</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1.5">
              Send To
            </label>
            <select
              {...register("targetType")}
              onChange={(e) => {
                setValue("targetType", e.target.value as any);
                setValue("targetValue", "");
                setSelectedUser(null);
                setUserSearch("");
                setUserResults([]);
              }}
              className="input-base"
            >
              <option value="ALL">All Partners</option>
              <option value="CITY">Specific City</option>
              <option value="STATE">Specific State</option>
              <option value="USER">Individual User</option>
            </select>
          </div>
        </div>

        {/* Target Value — City or State */}
        {(targetType === "CITY" || targetType === "STATE") && (
          <div>
            <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1.5">
              {targetType === "CITY" ? "City Name" : "State Name"} <span className="text-brand-red">*</span>
            </label>
            <input
              {...register("targetValue")}
              type="text"
              placeholder={targetType === "CITY" ? "e.g. Pune" : "e.g. Maharashtra"}
              className="input-base"
            />
            <p className="text-[11px] text-light-text-3 dark:text-dark-text-3 mt-1">
              Must match exactly how it's stored in partner profiles
            </p>
          </div>
        )}

        {/* Target Value — User search */}
        {targetType === "USER" && (
          <div>
            <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1.5">
              Search Partner <span className="text-brand-red">*</span>
            </label>
            {selectedUser ? (
              <div className="flex items-center justify-between p-3 rounded-xl border border-brand-purple/40 bg-brand-purple/5">
                <div>
                  <p className="text-sm font-medium text-light-text dark:text-dark-text">{selectedUser.name}</p>
                  <p className="text-xs text-light-text-3 dark:text-dark-text-3">{selectedUser.mobile}</p>
                </div>
                <button
                  type="button"
                  onClick={() => { setSelectedUser(null); setUserSearch(""); }}
                  className="text-xs text-brand-red hover:underline"
                >
                  Change
                </button>
              </div>
            ) : (
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-light-text-3 dark:text-dark-text-3" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search by name or mobile..."
                  className="input-base pl-8"
                />
                {searchingUsers && (
                  <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-light-text-3 dark:text-dark-text-3" />
                )}
                {userResults.length > 0 && (
                  <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-xl shadow-lg overflow-hidden">
                    {userResults.map((u: any) => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => { setSelectedUser({ id: u.id, name: u.name, mobile: u.mobile }); setUserResults([]); setUserSearch(""); }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-light-surface-2 dark:hover:bg-dark-surface-2 text-left"
                      >
                        <div className="w-7 h-7 rounded-full bg-brand-purple/20 flex items-center justify-center text-xs font-bold text-brand-purple">
                          {u.name?.[0]?.toUpperCase() ?? "?"}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-light-text dark:text-dark-text">{u.name}</p>
                          <p className="text-xs text-light-text-3 dark:text-dark-text-3">{u.mobile}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Expiry */}
        <div>
          <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1.5">
            Show Until <span className="text-brand-red">*</span>
          </label>
          <input
            {...register("expiresAt")}
            type="datetime-local"
            min={minDateTime}
            className={cn("input-base", errors.expiresAt && "border-brand-red")}
          />
          {errors.expiresAt && <p className="text-xs text-brand-red mt-1">{errors.expiresAt.message}</p>}
          <p className="text-[11px] text-light-text-3 dark:text-dark-text-3 mt-1">
            Announcement auto-disappears from the app after this date & time
          </p>
        </div>

      </div>
    </Modal>
  );
}
