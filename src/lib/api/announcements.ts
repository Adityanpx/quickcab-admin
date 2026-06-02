import apiClient from "./client";
import type { PaginatedResponse } from "@/types/api";

export type AnnouncementPriority = "NORMAL" | "HIGH";
export type AnnouncementTargetType = "ALL" | "CITY" | "STATE" | "USER";

export interface Announcement {
  id: string;
  title: string | null;
  message: string;
  priority: AnnouncementPriority;
  targetType: AnnouncementTargetType;
  targetValue: string | null;
  isActive: boolean;
  expiresAt: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAnnouncementPayload {
  title?: string;
  message: string;
  priority: AnnouncementPriority;
  targetType: AnnouncementTargetType;
  targetValue?: string;
  expiresAt: string; // ISO string
}

export const announcementsApi = {
  getAll: async (params: { page?: number; limit?: number; isActive?: string } = {}): Promise<PaginatedResponse<Announcement>> => {
    const res = await apiClient.get("/admin/announcements", { params });
    return { items: res.data.data?.items ?? [], pagination: res.data.data?.pagination };
  },

  create: async (payload: CreateAnnouncementPayload): Promise<Announcement> => {
    const res = await apiClient.post("/admin/announcements", payload);
    return res.data.data;
  },

  update: async (id: string, payload: Partial<CreateAnnouncementPayload>): Promise<Announcement> => {
    const res = await apiClient.patch(`/admin/announcements/${id}`, payload);
    return res.data.data;
  },

  toggle: async (id: string): Promise<Announcement> => {
    const res = await apiClient.patch(`/admin/announcements/${id}/toggle`);
    return res.data.data;
  },

  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/announcements/${id}`);
  },

  searchUsers: async (search: string) => {
    const res = await apiClient.get("/admin/partners", { params: { search, limit: 10 } });
    return res.data.data?.items ?? [];
  },
};
