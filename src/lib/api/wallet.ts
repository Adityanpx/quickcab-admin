import apiClient from "./client";
import type { ApiResponse, PaginatedResponse } from "@/types/api";
import type {
  WithdrawalRequest,
  ManualAdjustPayload,
  WalletStats,
} from "@/types/wallet";

export const walletApi = {
  getWithdrawals: async (params: {
    status?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<PaginatedResponse<WithdrawalRequest>> => {
    const response = await apiClient.get<
      ApiResponse<PaginatedResponse<WithdrawalRequest>>
    >("/admin/wallet/withdrawals", { params });
    return response.data.data;
  },

  approveWithdrawal: async (id: string) => {
    const response = await apiClient.post(
      `/admin/wallet/withdrawals/${id}/approve`
    );
    return response.data;
  },

  rejectWithdrawal: async (id: string, reason: string) => {
    const response = await apiClient.post(
      `/admin/wallet/withdrawals/${id}/reject`,
      { reason }
    );
    return response.data;
  },

  manualAdjust: async (payload: ManualAdjustPayload) => {
    const { userId, ...body } = payload;
    const response = await apiClient.post(
      `/admin/wallet/${userId}/adjust`,
      body
    );
    return response.data;
  },

  getStats: async (): Promise<WalletStats> => {
    try {
      const response = await apiClient.get<ApiResponse<WalletStats>>(
        "/admin/wallet/stats"
      );
      return response.data.data;
    } catch (error: any) {
      // 404 = endpoint not yet implemented on backend
      // Return zeros so WalletStats renders gracefully instead of crashing
      if (error?.response?.status === 404) {
        return {
          totalCoinsInCirculation: 0,
          totalWithdrawnINR: 0,
          pendingWithdrawalCount: 0,
          pendingWithdrawalAmount: 0,
        };
      }
      throw error;
    }
  },
};
