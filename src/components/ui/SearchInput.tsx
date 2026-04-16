"use client";

import { useState, useCallback, useEffect } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/lib/hooks/useDebounce";

interface SearchInputProps {
  placeholder?: string;
  onSearch: (value: string) => void;
  defaultValue?: string;
  className?: string;
  debounceMs?: number;
}

export function SearchInput({
  placeholder = "Search...",
  onSearch,
  defaultValue = "",
  className,
  debounceMs = 400,
}: SearchInputProps) {
  const [value, setValue] = useState(defaultValue);
  const debouncedValue = useDebounce(value, debounceMs);

  useEffect(() => {
    onSearch(debouncedValue);
  }, [debouncedValue, onSearch]);

  const handleClear = useCallback(() => {
    setValue("");
    onSearch("");
  }, [onSearch]);

  return (
    <div className={cn("relative", className)}>
      <Search
        size={15}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-light-text-3 dark:text-dark-text-3 pointer-events-none"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "input-base pl-9",
          value && "pr-9"
        )}
      />
      {value && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-light-text-3 dark:text-dark-text-3 hover:text-light-text dark:hover:text-dark-text transition-colors"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
