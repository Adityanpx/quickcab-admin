import apiClient from "./client";
import type { ApiResponse } from "@/types/api";

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  durationDays: number;
  userType: "PARTNER" | "PROVIDER" | "BOTH";
  benefits: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePlanPayload {
  name: string;
  description: string;
  price: number;
  durationDays: number;
  userType: "PARTNER" | "PROVIDER" | "BOTH";
  benefits: string[];
}

export const subscriptionsApi = {
  getPlans: async (): Promise<{
    enabled: boolean;
    plans: SubscriptionPlan[];
  }> => {
    const response = await apiClient.get<
      ApiResponse<{ enabled: boolean; plans: SubscriptionPlan[] }>
    >("/subscriptions/plans");
    return response.data.data;
  },

  createPlan: async (payload: CreatePlanPayload) => {
    const response = await apiClient.post(
      "/admin/subscriptions/plans",
      payload
    );
    return response.data;
  },

  updatePlan: async (id: string, payload: Partial<CreatePlanPayload>) => {
    const response = await apiClient.put(
      `/admin/subscriptions/plans/${id}`,
      payload
    );
    return response.data;
  },

  deletePlan: async (id: string) => {
    const response = await apiClient.delete(
      `/admin/subscriptions/plans/${id}`
    );
    return response.data;
  },

  toggleSubscription: async (
    role: "PARTNER" | "PROVIDER",
    enabled: boolean
  ) => {
    const response = await apiClient.post(
      "/admin/subscriptions/toggle",
      { role, enabled }
    );
    return response.data;
  },
};
