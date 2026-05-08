import apiClient from "./client";

export type AudienceType =
  | "ALL"
  | "PARTNERS_ONLY"
  | "PROVIDERS_ONLY"
  | "CITY"
  | "INDIVIDUAL"
  | "SPECIFIC_USERS";

export type RoleFilter = "ALL" | "PARTNERS" | "PROVIDERS";
export type Channel = "PUSH" | "WHATSAPP";

export interface BroadcastPayload {
  title: string;
  message: string;
  audience: AudienceType;
  channels: Channel[];
  city?: string;
  roleFilter?: RoleFilter;
  userId?: string;
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

  getPresignedUploadUrl: async (fileExtension: string): Promise<{
    uploadUrl: string;
    fileKey: string;
    publicUrl: string;
  }> => {
    const response = await apiClient.post<{
      data: { uploadUrl: string; fileKey: string; publicUrl: string };
    }>("/upload/presigned-url-admin", {
      category: "ad-images",
      fileExtension,
    });
    return response.data.data;
  },
};
