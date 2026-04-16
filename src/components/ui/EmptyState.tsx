import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex flex-col items-center justify-center py-16 px-8 text-center",
        className
      )}
    >
      {icon && (
        <div className="w-12 h-12 rounded-2xl bg-light-surface-2 dark:bg-dark-surface flex items-center justify-center mb-4 text-light-text-3 dark:text-dark-text-3">
          {icon}
        </div>
      )}
      <p className="font-semibold text-light-text dark:text-dark-text mb-1">
        {title}
      </p>
      {description && (
        <p className="text-sm text-light-text-2 dark:text-dark-text-2 max-w-xs">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </motion.div>
  );
}
