"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  icon?: React.ReactNode;
  accentColor?: "purple" | "green" | "orange" | "red";
  index?: number;
  onClick?: () => void;
}

const accentMap = {
  purple: {
    icon: "bg-brand-purple-muted dark:bg-brand-purple-muted-dark text-brand-purple",
    glow: "group-hover:shadow-purple-glow",
  },
  green: {
    icon: "bg-green-50 dark:bg-brand-green-muted text-green-600 dark:text-brand-green",
    glow: "group-hover:shadow-[0_0_20px_rgba(2,230,66,0.1)]",
  },
  orange: {
    icon: "bg-orange-50 dark:bg-brand-orange-muted text-orange-600 dark:text-brand-orange",
    glow: "",
  },
  red: {
    icon: "bg-red-50 dark:bg-brand-red-muted text-red-600 dark:text-brand-red",
    glow: "",
  },
};

export function StatCard({
  label,
  value,
  subtext,
  trend,
  trendValue,
  icon,
  accentColor = "purple",
  index = 0,
  onClick,
}: StatCardProps) {
  const accent = accentMap[accentColor];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.07,
        duration: 0.4,
      }}
      whileHover={{ y: -2 }}
      onClick={onClick}
      className={cn(
        "group card transition-all duration-200",
        "hover:border-light-border-2 dark:hover:border-dark-border-2",
        accent.glow,
        onClick && "cursor-pointer"
      )}
    >
      {/* Top row */}
      <div className="flex items-start justify-between mb-3">
        <p className="text-[13px] font-medium text-light-text-2 dark:text-dark-text-2">
          {label}
        </p>
        {icon && (
          <div
            className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center",
              accent.icon
            )}
          >
            {icon}
          </div>
        )}
      </div>

      {/* Value */}
      <p className="text-2xl font-bold text-light-text dark:text-dark-text tracking-tight mb-1">
        {value}
      </p>

      {/* Trend / Subtext */}
      {(trend || subtext) && (
        <div className="flex items-center gap-1.5 mt-2">
          {trend && trend !== "neutral" && (
            <div
              className={cn(
                "flex items-center gap-0.5 text-[12px] font-medium",
                trend === "up"
                  ? "text-green-600 dark:text-brand-green"
                  : "text-brand-red"
              )}
            >
              {trend === "up" ? (
                <TrendingUp size={13} />
              ) : (
                <TrendingDown size={13} />
              )}
              {trendValue}
            </div>
          )}
          {trend === "neutral" && (
            <Minus size={13} className="text-light-text-3 dark:text-dark-text-3" />
          )}
          {subtext && (
            <span className="text-[12px] text-light-text-3 dark:text-dark-text-3">
              {subtext}
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
}
