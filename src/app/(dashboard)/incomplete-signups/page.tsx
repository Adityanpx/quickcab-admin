"use client";

import { Suspense, useCallback, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { UserX, Phone, MessageCircle, Clock, Download } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { useIncompleteSignups } from "@/lib/hooks/useIncompleteSignups";
import { incompleteSignupsApi } from "@/lib/api/incompleteSignups";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { SearchInput } from "@/components/ui/SearchInput";
import { Pagination } from "@/components/ui/Pagination";
import { TableRowSkeleton } from "@/components/ui/SkeletonLoader";
import { EmptyState } from "@/components/ui/EmptyState";

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as any },
  }),
};

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return "Never";
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// Strip any non-digit characters and assume India for bare 10-digit numbers
// so wa.me/tel: links work regardless of how the mobile number was stored.
function normalizeMobile(mobile: string): string {
  const digits = mobile.replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  return digits;
}

function IncompleteSignupsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = Number(searchParams.get("page") ?? "1");
  const search = searchParams.get("search") ?? "";

  const searchParamsRef = useRef(searchParams);
  searchParamsRef.current = searchParams;

  const updateParams = useCallback((updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParamsRef.current.toString());
    Object.entries(updates).forEach(([k, v]) => {
      if (v) params.set(k, v);
      else params.delete(k);
    });
    router.replace(`?${params.toString()}`);
  }, [router]);

  const handleSearch = useCallback((v: string) => {
    if (v === (searchParamsRef.current.get("search") ?? "")) return;
    updateParams({ search: v, page: "1" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { data, isLoading } = useIncompleteSignups({ page, limit: 20, search: search || undefined });

  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Server hard-caps `limit` at 100 per request (getPaginationParams),
      // so paginate through every page and stitch results together —
      // same pattern as the Partners page export.
      const baseFilters = { search: search || undefined };

      const PAGE_SIZE = 100;
      const SAFETY_MAX_PAGES = 200; // 20,000 rows ceiling — avoids a runaway loop

      const first = await incompleteSignupsApi.getAll({ ...baseFilters, page: 1, limit: PAGE_SIZE });
      let allItems = [...first.items];
      const total = first.pagination?.total ?? allItems.length;
      const totalPages = Math.min(first.pagination?.totalPages ?? 1, SAFETY_MAX_PAGES);

      for (let p = 2; p <= totalPages; p++) {
        const next = await incompleteSignupsApi.getAll({ ...baseFilters, page: p, limit: PAGE_SIZE });
        allItems = allItems.concat(next.items);
      }

      const rows = allItems.map((u) => [
        u.mobile,
        `"${(u.name ?? "").replace(/"/g, '""')}"`,
        u.language,
        new Date(u.createdAt).toLocaleDateString("en-IN"),
        u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString("en-IN") : "Never",
      ]);
      const header = ["Mobile", "Name", "Language", "Signed Up", "Last Active"];
      const csv = [header, ...rows].map((r) => r.join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `quickcab-incomplete-signups-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);

      if (allItems.length < total) {
        toast.error(`Exported ${allItems.length} of ${total} — hit the safety page cap. Narrow your search and export again for the rest.`);
      } else {
        toast.success(`CSV exported — ${allItems.length} signup${allItems.length === 1 ? "" : "s"}`);
      }
    } catch {
      toast.error("Export failed");
    } finally {
      setIsExporting(false);
    }
  };

  const items = data?.items ?? [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6 max-w-[1200px]">
      {/* ── Page Header ─────────────────────────────── */}
      <motion.div custom={0} variants={sectionVariants} initial="hidden" animate="visible">
        <PageHeader
          title="Incomplete Signups"
          subtitle="Users who verified OTP but never picked Partner or Service Provider — invisible everywhere else in the admin panel. Reach out to help them finish onboarding."
        />
      </motion.div>

      {/* ── Stats ───────────────────────────────────── */}
      <motion.div
        custom={1}
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
      >
        <StatCard
          index={0}
          label="Total Incomplete Signups"
          value={(pagination?.total ?? 0).toLocaleString("en-IN")}
          icon={<UserX size={16} />}
          accentColor="orange"
        />
        <StatCard
          index={1}
          label="Showing"
          value={`Page ${pagination?.page ?? 1} of ${pagination?.totalPages ?? 1}`}
          icon={<Clock size={16} />}
          accentColor="purple"
        />
      </motion.div>

      {/* ── Search ──────────────────────────────────── */}
      <motion.div custom={2} variants={sectionVariants} initial="hidden" animate="visible">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <SearchInput
            placeholder="Search by mobile number..."
            defaultValue={search}
            onSearch={handleSearch}
            className="sm:w-80"
          />
          <div className="flex-1" />
          <Button
            variant="outline"
            size="sm"
            icon={<Download size={14} />}
            onClick={handleExport}
            loading={isExporting}
          >
            Export CSV
          </Button>
        </div>
      </motion.div>

      {/* ── Table ───────────────────────────────────── */}
      <motion.div custom={3} variants={sectionVariants} initial="hidden" animate="visible">
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table-base">
              <thead>
                <tr>
                  <th className="pl-5">User</th>
                  <th>Mobile</th>
                  <th>Language</th>
                  <th>Signed Up</th>
                  <th>Last Active</th>
                  <th className="pr-5 text-right">Reach Out</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <TableRowSkeleton key={i} cols={6} />
                  ))
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <EmptyState
                        title="No incomplete signups"
                        description="Everyone who's verified OTP has gone on to pick a role. Nothing to follow up on right now."
                        icon={<UserX size={22} />}
                      />
                    </td>
                  </tr>
                ) : (
                  items.map((user, i) => {
                    const normalized = normalizeMobile(user.mobile);
                    return (
                      <motion.tr
                        key={user.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03, duration: 0.25 }}
                        className="hover:bg-light-surface-2 dark:hover:bg-dark-surface transition-colors"
                      >
                        {/* User */}
                        <td className="pl-5">
                          <div className="flex items-center gap-3">
                            <Avatar name={user.name || user.mobile} size="sm" />
                            <span className="text-[13px] font-medium text-light-text dark:text-dark-text">
                              {user.name || <span className="text-light-text-3 dark:text-dark-text-3 italic">No name yet</span>}
                            </span>
                          </div>
                        </td>

                        {/* Mobile */}
                        <td>
                          <span className="text-[13px] font-mono text-light-text-2 dark:text-dark-text-2">
                            {user.mobile}
                          </span>
                        </td>

                        {/* Language */}
                        <td>
                          <span className="text-[12px] uppercase text-light-text-2 dark:text-dark-text-2">
                            {user.language}
                          </span>
                        </td>

                        {/* Signed Up */}
                        <td>
                          <span className="text-[12px] text-light-text-2 dark:text-dark-text-2">
                            {new Date(user.createdAt).toLocaleDateString("en-IN", {
                              day: "2-digit", month: "short", year: "numeric",
                            })}
                          </span>
                        </td>

                        {/* Last Active */}
                        <td>
                          <span className="text-[12px] text-light-text-2 dark:text-dark-text-2">
                            {timeAgo(user.lastLoginAt)}
                          </span>
                        </td>

                        {/* Reach Out */}
                        <td className="pr-5">
                          <div className="flex items-center justify-end gap-2">
                            <a
                              href={`https://wa.me/${normalized}?text=${encodeURIComponent(
                                "Hi! We noticed you started signing up on QuickCab but haven't finished setting up your account yet. Complete your profile and KYC to start getting bookings — it only takes a couple of minutes!"
                              )}`}
                              target="_blank"
                              rel="noreferrer"
                              className="w-8 h-8 rounded-lg bg-green-50 dark:bg-brand-green-muted hover:bg-green-100 flex items-center justify-center text-green-600 dark:text-brand-green transition-colors"
                              title="Message on WhatsApp"
                            >
                              <MessageCircle size={15} />
                            </a>
                            <a
                              href={`tel:+${normalized}`}
                              className="w-8 h-8 rounded-lg bg-light-surface-2 dark:bg-dark-surface hover:bg-light-border dark:hover:bg-dark-border flex items-center justify-center text-light-text-2 dark:text-dark-text-2 transition-colors"
                              title="Call"
                            >
                              <Phone size={15} />
                            </a>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!isLoading && items.length > 0 && (
            <div className="px-5 py-4 border-t border-light-border dark:border-dark-border">
              <Pagination
                page={page}
                totalPages={pagination?.totalPages ?? 1}
                total={pagination?.total ?? 0}
                limit={20}
                onPageChange={(n) => updateParams({ page: String(n) })}
              />
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default function IncompleteSignupsPage() {
  return (
    <Suspense fallback={null}>
      <IncompleteSignupsPageContent />
    </Suspense>
  );
}
