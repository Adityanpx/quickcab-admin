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
  generatedAt: string;
}

export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await apiClient.get<ApiResponse<DashboardStats>>(
      "/admin/dashboard/stats"
    );
    return response.data.data;
  },
};
