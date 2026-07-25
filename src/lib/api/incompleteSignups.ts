import apiClient from "./client";
import type { ApiResponse, PaginatedResponse } from "@/types/api";

export interface IncompleteSignup {
  id: string;
  mobile: string;
  name: string | null;
  language: string;
  createdAt: string;
  lastLoginAt: string | null;
}

export interface IncompleteSignupFilters {
  search?: string;
  page?: number;
  limit?: number;
}

export const incompleteSignupsApi = {
  getAll: async (
    filters: IncompleteSignupFilters = {}
  ): Promise<PaginatedResponse<IncompleteSignup>> => {
    const response = await apiClient.get<
      ApiResponse<IncompleteSignup[]> & { pagination: PaginatedResponse<IncompleteSignup>["pagination"] }
    >("/admin/users/incomplete-signups", { params: filters });

    return {
      items: response.data.data || [],
      pagination: response.data.pagination,
    };
  },
};
