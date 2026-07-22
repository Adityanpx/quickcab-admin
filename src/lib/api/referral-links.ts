import apiClient from "./client";
import type { ApiResponse } from "@/types/api";
import type { ReferralLinkStats } from "@/types/referral-link";

export const referralLinksApi = {
  getStats: async (
    params: { dateFrom?: string; dateTo?: string } = {}
  ): Promise<ReferralLinkStats> => {
    const response = await apiClient.get<ApiResponse<ReferralLinkStats>>(
      "/admin/referral-links/stats",
      { params }
    );
    return response.data.data;
  },
};
