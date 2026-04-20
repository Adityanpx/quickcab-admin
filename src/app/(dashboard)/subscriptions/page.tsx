"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, CreditCard } from "lucide-react";
import {
  useSubscriptionPlans,
  useCreatePlan,
  useUpdatePlan,
  useDeletePlan,
} from "@/lib/hooks/useSubscriptions";
import { PlanCard } from "@/components/subscriptions/PlanCard";
import { PlanModal } from "@/components/subscriptions/PlanModal";
import { RoleToggle } from "@/components/subscriptions/RoleToggle";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { DashboardSkeleton } from "@/components/ui/SkeletonLoader";
import type { SubscriptionPlan, CreatePlanPayload } from "@/lib/api/subscriptions";

const sectionVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

export default function SubscriptionsPage() {
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [editPlan, setEditPlan] = useState<SubscriptionPlan | null>(null);
  const [deletePlan, setDeletePlan] = useState<SubscriptionPlan | null>(null);

  const { data, isLoading, isError } = useSubscriptionPlans();
  const createMutation = useCreatePlan();
  const updateMutation = useUpdatePlan();
  const deleteMutation = useDeletePlan();

  if (isLoading) return <DashboardSkeleton />;
  if (isError) return (
    <div className="flex flex-col items-center justify-center py-24 gap-3">
      <p className="text-[14px] font-medium text-light-text dark:text-dark-text">
        Failed to load subscription plans
      </p>
      <p className="text-[13px] text-light-text-3 dark:text-dark-text-3">
        The server returned an error. Please try refreshing the page.
      </p>
    </div>
  );

  const plans = data?.plans ?? [];
  const partnerEnabled = data?.enabled ?? false;
  const partnerPlans = plans.filter(
    (p) => p.userType === "PARTNER" || p.userType === "BOTH"
  );
  const providerPlans = plans.filter(
    (p) => p.userType === "PROVIDER"
  );

  const handlePlanSubmit = async (
    formData: CreatePlanPayload & { benefits: string[] }
  ) => {
    if (editPlan) {
      await updateMutation.mutateAsync({ id: editPlan.id, payload: formData });
      setEditPlan(null);
    } else {
      await createMutation.mutateAsync(formData);
    }
    setShowPlanModal(false);
  };

  const handleDeleteConfirm = async () => {
    if (!deletePlan) return;
    await deleteMutation.mutateAsync(deletePlan.id);
    setDeletePlan(null);
  };

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Header */}
      <motion.div custom={0} variants={sectionVariants} initial="hidden" animate="visible">
        <PageHeader
          title="Subscriptions"
          subtitle="Manage subscription plans and toggle enforcement per role"
          actions={
            <Button
              variant="primary"
              size="sm"
              icon={<Plus size={14} />}
              onClick={() => { setEditPlan(null); setShowPlanModal(true); }}
            >
              New Plan
            </Button>
          }
        />
      </motion.div>

      {/* Stats */}
      <motion.div
        custom={1}
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <StatCard index={0} label="Total Plans" value={plans.length} icon={<CreditCard size={16} />} accentColor="purple" />
        <StatCard index={1} label="Partner Plans" value={partnerPlans.length} accentColor="purple" />
        <StatCard index={2} label="Provider Plans" value={providerPlans.length} accentColor="green" />
        <StatCard index={3} label="Active Plans" value={plans.filter((p) => p.isActive).length} accentColor="green" />
      </motion.div>

      {/* Role Toggles */}
      <motion.div custom={2} variants={sectionVariants} initial="hidden" animate="visible">
        <h2 className="font-semibold text-[15px] text-light-text dark:text-dark-text mb-3">
          Subscription Enforcement
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <RoleToggle
            role="PARTNER"
            enabled={partnerEnabled}
            label="Partner Subscription"
            description="When ON — new Partners must subscribe after OTP login. Existing Partners get 3-day grace period."
          />
          <RoleToggle
            role="PROVIDER"
            enabled={false}
            label="Provider Subscription"
            description="When ON — Service Providers must subscribe to remain active on the platform."
          />
        </div>
      </motion.div>

      {/* Plans grid */}
      {plans.length > 0 && (
        <motion.div custom={3} variants={sectionVariants} initial="hidden" animate="visible">
          <h2 className="font-semibold text-[15px] text-light-text dark:text-dark-text mb-3">
            All Plans ({plans.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {plans.map((plan, i) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                index={i}
                onEdit={(p) => { setEditPlan(p); setShowPlanModal(true); }}
                onDelete={setDeletePlan}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* Modals */}
      <PlanModal
        isOpen={showPlanModal}
        onClose={() => { setShowPlanModal(false); setEditPlan(null); }}
        onSubmit={handlePlanSubmit}
        editPlan={editPlan}
        loading={createMutation.isPending || updateMutation.isPending}
      />

      <ConfirmModal
        isOpen={!!deletePlan}
        onClose={() => setDeletePlan(null)}
        onConfirm={handleDeleteConfirm}
        title={`Delete "${deletePlan?.name}"?`}
        description="This plan will be permanently deleted. Existing subscribers will not be affected until their current plan expires."
        confirmLabel="Delete Plan"
        variant="danger"
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
