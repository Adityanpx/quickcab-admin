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
      ApiResponse<WithdrawalRequest[]> & { pagination: PaginatedResponse<WithdrawalRequest>["pagination"] }
    >("/admin/wallet/withdrawals", { params });
    return {
      items: response.data.data || [],
      pagination: response.data.pagination,
    };
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
    const response = await apiClient.get<ApiResponse<WalletStats>>(
      "/admin/wallet/stats"
    );
    return response.data.data;
  },
};
