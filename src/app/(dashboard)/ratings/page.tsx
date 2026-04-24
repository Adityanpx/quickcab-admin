"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { Star, Flag, AlertTriangle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ratingsApi } from "@/lib/api/ratings";
import type { Rating } from "@/lib/api/ratings";
import { dashboardApi } from "@/lib/api/dashboard";
import { RatingTable } from "@/components/ratings/RatingTable";
import { RemoveRatingModal } from "@/components/ratings/RemoveRatingModal";
import { StatCard } from "@/components/ui/StatCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { FilterSelect } from "@/components/ui/FilterSelect";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as any },
  }),
};

const STAR_OPTIONS = [
  { value: "1", label: "1 Star" },
  { value: "2", label: "2 Stars" },
  { value: "3", label: "3 Stars" },
  { value: "4", label: "4 Stars" },
  { value: "5", label: "5 Stars" },
];

type ViewMode = "all" | "flagged";

export default function RatingsPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [maxStars, setMaxStars] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("all");
  const [removeTarget, setRemoveTarget] = useState<Rating | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["ratings", { page, maxStars, isFlagged: viewMode === "flagged" }],
    queryFn: () =>
      ratingsApi.getAll({
        page,
        limit: 15,
        isFlagged: viewMode === "flagged" ? "true" : undefined,
        isRemoved: "false",
        maxStars: maxStars ? Number(maxStars) : undefined,
      }),
    staleTime: 30 * 1000,
  });

  const { data: dashStats } = useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: dashboardApi.getStats,
    staleTime: 60 * 1000,
  });

  const removeMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      ratingsApi.remove(id, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ratings"] });
      toast.success("Rating removed");
      setRemoveTarget(null);
    },
    onError: () => toast.error("Failed to remove rating"),
  });

  const ratings = data?.items ?? [];
  const pagination = data?.pagination;

  const platformFlagged = dashStats?.ratings?.flagged ?? 0;

  const handleRemoveConfirm = async (reason: string) => {
    if (!removeTarget) return;
    removeMutation.mutate({ id: removeTarget.id, reason });
  };

  return (
    <div className="space-y-6 max-w-[1600px]">
      {/* Header */}
      <motion.div custom={0} variants={sectionVariants} initial="hidden" animate="visible">
        <PageHeader
          title="Ratings & Moderation"
          subtitle="Review partner ratings and remove abusive content"
        />
      </motion.div>

      {/* Stats */}
      <motion.div
        custom={1}
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <StatCard
          index={0}
          label="Total Ratings"
          value={(pagination?.total ?? 0).toLocaleString("en-IN")}
          icon={<Star size={16} />}
          accentColor="purple"
        />
        <StatCard
          index={1}
          label="Flagged (≤ 2★)"
          value={platformFlagged.toLocaleString("en-IN")}
          subtext="platform-wide"
          icon={<Flag size={16} />}
          accentColor={platformFlagged > 3 ? "red" : "orange"}
        />
        <StatCard
          index={2}
          label="Total Submitted"
          value={(pagination?.total ?? 0).toLocaleString("en-IN")}
          subtext="active ratings"
          icon={<Star size={16} />}
          accentColor="green"
        />
        <StatCard
          index={3}
          label="Pending Review"
          value={platformFlagged.toLocaleString("en-IN")}
          subtext="flagged platform-wide"
          icon={<AlertTriangle size={16} />}
          accentColor="red"
        />
      </motion.div>

      {/* Filters + View toggle */}
      <motion.div
        custom={2}
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
      >
        {/* View mode tabs */}
        <div className="flex items-center gap-1 p-0.5 bg-light-surface-2 dark:bg-dark-surface rounded-xl border border-light-border dark:border-dark-border">
          {(["all", "flagged"] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => { setViewMode(mode); setPage(1); }}
              className={cn(
                "relative px-4 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 capitalize",
                viewMode === mode
                  ? mode === "flagged"
                    ? "bg-brand-red text-white shadow-sm"
                    : "bg-white dark:bg-dark-surface-2 text-light-text dark:text-dark-text shadow-sm border border-light-border dark:border-dark-border"
                  : "text-light-text-2 dark:text-dark-text-2 hover:text-light-text dark:hover:text-dark-text"
              )}
            >
              {mode === "flagged" ? "⚑ Flagged Only" : "All Ratings"}
            </button>
          ))}
        </div>

        {/* Max stars filter */}
        <FilterSelect
          value={maxStars}
          onChange={(v) => { setMaxStars(v); setPage(1); }}
          options={STAR_OPTIONS}
          placeholder="All Stars"
          className="sm:w-36"
        />
      </motion.div>

      {/* Table */}
      <motion.div custom={3} variants={sectionVariants} initial="hidden" animate="visible">
        <RatingTable
          ratings={ratings}
          isLoading={isLoading}
          page={page}
          totalPages={pagination?.totalPages ?? 1}
          total={pagination?.total ?? 0}
          limit={15}
          onPageChange={setPage}
          onRemove={setRemoveTarget}
        />
      </motion.div>

      {/* Remove modal */}
      <RemoveRatingModal
        isOpen={!!removeTarget}
        onClose={() => setRemoveTarget(null)}
        onConfirm={handleRemoveConfirm}
        rating={removeTarget}
        loading={removeMutation.isPending}
      />
    </div>
  );
}
