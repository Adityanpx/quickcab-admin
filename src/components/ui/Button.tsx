"use client";

import { forwardRef } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "danger"
  | "success"
  | "outline";
type ButtonSize = "xs" | "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-brand-purple text-white hover:bg-brand-purple-dark shadow-purple-glow active:scale-[0.98]",
  secondary:
    "bg-light-surface-2 dark:bg-dark-surface text-light-text dark:text-dark-text hover:bg-light-border dark:hover:bg-dark-border active:scale-[0.98]",
  ghost:
    "text-light-text-2 dark:text-dark-text-2 hover:bg-light-surface-2 dark:hover:bg-dark-surface active:scale-[0.98]",
  danger:
    "bg-brand-red-muted text-brand-red hover:bg-red-100 dark:hover:bg-red-950 border border-brand-red/20 active:scale-[0.98]",
  success:
    "bg-brand-green-muted text-brand-green hover:bg-green-100 dark:hover:bg-green-950 border border-brand-green/20 active:scale-[0.98]",
  outline:
    "border border-light-border dark:border-dark-border text-light-text dark:text-dark-text hover:bg-light-surface-2 dark:hover:bg-dark-surface active:scale-[0.98]",
};

const sizeStyles: Record<ButtonSize, string> = {
  xs: "px-2.5 py-1 text-[11px] rounded-lg gap-1",
  sm: "px-3 py-1.5 text-xs rounded-lg gap-1.5",
  md: "px-4 py-2 text-sm rounded-xl gap-2",
  lg: "px-5 py-2.5 text-[15px] rounded-xl gap-2",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      icon,
      iconRight,
      children,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center font-medium",
          "transition-all duration-150",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "focus:outline-none focus:ring-2 focus:ring-brand-purple/30",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {loading ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          icon && <span className="shrink-0">{icon}</span>
        )}
        {children}
        {!loading && iconRight && (
          <span className="shrink-0">{iconRight}</span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
