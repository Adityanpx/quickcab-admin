import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  subscriptionsApi,
  type CreatePlanPayload,
  type UpdatePlanPayload,
} from "@/lib/api/subscriptions";
import toast from "react-hot-toast";

export function useSubscriptionPlans() {
  return useQuery({
    queryKey: ["subscriptions", "plans"],
    queryFn: subscriptionsApi.getAllPlans,
    staleTime: 60 * 1000,
  });
}

export function useToggleStatus() {
  return useQuery({
    queryKey: ["subscriptions", "toggleStatus"],
    queryFn: subscriptionsApi.getToggleStatus,
    staleTime: 30 * 1000,
  });
}

export function useCreatePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePlanPayload) =>
      subscriptionsApi.createPlan(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["subscriptions", "plans"] });
      toast.success("Plan created successfully");
    },
    onError: () => toast.error("Failed to create plan"),
  });
}

export function useUpdatePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdatePlanPayload;
    }) => subscriptionsApi.updatePlan(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["subscriptions", "plans"] });
      toast.success("Plan updated");
    },
    onError: () => toast.error("Failed to update plan"),
  });
}

export function useDeletePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => subscriptionsApi.deletePlan(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["subscriptions", "plans"] });
      toast.success("Plan deleted");
    },
    onError: () => toast.error("Failed to delete plan"),
  });
}

export function useToggleSubscription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      userType,
      enabled,
    }: {
      userType: "PARTNER" | "SERVICE_PROVIDER";
      enabled: boolean;
    }) => subscriptionsApi.toggleSubscription(userType, enabled),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["subscriptions", "plans"] });
      qc.invalidateQueries({ queryKey: ["subscriptions", "toggleStatus"] });
      toast.success(
        `Subscription ${vars.enabled ? "enabled" : "disabled"} for ${vars.userType === "PARTNER" ? "Partners" : "Service Providers"}`
      );
    },
    onError: () => toast.error("Failed to toggle subscription"),
  });
}
