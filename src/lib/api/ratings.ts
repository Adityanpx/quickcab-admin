import apiClient from "./client";
import type { ApiResponse, PaginatedResponse } from "@/types/api";

export interface Rating {
  id: string;
  stars: number;
  tags: string[];
  comment: string | null;
  phase: number;
  isFlagged: boolean;
  isRemoved: boolean;
  flagReason: string | null;
  isBlind: boolean;
  bothSubmitted: boolean;
  windowExpiresAt: string | null;
  createdAt: string;
  ratedBy: { id: string; name: string; mobile: string };
  ratedTo: { id: string; name: string; mobile: string };
  booking: { id: string; pickupCity: string; dropCity: string } | null;
}

export const ratingsApi = {
  getAll: async (params: {
    page?: number;
    limit?: number;
    isFlagged?: string;
    isRemoved?: string;
    minStars?: number;
    maxStars?: number;
  } = {}): Promise<PaginatedResponse<Rating>> => {
    const response = await apiClient.get<
      ApiResponse<Rating[]> & { pagination: PaginatedResponse<Rating>["pagination"] }
    >("/admin/ratings", { params });

    const records = response.data.data;
    const pagination = response.data.pagination;

    return { items: records || [], pagination };
  },

  remove: async (id: string, reason: string) => {
    const response = await apiClient.post(`/admin/ratings/${id}/remove`, { reason });
    return response.data;
  },
};
