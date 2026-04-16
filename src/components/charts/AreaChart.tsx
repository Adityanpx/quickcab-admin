"use client";

import {
  AreaChart as ReAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useTheme } from "next-themes";

interface AreaChartProps {
  data: { label: string; value: number }[];
  height?: number;
  color?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-xl px-3 py-2 shadow-lg text-sm">
      <p className="text-light-text-2 dark:text-dark-text-2 text-[12px] mb-0.5">{label}</p>
      <p className="font-semibold text-light-text dark:text-dark-text">
        {payload[0].value} bookings
      </p>
    </div>
  );
}

export function AreaChart({ data, height = 220, color = "#5E5CE6" }: AreaChartProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const gridColor = isDark ? "#2A2D3A" : "#E5E7EB";
  const textColor = isDark ? "#8B8FA8" : "#9CA3AF";

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ReAreaChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: -20 }}>
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={isDark ? 0.25 : 0.18} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke={gridColor}
          vertical={false}
        />
        <XAxis
          dataKey="label"
          tick={{ fill: textColor, fontSize: 11, fontFamily: "Outfit" }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fill: textColor, fontSize: 11, fontFamily: "Outfit" }}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
        />
        <Tooltip
          content={<CustomTooltip />}
          cursor={{ stroke: color, strokeWidth: 1, strokeDasharray: "4 4" }}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          fill="url(#areaGradient)"
          dot={false}
          activeDot={{ r: 4, fill: color, strokeWidth: 0 }}
        />
      </ReAreaChart>
    </ResponsiveContainer>
  );
}
