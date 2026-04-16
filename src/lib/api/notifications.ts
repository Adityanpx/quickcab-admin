import apiClient from "./client";

export interface BroadcastPayload {
  title: string;
  message: string;
  audience: "ALL" | "CITY" | "INDIVIDUAL";
  city?: string;
  userId?: string;
  channels: ("PUSH" | "WHATSAPP")[];
}

export const notificationsApi = {
  broadcast: async (payload: BroadcastPayload) => {
    const response = await apiClient.post(
      "/admin/notifications/broadcast",
      payload
    );
    return response.data;
  },

  getHistory: async (params = {}) => {
    const response = await apiClient.get("/admin/notifications/history", {
      params,
    });
    return response.data.data;
  },
};
