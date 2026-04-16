import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow } from "date-fns";

// ─── Class Merging ────────────────────────────────────────
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Date Formatting ──────────────────────────────────────
export function formatDate(date: string | Date): string {
  return format(new Date(date), "dd MMM yyyy");
}

export function formatDateTime(date: string | Date): string {
  return format(new Date(date), "dd MMM yyyy, hh:mm a");
}

export function formatRelative(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

// ─── Currency ─────────────────────────────────────────────
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCoins(coins: number): string {
  return new Intl.NumberFormat("en-IN").format(coins);
}

// ─── Status Colors ────────────────────────────────────────
export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    ACTIVE: "bg-green-muted text-green-700 dark:text-brand-green dark:bg-brand-green-muted",
    SUSPENDED: "bg-orange-muted text-orange-700 dark:text-brand-orange dark:bg-brand-orange-muted",
    BLOCKED: "bg-red-muted text-red-700 dark:text-brand-red dark:bg-brand-red-muted",
    PENDING: "bg-orange-muted text-orange-700 dark:text-brand-orange dark:bg-brand-orange-muted",
    KYC_PENDING: "bg-orange-muted text-orange-700 dark:text-brand-orange dark:bg-brand-orange-muted",
    KYC_REJECTED: "bg-red-muted text-red-700 dark:text-brand-red dark:bg-brand-red-muted",
    APPROVED: "bg-green-muted text-green-700 dark:text-brand-green dark:bg-brand-green-muted",
    PROCESSED: "bg-green-muted text-green-700 dark:text-brand-green dark:bg-brand-green-muted",
    REJECTED: "bg-red-muted text-red-700 dark:text-brand-red dark:bg-brand-red-muted",
    OPEN: "bg-blue-50 text-blue-700 dark:text-blue-300 dark:bg-blue-950",
    BOOKED: "bg-green-muted text-green-700 dark:text-brand-green dark:bg-brand-green-muted",
    EXPIRED: "bg-gray-100 text-gray-600 dark:text-gray-400 dark:bg-gray-800",
    CANCELLED: "bg-red-muted text-red-700 dark:text-brand-red dark:bg-brand-red-muted",
    ONBOARDING: "bg-blue-50 text-blue-700 dark:text-blue-300 dark:bg-blue-950",
    PROFILE_COMPLETE: "bg-purple-50 text-purple-700 dark:text-brand-purple-light dark:bg-brand-purple-muted-dark",
  };
  return map[status] ?? "bg-gray-100 text-gray-600";
}

// ─── Initials ─────────────────────────────────────────────
export function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

// ─── Truncate ─────────────────────────────────────────────
export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

// ─── Debounce ─────────────────────────────────────────────
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
