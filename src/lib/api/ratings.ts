import apiClient from "./client";
import type { ApiResponse, PaginatedResponse } from "@/types/api";

export interface Rating {
  id: string;
  stars: number;
  tags: string[];
  comment: string | null;
  isBlind: boolean;
  bothSubmitted: boolean;
  createdAt: string;
  ratedBy: { id: string; name: string; mobile: string };
  ratedTo: { id: string; name: string; mobile: string };
  booking: {
    id: string;
    pickupCity: string;
    dropCity: string;
  } | null;
}

export const ratingsApi = {
  getAll: async (params: {
    page?: number;
    limit?: number;
    flagged?: boolean;
    minStars?: number;
    maxStars?: number;
  } = {}): Promise<PaginatedResponse<Rating>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Rating>>>(
      "/admin/ratings",
      { params }
    );
    return response.data.data;
  },

  remove: async (id: string, reason: string) => {
    const response = await apiClient.delete(`/admin/ratings/${id}`, {
      data: { reason },
    });
    return response.data;
  },
};
