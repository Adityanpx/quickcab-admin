import apiClient from "./client";

export type AudienceType =
  | "ALL"
  | "PARTNERS_ONLY"
  | "PROVIDERS_ONLY"
  | "CITY"
  | "SPECIFIC_USERS";

export type RoleFilter = "ALL" | "PARTNERS" | "PROVIDERS";
export type Channel = "PUSH";

export interface BroadcastPayload {
  title: string;
  message: string;
  audience: AudienceType;
  channels: Channel[];
  city?: string;
  roleFilter?: RoleFilter;
  userIds?: string[];
  imageUrl?: string;
}

export interface UserSearchResult {
  id: string;
  name: string;
  mobile: string;
  role: "PARTNER" | "SERVICE_PROVIDER";
  city: string | null;
  subType: string | null;
}

export interface BroadcastHistoryItem {
  id: string;
  title: string;
  message: string;
  audience: string;
  roleFilter: string | null;
  city: string | null;
  channels: string[];
  userCount: number;
  imageUrl: string | null;
  sentBy: { name: string; email: string } | null;
  sentAt: string | null;
}

export const notificationsApi = {
  broadcast: async (payload: BroadcastPayload) => {
    const response = await apiClient.post("/notifications/admin/broadcast", payload);
    return response.data;
  },

  getHistory: async (params: { page?: number; limit?: number } = {}): Promise<{
    items: BroadcastHistoryItem[];
    pagination: unknown;
  }> => {
    const response = await apiClient.get<{
      data: BroadcastHistoryItem[];
      pagination: unknown;
    }>("/notifications/admin/history", { params });
    return {
      items: response.data.data || [],
      pagination: response.data.pagination,
    };
  },

  searchUsers: async (q: string, limit = 20): Promise<UserSearchResult[]> => {
    if (q.trim().length < 2) return [];
    const response = await apiClient.get<{
      data: { users: UserSearchResult[] } | null;
    }>("/notifications/admin/search-users", {
      params: { q, limit },
    });
    return response.data.data?.users ?? [];
  },

  uploadNotificationImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("image", file);

    const response = await apiClient.post<{
      data: { publicUrl: string; fileKey: string; dimensions: string; format: string };
    }>("/upload/notification-image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return response.data.data.publicUrl;
  },

  deleteHistoryItem: async (id: string) => {
    const response = await apiClient.delete(`/notifications/admin/history/${id}`);
    return response.data;
  },

  clearAllHistory: async () => {
    const response = await apiClient.delete("/notifications/admin/history");
    return response.data;
  },
};
