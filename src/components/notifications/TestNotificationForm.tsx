"use client";

import { useMemo, useState } from "react";
import { X, Search, Send } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/Button";
import {
  notificationsApi,
  TEST_NOTIF_TYPES,
  type UserSearchResult,
} from "@/lib/api/notifications";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/lib/hooks/useDebounce";
import toast from "react-hot-toast";

export function TestNotificationForm() {
  const [notifType, setNotifType] = useState("GENERAL");
  const [city, setCity] = useState("Pune");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserSearchResult | null>(null);

  const debouncedSearch = useDebounce(searchQuery, 300);

  const { data: searchResults = [] } = useQuery({
    queryKey: ["notifications", "test-send", "user-search", debouncedSearch],
    queryFn: () => notificationsApi.searchUsers(debouncedSearch),
    enabled: debouncedSearch.trim().length >= 2 && !selectedUser,
    staleTime: 10 * 1000,
  });

  const groupedNotifTypes = useMemo(() => {
    const groups: { group: string; items: typeof TEST_NOTIF_TYPES }[] = [];
    for (const item of TEST_NOTIF_TYPES) {
      const existing = groups.find((g) => g.group === item.group);
      if (existing) {
        existing.items.push(item);
      } else {
        groups.push({ group: item.group, items: [item] });
      }
    }
    return groups;
  }, []);

  const testSendMutation = useMutation({
    mutationFn: () =>
      notificationsApi.testSend({
        userId: selectedUser!.id,
        notifType,
        city: notifType === "BOOKING_NEW" ? city : undefined,
      }),
    onSuccess: (data) => {
      toast.success(data?.message ?? "Test notification sent");
    },
    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Failed to send test notification";
      toast.error(message);
    },
  });

  const isCityRequired = notifType === "BOOKING_NEW";
  const isSendDisabled =
    !selectedUser ||
    (isCityRequired && !city.trim()) ||
    testSendMutation.isPending;

  return (
    <div className="card">
      <h3 className="font-semibold text-[14px] text-light-text dark:text-dark-text">
        Test Notification
      </h3>
      <p className="text-[11px] text-light-text-3 dark:text-dark-text-3 mt-0.5 mb-4">
        Fire any production notification at one user for QA — no real action is performed.
      </p>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1.5">
            Notification Type
          </label>
          <select
            value={notifType}
            onChange={(e) => setNotifType(e.target.value)}
            className="input-base"
          >
            {groupedNotifTypes.map(({ group, items }) => (
              <optgroup key={group} label={group}>
                {items.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {isCityRequired && (
          <div>
            <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1.5">
              City <span className="text-brand-red">*</span>
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Pune, Mumbai, Nashik..."
              className="input-base"
            />
          </div>
        )}

        <div className="relative">
          <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1.5">
            User
          </label>

          {selectedUser ? (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-purple/10 text-brand-purple text-[12px] font-medium w-fit">
              {selectedUser.name} · {selectedUser.mobile}
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="text-brand-purple hover:text-brand-purple-dark"
              >
                <X size={12} />
              </button>
            </span>
          ) : (
            <>
              <div className="relative">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-light-text-3 dark:text-dark-text-3 pointer-events-none"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name or mobile..."
                  className="input-base pl-8"
                />
              </div>
              {debouncedSearch.trim().length >= 2 && searchResults.length > 0 && (
                <ul className="absolute z-10 w-full top-full mt-1 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-xl shadow-lg max-h-48 overflow-y-auto">
                  {searchResults.map((user) => (
                    <li key={user.id}>
                      <button
                        type="button"
                        onMouseDown={() => {
                          setSelectedUser(user);
                          setSearchQuery("");
                        }}
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
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>

        <Button
          variant="primary"
          size="lg"
          icon={<Send size={16} />}
          onClick={() => testSendMutation.mutate()}
          loading={testSendMutation.isPending}
          disabled={isSendDisabled}
          className="w-full"
        >
          Send Test Notification
        </Button>
      </div>
    </div>
  );
}
