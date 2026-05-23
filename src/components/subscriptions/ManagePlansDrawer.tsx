"use client";

import { useState } from "react";
import { X, Plus, CreditCard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  useSubscriptionPlans,
  useCreatePlan,
  useUpdatePlan,
  useDeletePlan,
  useToggleStatus,
} from "@/lib/hooks/useSubscriptions";
import { PlanCard } from "./PlanCard";
import { PlanModal } from "./PlanModal";
import { RoleToggle } from "./RoleToggle";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { Button } from "@/components/ui/Button";
import { StatCard } from "@/components/ui/StatCard";
import type { SubscriptionPlan, CreatePlanPayload } from "@/lib/api/subscriptions";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function ManagePlansDrawer({ isOpen, onClose }: Props) {
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [editPlan, setEditPlan] = useState<SubscriptionPlan | null>(null);
  const [deletePlan, setDeletePlan] = useState<SubscriptionPlan | null>(null);

  const { data } = useSubscriptionPlans();
  const { data: toggleData } = useToggleStatus();
  const createMutation = useCreatePlan();
  const updateMutation = useUpdatePlan();
  const deleteMutation = useDeletePlan();

  const plans = data?.plans ?? [];
  const partnerEnabled = toggleData?.partner?.enabled ?? false;
  const providerEnabled = toggleData?.serviceProvider?.enabled ?? false;

  const partnerPlans = plans.filter((p) => p.userType === "PARTNER" || p.userType === "BOTH");
  const providerPlans = plans.filter((p) => p.userType === "SERVICE_PROVIDER" || p.userType === "BOTH");

  const handlePlanSubmit = async (formData: CreatePlanPayload & { benefits: string[] }) => {
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
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40"
              onClick={onClose}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="fixed right-0 top-0 h-full w-full max-w-2xl bg-light-surface dark:bg-dark-surface shadow-2xl z-50 flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-light-border dark:border-dark-border">
                <div>
                  <h2 className="text-[16px] font-semibold text-light-text dark:text-dark-text">
                    Manage Plans
                  </h2>
                  <p className="text-[12px] text-light-text-3 dark:text-dark-text-3">
                    Create, edit, or delete subscription plans
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    icon={<Plus size={14} />}
                    onClick={() => { setEditPlan(null); setShowPlanModal(true); }}
                  >
                    New Plan
                  </Button>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-lg hover:bg-light-hover dark:hover:bg-dark-hover text-light-text-3 dark:text-dark-text-3 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <StatCard
                    index={0}
                    label="Total Plans"
                    value={plans.length}
                    icon={<CreditCard size={16} />}
                    accentColor="purple"
                  />
                  <StatCard
                    index={1}
                    label="Active Plans"
                    value={plans.filter((p) => p.isActive).length}
                    accentColor="green"
                  />
                </div>

                {/* Role toggles */}
                <div>
                  <h3 className="text-[13px] font-semibold text-light-text dark:text-dark-text mb-3">
                    Subscription Enforcement
                  </h3>
                  <div className="space-y-2">
                    <RoleToggle
                      role="PARTNER"
                      enabled={partnerEnabled}
                      label="Partner Subscription"
                      description="When ON — Partners must subscribe after OTP login."
                    />
                    <RoleToggle
                      role="SERVICE_PROVIDER"
                      enabled={providerEnabled}
                      label="Provider Subscription"
                      description="When ON — Service Providers must subscribe to remain active."
                    />
                  </div>
                </div>

                {/* Partner plans */}
                {partnerPlans.length > 0 && (
                  <div>
                    <h3 className="text-[13px] font-semibold text-light-text dark:text-dark-text mb-3">
                      Partner Plans ({partnerPlans.length})
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {partnerPlans.map((plan, i) => (
                        <PlanCard
                          key={plan.id}
                          plan={plan}
                          index={i}
                          onEdit={(p) => { setEditPlan(p); setShowPlanModal(true); }}
                          onDelete={setDeletePlan}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Provider plans */}
                {providerPlans.length > 0 && (
                  <div>
                    <h3 className="text-[13px] font-semibold text-light-text dark:text-dark-text mb-3">
                      Provider Plans ({providerPlans.length})
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {providerPlans.map((plan, i) => (
                        <PlanCard
                          key={plan.id}
                          plan={plan}
                          index={i}
                          onEdit={(p) => { setEditPlan(p); setShowPlanModal(true); }}
                          onDelete={setDeletePlan}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {plans.length === 0 && (
                  <div className="text-center py-12 text-[13px] text-light-text-3 dark:text-dark-text-3">
                    No plans yet. Click "New Plan" to create one.
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Modals — rendered outside drawer so z-index stacking works */}
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
    </>
  );
}
