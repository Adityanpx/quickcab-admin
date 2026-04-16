import apiClient from "./client";
import type { ApiResponse } from "@/types/api";

export interface SystemConfig {
  id: string;
  key: string;
  value: string;
  description: string | null;
  updatedAt: string;
}

export const settingsApi = {
  getAll: async (): Promise<SystemConfig[]> => {
    const response = await apiClient.get<ApiResponse<SystemConfig[]>>(
      "/admin/settings"
    );
    return response.data.data;
  },

  update: async (key: string, value: string): Promise<SystemConfig> => {
    const response = await apiClient.patch<ApiResponse<SystemConfig>>(
      `/admin/settings/${key}`,
      { value }
    );
    return response.data.data;
  },

  updateBulk: async (
    configs: { key: string; value: string }[]
  ): Promise<void> => {
    await apiClient.post("/admin/settings/bulk", { configs });
  },
};
