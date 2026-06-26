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

export const TEST_NOTIF_TYPES: { group: string; value: string; label: string }[] = [
  { group: "KYC", value: "KYC_APPROVED", label: "KYC Approved" },
  { group: "KYC", value: "KYC_REJECTED", label: "KYC Rejected" },
  { group: "Booking", value: "BOOKING_NEW", label: "New Booking (city-routed channel)" },
  { group: "Booking", value: "BOOKING_BOOKED", label: "Booking Accepted" },
  { group: "Booking", value: "BOOKING_CONFIRMED", label: "Booking Confirmed" },
  { group: "Booking", value: "BOOKING_REJECTED", label: "Booking Rejected" },
  { group: "Booking", value: "BOOKING_CANCELLED", label: "Booking Cancelled" },
  { group: "Booking", value: "BOOKING_EXPIRED", label: "Booking Expired" },
  { group: "Wallet", value: "WALLET_CREDIT", label: "Wallet Credit" },
  { group: "Wallet", value: "WALLET_WITHDRAWAL", label: "Wallet Withdrawal" },
  { group: "Service Request", value: "SERVICE_REQUEST_NEW", label: "New Service Request" },
  { group: "Service Request", value: "SERVICE_REQUEST_ACCEPTED", label: "Service Request Accepted" },
  { group: "Service Request", value: "SERVICE_REQUEST_COMPLETED", label: "Service Request Completed" },
  { group: "General", value: "GENERAL", label: "General / Test" },
];

export interface TestSendPayload {
  userId: string;
  notifType: string;
  city?: string;
}

export const notificationsApi = {
  broadcast: async (payload: BroadcastPayload) => {
    const response = await apiClient.post("/notifications/admin/broadcast", payload);
    return response.data;
  },

  testSend: async (payload: TestSendPayload) => {
    const response = await apiClient.post("/notifications/admin/test-send", payload);
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
