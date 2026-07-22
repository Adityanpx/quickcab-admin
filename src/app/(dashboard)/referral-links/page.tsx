"use client";

import { Suspense, useCallback, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { MousePointerClick, Download, UserPlus, Percent } from "lucide-react";
import { useReferralLinkStats } from "@/lib/hooks/useReferralLinks";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { StatCardSkeleton } from "@/components/ui/SkeletonLoader";
import { FilterSelect } from "@/components/ui/FilterSelect";
import { DataTable, type Column } from "@/components/ui/DataTable";
import type { ReferralCodeStat } from "@/types/referral-link";

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as any },
  }),
};

const DATE_PRESET_OPTIONS = [
  { value: "today", label: "Today" },
  { value: "week",  label: "This Week" },
  { value: "month", label: "This Month" },
];

function getDateRange(preset: string): { dateFrom?: string } {
  if (!preset) return {};
  const now = new Date();
  const start = new Date(now); start.setHours(0, 0, 0, 0);
  if (preset === "today") return { dateFrom: start.toISOString() };
  if (preset === "week")  { const d = new Date(start); d.setDate(d.getDate() - 7);   return { dateFrom: d.toISOString() }; }
  if (preset === "month") { const d = new Date(start); d.setMonth(d.getMonth() - 1); return { dateFrom: d.toISOString() }; }
  return {};
}

interface ReferralCodeRow extends ReferralCodeStat {
  conversionRate: number;
}

function ReferralLinksPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const datePreset = searchParams.get("datePreset") ?? "";

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

  const { data: stats, isLoading } = useReferralLinkStats(getDateRange(datePreset));

  const conversionRate =
    stats && stats.totalClicks > 0 ? (stats.totalRegistrations / stats.totalClicks) * 100 : 0;

  const rows: ReferralCodeRow[] = useMemo(
    () =>
      (stats?.byCode ?? []).map((row) => ({
        ...row,
        conversionRate: row.clicks > 0 ? (row.registrations / row.clicks) * 100 : 0,
      })),
    [stats]
  );

  const columns: Column<ReferralCodeRow>[] = [
    { key: "referralCode", header: "Referral Code", sortable: true },
    { key: "clicks", header: "Clicks", sortable: true, align: "right" },
    { key: "installs", header: "Installs", sortable: true, align: "right" },
    { key: "registrations", header: "Registrations", sortable: true, align: "right" },
    {
      key: "conversionRate",
      header: "Conversion %",
      sortable: true,
      align: "right",
      render: (value) => `${(value as number).toFixed(1)}%`,
    },
  ];

  return (
    <div className="space-y-6 max-w-[1400px]">
      <motion.div custom={0} variants={sectionVariants} initial="hidden" animate="visible">
        <PageHeader
          title="Referral Link Performance"
          subtitle="Click → install → registration funnel for shared referral links"
        />
      </motion.div>

      <motion.div
        custom={1}
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard
              index={0}
              label="Total Clicks"
              value={(stats?.totalClicks ?? 0).toLocaleString("en-IN")}
              icon={<MousePointerClick size={16} />}
              accentColor="purple"
            />
            <StatCard
              index={1}
              label="Total Installs"
              value={(stats?.totalInstalls ?? 0).toLocaleString("en-IN")}
              icon={<Download size={16} />}
              accentColor="orange"
            />
            <StatCard
              index={2}
              label="Total Registrations"
              value={(stats?.totalRegistrations ?? 0).toLocaleString("en-IN")}
              icon={<UserPlus size={16} />}
              accentColor="green"
            />
            <StatCard
              index={3}
              label="Conversion Rate"
              value={`${conversionRate.toFixed(1)}%`}
              subtext="registrations / clicks"
              icon={<Percent size={16} />}
              accentColor="purple"
            />
          </>
        )}
      </motion.div>

      <motion.div
        custom={2}
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        className="flex items-center justify-between"
      >
        <h2 className="font-semibold text-[15px] text-light-text dark:text-dark-text">
          By Referral Code
        </h2>
        <FilterSelect
          value={datePreset}
          onChange={(v) => updateParams({ datePreset: v })}
          options={DATE_PRESET_OPTIONS}
          placeholder="All Time"
          className="w-40"
        />
      </motion.div>

      <motion.div custom={3} variants={sectionVariants} initial="hidden" animate="visible">
        <DataTable
          columns={columns}
          data={rows}
          isLoading={isLoading}
          rowKey="referralCode"
          pageSize={15}
          emptyMessage="No referral link activity found"
          emptyDescription="No clicks recorded for this period yet"
        />
      </motion.div>
    </div>
  );
}

export default function ReferralLinksPage() {
  return (
    <Suspense fallback={null}>
      <ReferralLinksPageContent />
    </Suspense>
  );
}
