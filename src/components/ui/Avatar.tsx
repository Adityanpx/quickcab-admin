import { cn } from "@/lib/utils";
import { getInitials } from "@/lib/utils";

// Deterministic color assignment based on name
const AVATAR_COLORS = [
  "bg-purple-100 text-purple-700 dark:bg-brand-purple-muted-dark dark:text-brand-purple-light",
  "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  "bg-green-100 text-green-700 dark:bg-brand-green-muted dark:text-brand-green",
  "bg-orange-100 text-orange-700 dark:bg-brand-orange-muted dark:text-brand-orange",
  "bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300",
  "bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300",
];

function getAvatarColor(name: string): string {
  const index =
    name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
    AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

interface AvatarProps {
  name: string;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
  src?: string;
}

const sizeClasses = {
  xs: "w-6 h-6 text-[9px]",
  sm: "w-8 h-8 text-[11px]",
  md: "w-10 h-10 text-[13px]",
  lg: "w-12 h-12 text-[15px]",
};

export function Avatar({ name, size = "sm", className, src }: AvatarProps) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name}
        className={cn(
          sizeClasses[size],
          "rounded-full object-cover shrink-0",
          className
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        sizeClasses[size],
        "rounded-full flex items-center justify-center font-bold shrink-0",
        getAvatarColor(name),
        className
      )}
      title={name}
    >
      {getInitials(name)}
    </div>
  );
}
