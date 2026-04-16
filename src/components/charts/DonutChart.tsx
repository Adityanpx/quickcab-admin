"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface DonutSlice {
  name: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: DonutSlice[];
  centerLabel?: string;
  centerSub?: string;
  height?: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: { name: string; value: number }[];
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-xl px-3 py-2 shadow-lg text-sm">
      <p className="font-semibold text-light-text dark:text-dark-text">
        {payload[0].name}
      </p>
      <p className="text-light-text-2 dark:text-dark-text-2 text-[12px]">
        {payload[0].value}%
      </p>
    </div>
  );
}

export function DonutChart({ data, centerLabel, centerSub, height = 180 }: DonutChartProps) {
  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={height * 0.28}
            outerRadius={height * 0.42}
            paddingAngle={3}
            dataKey="value"
            strokeWidth={0}
            animationBegin={0}
            animationDuration={800}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Center Label */}
      {centerLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <p className="text-lg font-bold text-light-text dark:text-dark-text leading-tight">
            {centerLabel}
          </p>
          {centerSub && (
            <p className="text-[11px] text-light-text-2 dark:text-dark-text-2">
              {centerSub}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
