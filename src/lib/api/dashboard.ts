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
  };
  wallet: {
    pendingWithdrawals: number;
    pendingAmount: number;
    totalPaidOut: number;
  };
  cachedAt: string;
}

export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await apiClient.get<ApiResponse<DashboardStats>>(
      "/admin/dashboard/stats"
    );
    return response.data.data;
  },
};
