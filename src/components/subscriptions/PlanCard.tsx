"use client";

import { motion } from "framer-motion";
import { Edit2, Trash2, Check, Users, Wrench } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import type { SubscriptionPlan } from "@/lib/api/subscriptions";
import { useUpdatePlan } from "@/lib/hooks/useSubscriptions";
import toast from "react-hot-toast";

interface PlanCardProps {
  plan: SubscriptionPlan;
  onEdit: (plan: SubscriptionPlan) => void;
  onDelete: (plan: SubscriptionPlan) => void;
  index?: number;
}

const USER_TYPE_CONFIG = {
  PARTNER: {
    icon: Users,
    label: "Partners",
    color: "purple" as const,
  },
  SERVICE_PROVIDER: {
    icon: Wrench,
    label: "Service Providers",
    color: "blue" as const,
  },
  BOTH: {
    icon: Users,
    label: "All Users",
    color: "green" as const,
  },
};

export function PlanCard({ plan, onEdit, onDelete, index = 0 }: PlanCardProps) {
  const config = USER_TYPE_CONFIG[plan.userType] ?? USER_TYPE_CONFIG.PARTNER;
  const Icon = config.icon;
  const updatePlanMutation = useUpdatePlan();

  const isYearly = plan.durationDays >= 300;

  const handleToggleActive = () => {
    updatePlanMutation.mutate(
      { id: plan.id, payload: { isActive: !plan.isActive } },
      {
        onSuccess: () => {
          toast.success(plan.isActive ? "Plan deactivated" : "Plan activated");
        },
      }
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.08,
        duration: 0.35,
        ease: [0.25, 0.46, 0.45, 0.94] as any,
      }}
      className={cn(
        "card relative overflow-hidden transition-all duration-200",
        "hover:border-brand-purple/30 hover:shadow-purple-glow group",
        !plan.isActive && "opacity-60"
      )}
    >
      {/* Yearly ribbon */}
      {isYearly && (
        <div className="absolute top-3 right-3">
          <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-brand-green text-white">
            BEST VALUE
          </span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div
          className={cn(
            "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
            "bg-brand-purple-muted dark:bg-brand-purple-muted-dark text-brand-purple"
          )}
        >
          <Icon size={17} />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-[15px] text-light-text dark:text-dark-text truncate">
            {plan.name}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={config.color}>{config.label}</Badge>
            <Badge variant={plan.isActive ? "active" : "gray"}>
              {plan.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
        </div>
      </div>

      {/* Price */}
      <div className="mb-4">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-black text-light-text dark:text-dark-text">
            ₹{plan.price.toLocaleString("en-IN")}
          </span>
          <span className="text-[13px] text-light-text-3 dark:text-dark-text-3">
            / {plan.durationDays} days
          </span>
        </div>
        <p className="text-[12px] text-light-text-2 dark:text-dark-text-2 mt-1">
          {plan.description}
        </p>
      </div>

      {/* Benefits */}
      {plan.benefits.length > 0 && (
        <ul className="space-y-1.5 mb-5">
          {plan.benefits.map((benefit, i) => (
            <li key={i} className="flex items-start gap-2">
              <div className="w-4 h-4 rounded-full bg-brand-green/20 flex items-center justify-center shrink-0 mt-0.5">
                <Check size={10} className="text-brand-green" />
              </div>
              <span className="text-[12px] text-light-text-2 dark:text-dark-text-2">
                {benefit}
              </span>
            </li>
          ))}
        </ul>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-3 border-t border-light-border dark:border-dark-border">
        <Button
          variant="outline"
          size="xs"
          icon={<Edit2 size={12} />}
          onClick={() => onEdit(plan)}
          className="flex-1"
        >
          Edit Plan
        </Button>
        <Button
          variant="outline"
          size="xs"
          onClick={handleToggleActive}
          loading={updatePlanMutation.isPending}
          className={
            plan.isActive
              ? "text-brand-orange border-brand-orange/30"
              : "text-brand-green border-brand-green/30"
          }
        >
          {plan.isActive ? "Deactivate" : "Activate"}
        </Button>
        <Button
          variant="danger"
          size="xs"
          icon={<Trash2 size={12} />}
          onClick={() => onDelete(plan)}
        >
          Delete
        </Button>
      </div>
    </motion.div>
  );
}
