"use client";

import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterOption {
  value: string;
  label: string;
}

interface FilterSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: FilterOption[];
  placeholder?: string;
  className?: string;
}

export function FilterSelect({
  value,
  onChange,
  options,
  placeholder = "All",
  className,
}: FilterSelectProps) {
  return (
    <div className={cn("relative", className)}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "appearance-none w-full pl-3 pr-8 py-2",
          "text-sm font-medium rounded-xl",
          "bg-white dark:bg-dark-surface",
          "border border-light-border dark:border-dark-border",
          "text-light-text dark:text-dark-text",
          "focus:outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/10",
          "transition-all duration-150 cursor-pointer",
          !value && "text-light-text-2 dark:text-dark-text-2"
        )}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={13}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-light-text-3 dark:text-dark-text-3 pointer-events-none"
      />
    </div>
  );
}
