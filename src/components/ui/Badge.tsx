import { cn } from "@/lib/utils";

type BadgeVariant =
  | "active"
  | "pending"
  | "suspended"
  | "blocked"
  | "rejected"
  | "approved"
  | "open"
  | "booked"
  | "expired"
  | "cancelled"
  | "processed"
  | "partner"
  | "vendor"
  | "purple"
  | "orange"
  | "green"
  | "red"
  | "gray"
  | "blue";

const variantStyles: Record<BadgeVariant, string> = {
  active: "bg-green-50 text-green-700 dark:bg-brand-green-muted dark:text-brand-green",
  pending: "bg-orange-50 text-orange-700 dark:bg-brand-orange-muted dark:text-brand-orange",
  suspended: "bg-orange-50 text-orange-700 dark:bg-brand-orange-muted dark:text-brand-orange",
  blocked: "bg-red-50 text-red-700 dark:bg-brand-red-muted dark:text-brand-red",
  rejected: "bg-red-50 text-red-700 dark:bg-brand-red-muted dark:text-brand-red",
  approved: "bg-green-50 text-green-700 dark:bg-brand-green-muted dark:text-brand-green",
  open: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  booked: "bg-green-50 text-green-700 dark:bg-brand-green-muted dark:text-brand-green",
  expired: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
  cancelled: "bg-red-50 text-red-700 dark:bg-brand-red-muted dark:text-brand-red",
  processed: "bg-green-50 text-green-700 dark:bg-brand-green-muted dark:text-brand-green",
  partner: "bg-purple-50 text-purple-700 dark:bg-brand-purple-muted-dark dark:text-brand-purple-light",
  vendor: "bg-orange-50 text-orange-700 dark:bg-brand-orange-muted dark:text-brand-orange",
  purple: "bg-purple-50 text-purple-700 dark:bg-brand-purple-muted-dark dark:text-brand-purple-light",
  orange: "bg-orange-50 text-orange-700 dark:bg-brand-orange-muted dark:text-brand-orange",
  green: "bg-green-50 text-green-700 dark:bg-brand-green-muted dark:text-brand-green",
  red: "bg-red-50 text-red-700 dark:bg-brand-red-muted dark:text-brand-red",
  gray: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  blue: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  dot?: boolean;
  pulse?: boolean;
}

export function Badge({
  children,
  variant = "gray",
  className,
  dot = false,
  pulse = false,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "badge",
        variantStyles[variant],
        className
      )}
    >
      {dot && (
        <span
          className={cn(
            "w-1.5 h-1.5 rounded-full shrink-0",
            pulse && "animate-pulse-slow",
            variant === "active" || variant === "approved" || variant === "processed" || variant === "booked"
              ? "bg-brand-green"
              : variant === "pending" || variant === "suspended" || variant === "orange"
              ? "bg-brand-orange"
              : variant === "blocked" || variant === "rejected" || variant === "cancelled" || variant === "red"
              ? "bg-brand-red"
              : "bg-current"
          )}
        />
      )}
      {children}
    </span>
  );
}

// ─── Status Badge Helper ──────────────────────────────────
export function StatusBadge({ status }: { status: string }) {
  const variantMap: Record<string, BadgeVariant> = {
    ACTIVE: "active",
    SUSPENDED: "suspended",
    BLOCKED: "blocked",
    KYC_PENDING: "pending",
    KYC_IN_PROGRESS: "pending",
    KYC_REJECTED: "rejected",
    ONBOARDING: "blue",
    PROFILE_COMPLETE: "purple",
    OPEN: "open",
    BOOKED: "booked",
    EXPIRED: "expired",
    CANCELLED: "cancelled",
    PENDING: "pending",
    PROCESSED: "processed",
    APPROVED: "approved",
    REJECTED: "rejected",
    VEHICLE_OWNER: "partner",
    VENDOR: "vendor",
  };

  const labelMap: Record<string, string> = {
    ACTIVE: "Active",
    SUSPENDED: "Suspended",
    BLOCKED: "Blocked",
    KYC_PENDING: "KYC Pending",
    KYC_IN_PROGRESS: "KYC In Review",
    KYC_REJECTED: "KYC Rejected",
    ONBOARDING: "Onboarding",
    PROFILE_COMPLETE: "Profile Complete",
    OPEN: "Open",
    BOOKED: "Booked",
    EXPIRED: "Expired",
    CANCELLED: "Cancelled",
    PENDING: "Pending",
    PROCESSED: "Processed",
    APPROVED: "Approved",
    REJECTED: "Rejected",
    VEHICLE_OWNER: "Vehicle Owner",
    VENDOR: "Vendor",
  };

  return (
    <Badge variant={variantMap[status] ?? "gray"} dot>
      {labelMap[status] ?? status}
    </Badge>
  );
}
