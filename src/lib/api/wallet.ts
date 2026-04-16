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
    const response = await apiClient.post(
      "/admin/wallet/adjust",
      payload
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
