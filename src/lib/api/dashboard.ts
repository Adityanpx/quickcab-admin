import apiClient from "./client";
import type { ApiResponse } from "@/types/api";

export interface DashboardStats {
  partners: {
    total: number;
    active: number;
    pendingKyc: number;
    suspended: number;
    blocked: number;
    vehicleOwners: number;
    vendors: number;
  };
  bookings: {
    today: number;
    total: number;
    open: number;
    booked: number;
    expired: number;
    cancelled: number;
  };
  wallet: {
    pendingWithdrawals: number;
    pendingWithdrawalAmount: number;
  };
  ratings: {
    flagged: number;
  };
  kyc: {
    pendingTotal: number;
    approvedToday: number;
    rejectedToday: number;
  };
  generatedAt: string;
  onlineUsersCount: number;
}

// ─── SubAdmin Types ───────────────────────────────────────────────────────────

export interface SubAdminLog {
  id: string;
  subAdminName: string;
  action: string;
  targetType: string;   // "USER" | "BOOKING" | "KYC"
  targetId: string;
  targetName: string | null;
  reason: string | null;
  ipAddress: string | null;
  createdAt: string;
}

export interface SubAdminLogsResponse {
  items: SubAdminLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface SubAdminCredentialsInfo {
  username: string;
  isActive: boolean;
}

export interface SubAdminSummaryItem {
  name: string;
  totalActions: number;
  lastActiveAt: string | null;
  restriction: { status: string; reason: string } | null;
  breakdown: Record<string, number>;
}

export interface SubAdminRestriction {
  id: string;
  name: string;
  status: string;
  reason: string;
  isActive: boolean;
  restrictedAt: string;
  liftedAt: string | null;
}

export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await apiClient.get<ApiResponse<DashboardStats>>(
      "/admin/dashboard/stats"
    );
    return response.data.data;
  },

  getAdminNotifications: async (): Promise<{
    notifications: {
      id: string;
      type: string;
      title: string;
      message: string;
      count: number;
      link: string;
      severity: "info" | "warning" | "critical";
    }[];
    totalUnread: number;
  }> => {
    const response = await apiClient.get("/admin/notifications");
    return response.data.data;
  },

  // ─── SubAdmin Logs ────────────────────────────────────────────────────────

  getSubAdminLogs: async (params: {
    page?: number;
    limit?: number;
    subAdminName?: string;
    action?: string;
    targetType?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<SubAdminLogsResponse> => {
    const response = await apiClient.get("/admin/subadmin/logs", { params });
    return {
      items: response.data.data || [],
      pagination: response.data.pagination,
    };
  },

  getSubAdminNames: async (): Promise<string[]> => {
    const response = await apiClient.get("/admin/subadmin/names");
    return response.data.data || [];
  },

  // ─── SubAdmin Settings ────────────────────────────────────────────────────

  getSubAdminCredentials: async (): Promise<SubAdminCredentialsInfo | null> => {
    const response = await apiClient.get("/admin/subadmin/credentials");
    return response.data.data ?? null;
  },

  changeSubAdminPassword: async (newPassword: string): Promise<void> => {
    await apiClient.patch("/admin/subadmin/password", { newPassword });
  },

  changeSubAdminUsername: async (newUsername: string): Promise<void> => {
    await apiClient.patch("/admin/subadmin/username", { newUsername });
  },

  toggleSubAdminAccess: async (isActive: boolean): Promise<void> => {
    await apiClient.patch("/admin/subadmin/toggle-access", { isActive });
  },

  getSubAdminSummary: async (): Promise<SubAdminSummaryItem[]> => {
    const response = await apiClient.get("/admin/subadmin/summary");
    return response.data.data || [];
  },

  restrictSubAdmin: async (
    name: string,
    status: "SUSPENDED" | "BLOCKED",
    reason: string
  ): Promise<void> => {
    await apiClient.post("/admin/subadmin/restrict", { name, status, reason });
  },

  unrestrictSubAdmin: async (name: string): Promise<void> => {
    await apiClient.post("/admin/subadmin/unrestrict", { name });
  },

  getSubAdminRestrictions: async (): Promise<SubAdminRestriction[]> => {
    const response = await apiClient.get("/admin/subadmin/restrictions");
    return response.data.data || [];
  },
};
