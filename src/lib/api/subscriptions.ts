import apiClient from "./client";
import type { ApiResponse } from "@/types/api";

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  durationDays: number;
  userType: "PARTNER" | "SERVICE_PROVIDER" | "BOTH";
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
  userType: "PARTNER" | "SERVICE_PROVIDER" | "BOTH";
  benefits: string[];
}

export interface UpdatePlanPayload {
  name?: string;
  description?: string;
  price?: number;
  durationDays?: number;
  userType?: "PARTNER" | "SERVICE_PROVIDER" | "BOTH";
  benefits?: string[];
  isActive?: boolean;
}

export interface Subscriber {
  id: string;
  status: "ACTIVE" | "EXPIRED" | "CANCELLED";
  startDate: string;
  endDate: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    mobile: string;
    role: "PARTNER" | "SERVICE_PROVIDER";
  };
  plan: {
    id: string;
    name: string;
    price: number;
    durationDays: number;
  };
}

export interface SubscriberFilters {
  status?: "ACTIVE" | "EXPIRED" | "CANCELLED";
  planId?: string;
  role?: "PARTNER" | "SERVICE_PROVIDER";
  page?: number;
  limit?: number;
}

export const subscriptionsApi = {
  getAllPlans: async (): Promise<{ plans: SubscriptionPlan[] }> => {
    const response = await apiClient.get<
      ApiResponse<SubscriptionPlan[]> & { pagination: any }
    >("/subscriptions/admin/plans", {
      params: { limit: 100 },
    });
    return {
      plans: response.data.data || [],
    };
  },

  createPlan: async (payload: CreatePlanPayload) => {
    const response = await apiClient.post("/subscriptions/admin/plans", payload);
    return response.data;
  },

  updatePlan: async (id: string, payload: UpdatePlanPayload) => {
    const response = await apiClient.put(`/subscriptions/admin/plans/${id}`, payload);
    return response.data;
  },

  deletePlan: async (id: string) => {
    const response = await apiClient.delete(`/subscriptions/admin/plans/${id}`);
    return response.data;
  },

  toggleSubscription: async (
    userType: "PARTNER" | "SERVICE_PROVIDER",
    enabled: boolean
  ) => {
    const response = await apiClient.post("/subscriptions/admin/toggle", {
      userType,
      enabled,
    });
    return response.data;
  },

  getToggleStatus: async (): Promise<{
    partner: { enabled: boolean };
    serviceProvider: { enabled: boolean };
  }> => {
    const response = await apiClient.get<
      ApiResponse<{
        partner: { enabled: boolean };
        serviceProvider: { enabled: boolean };
      }>
    >("/subscriptions/admin/toggle");
    return response.data.data;
  },

  getSubscribers: async (
    filters: SubscriberFilters = {}
  ): Promise<{
    items: Subscriber[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  }> => {
    const { role, ...rest } = filters;
    const response = await apiClient.get("/subscriptions/admin/subscriptions", {
      params: { ...rest, limit: rest.limit ?? 15 },
    });
    const items: Subscriber[] = response.data.data ?? [];
    const filtered = role ? items.filter((s) => s.user.role === role) : items;
    return {
      items: filtered,
      pagination: response.data.pagination,
    };
  },
};
