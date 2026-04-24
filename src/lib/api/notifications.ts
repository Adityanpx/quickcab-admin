import apiClient from "./client";
import type { ApiResponse, PaginatedResponse } from "@/types/api";

export interface BroadcastPayload {
  title: string;
  message: string;
  audience: "ALL" | "CITY" | "INDIVIDUAL";
  city?: string;
  userId?: string;
  channels: ("PUSH" | "WHATSAPP")[];
}

export interface BroadcastHistoryItem {
  id: string;
  targetId: string;
  newValue: {
    title: string;
    message: string;
    audience: string;
    channels: string[];
    city: string | null;
    userId: string | null;
    userCount: number;
  } | null;
  createdAt: string;
  admin: { name: string; email: string };
}

export const notificationsApi = {
  broadcast: async (payload: BroadcastPayload) => {
    const response = await apiClient.post(
      "/notifications/admin/broadcast",
      payload
    );
    return response.data;
  },

  getHistory: async (params: { page?: number; limit?: number } = {}): Promise<{
    items: BroadcastHistoryItem[];
    pagination: PaginatedResponse<BroadcastHistoryItem>["pagination"];
  }> => {
    const response = await apiClient.get<
      ApiResponse<BroadcastHistoryItem[]> & { pagination: any }
    >("/notifications/admin/history", { params });
    return {
      items: response.data.data || [],
      pagination: response.data.pagination,
    };
  },
};
