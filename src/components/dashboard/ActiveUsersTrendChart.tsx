"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { AreaChart } from "@/components/charts/AreaChart";
import { Skeleton } from "@/components/ui/SkeletonLoader";
import { useActiveUsersTrend } from "@/lib/hooks/useDashboard";
import { cn } from "@/lib/utils";

type RangeDays = 7 | 30;

const ranges: { key: RangeDays; label: string }[] = [
  { key: 7, label: "7 Days" },
  { key: 30, label: "30 Days" },
];

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

// getActiveUserStats only does day-level granularity (it clamps from/to to
// midnight internally regardless of what's sent), so plain date strings —
// not full local timestamps — are all it actually parses.
function toLocalTimestamp(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function startOfDaysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - (days - 1));
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDayLabel(dateStr: string): string {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

export function ActiveUsersTrendChart() {
  const [rangeDays, setRangeDays] = useState<RangeDays>(7);

  const { from, to } = useMemo(
    () => ({
      from: toLocalTimestamp(startOfDaysAgo(rangeDays)),
      to: toLocalTimestamp(new Date()),
    }),
    [rangeDays]
  );

  const { data, isLoading } = useActiveUsersTrend({ from, to });

  const chartData = useMemo(
    () =>
      (data?.results ?? []).map((point) => ({
        label: formatDayLabel(point.date),
        value: point.activeCount,
      })),
    [data]
  );

  const total = chartData.reduce((sum, point) => sum + point.value, 0);

  return (
    <div className="card">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <div>
          <h3 className="font-semibold text-[15px] text-light-text dark:text-dark-text">
            Active Users Trend
          </h3>
          <p className="text-[12px] text-light-text-3 dark:text-dark-text-3 mt-0.5">
            {total.toLocaleString("en-IN")} active users{" "}
            <span className="text-brand-purple font-medium">
              last {rangeDays} days
            </span>
          </p>
        </div>

        {/* Range Toggle */}
        <div className="flex items-center gap-1 p-0.5 bg-light-surface-2 dark:bg-dark-surface rounded-xl">
          {ranges.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setRangeDays(key)}
              className={cn(
                "relative px-3.5 py-1.5 rounded-lg text-[12px] font-medium transition-all duration-200",
                rangeDays === key
                  ? "text-white"
                  : "text-light-text-2 dark:text-dark-text-2 hover:text-light-text dark:hover:text-dark-text"
              )}
            >
              {rangeDays === key && (
                <motion.div
                  layoutId="activeUsersRangeActive"
                  className="absolute inset-0 bg-brand-purple rounded-lg"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <span className="relative z-10">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="mt-4">
        {isLoading ? (
          <Skeleton className="h-[220px] w-full" rounded="lg" />
        ) : (
          <AreaChart data={chartData} height={220} color="#16A34A" />
        )}
      </div>
    </div>
  );
}
