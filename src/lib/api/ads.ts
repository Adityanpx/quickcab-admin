import apiClient from "./client";
import type { ApiResponse, PaginatedResponse } from "@/types/api";

export interface Ad {
  id: string;
  name: string;
  title: string | null;
  description: string | null;
  imageUrl: string;
  redirectUrl: string;
  isActive: boolean;
  order: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAdPayload {
  name: string;
  title?: string;
  description?: string;
  imageUrl: string;
  redirectUrl: string;
}

export interface UpdateAdPayload {
  name?: string;
  title?: string;
  description?: string;
  imageUrl?: string;
  redirectUrl?: string;
  isActive?: boolean;
}

export const adsApi = {
  getAllAds: async (params: {
    page?: number;
    limit?: number;
    isActive?: string;
  } = {}): Promise<PaginatedResponse<Ad>> => {
    const response = await apiClient.get<
      ApiResponse<Ad[]> & { pagination: PaginatedResponse<Ad>["pagination"] }
    >("/ads/admin", { params });
    return {
      items: response.data.data || [],
      pagination: response.data.pagination,
    };
  },

  createAd: async (payload: CreateAdPayload) => {
    const response = await apiClient.post("/ads/admin", payload);
    return response.data;
  },

  updateAd: async (id: string, payload: UpdateAdPayload) => {
    const response = await apiClient.put(`/ads/admin/${id}`, payload);
    return response.data;
  },

  deleteAd: async (id: string) => {
    const response = await apiClient.delete(`/ads/admin/${id}`);
    return response.data;
  },

  toggleAd: async (id: string, isActive: boolean) => {
    const response = await apiClient.patch(`/ads/admin/${id}/toggle`, {
      isActive,
    });
    return response.data;
  },

  reorderAds: async (ads: Array<{ id: string; order: number }>) => {
    const response = await apiClient.post("/ads/admin/reorder", { ads });
    return response.data;
  },

  getPresignedUploadUrl: async (
    fileExtension: string
  ): Promise<{ uploadUrl: string; fileKey: string; publicUrl: string }> => {
    const response = await apiClient.post<
      ApiResponse<{ uploadUrl: string; fileKey: string; publicUrl: string; isPrivate: boolean }>
    >("/upload/presigned-url-admin", {
      category: "ad-images",
      fileExtension,
    });
    return response.data.data;
  },
};
