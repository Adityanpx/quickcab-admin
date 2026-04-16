"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { AreaChart } from "@/components/charts/AreaChart";
import { cn } from "@/lib/utils";

type Period = "today" | "week" | "month";

// Mock data — replace with real API call in future
const mockData: Record<Period, { label: string; value: number }[]> = {
  today: [
    { label: "6am", value: 4 },
    { label: "9am", value: 12 },
    { label: "12pm", value: 28 },
    { label: "3pm", value: 22 },
    { label: "6pm", value: 35 },
    { label: "9pm", value: 18 },
    { label: "Now", value: 8 },
  ],
  week: [
    { label: "Mon", value: 42 },
    { label: "Tue", value: 68 },
    { label: "Wed", value: 55 },
    { label: "Thu", value: 80 },
    { label: "Fri", value: 92 },
    { label: "Sat", value: 74 },
    { label: "Sun", value: 38 },
  ],
  month: [
    { label: "W1", value: 280 },
    { label: "W2", value: 350 },
    { label: "W3", value: 310 },
    { label: "W4", value: 420 },
  ],
};

const periods: { key: Period; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "week", label: "Week" },
  { key: "month", label: "Month" },
];

export function LeadActivityChart() {
  const [period, setPeriod] = useState<Period>("week");

  const total = mockData[period].reduce((s, d) => s + d.value, 0);

  return (
    <div className="card">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <div>
          <h3 className="font-semibold text-[15px] text-light-text dark:text-dark-text">
            B2B Lead Activity
          </h3>
          <p className="text-[12px] text-light-text-3 dark:text-dark-text-3 mt-0.5">
            {total} leads{" "}
            <span className="text-brand-purple font-medium">
              this {period === "today" ? "day" : period}
            </span>
          </p>
        </div>

        {/* Period Toggle */}
        <div className="flex items-center gap-1 p-0.5 bg-light-surface-2 dark:bg-dark-surface rounded-xl">
          {periods.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setPeriod(key)}
              className={cn(
                "relative px-3.5 py-1.5 rounded-lg text-[12px] font-medium transition-all duration-200",
                period === key
                  ? "text-white"
                  : "text-light-text-2 dark:text-dark-text-2 hover:text-light-text dark:hover:text-dark-text"
              )}
            >
              {period === key && (
                <motion.div
                  layoutId="periodActive"
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
        <AreaChart data={mockData[period]} height={220} />
      </div>
    </div>
  );
}
