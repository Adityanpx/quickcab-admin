import apiClient from "./client";

export type AnnouncementRole = "PARTNER" | "SERVICE_PROVIDER" | "BOTH";

export interface Announcement {
  id: string | null;
  role: AnnouncementRole;
  text: string;
  isActive: boolean;
  updatedAt: string | null;
}

export const announcementsApi = {
  getAll: async (): Promise<Announcement[]> => {
    const res = await apiClient.get("/admin/announcements");
    return res.data.data;
  },

  upsert: async (payload: {
    role: AnnouncementRole;
    text: string;
    isActive: boolean;
  }): Promise<Announcement> => {
    const res = await apiClient.put("/admin/announcements", payload);
    return res.data.data;
  },
};
