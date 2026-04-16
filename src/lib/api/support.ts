import apiClient from "./client";
import type { ApiResponse, PaginatedResponse } from "@/types/api";

export type TicketStatus = "OPEN" | "IN_REVIEW" | "RESOLVED" | "CLOSED";

export interface SupportTicket {
  id: string;
  issue: string;
  message: string;
  status: TicketStatus;
  adminNote: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    mobile: string;
    role: string;
  };
}

export interface ReplyTicketPayload {
  status: TicketStatus;
  adminNote: string;
}

export const supportApi = {
  getAll: async (params: {
    page?: number;
    limit?: number;
    status?: TicketStatus;
  } = {}): Promise<PaginatedResponse<SupportTicket>> => {
    const response = await apiClient.get<
      ApiResponse<PaginatedResponse<SupportTicket>>
    >("/admin/support", { params });

    // Backend returns: { success, message, data: [], pagination: {...} }
    const ticketRecords = response.data.data;
    const pagination = response.data.pagination;

    return {
      items: ticketRecords || [],
      pagination,
    };
  },

  getById: async (id: string): Promise<SupportTicket> => {
    const response = await apiClient.get<ApiResponse<SupportTicket>>(
      `/admin/support/${id}`
    );
    return response.data.data;
  },

  reply: async (id: string, payload: ReplyTicketPayload) => {
    const response = await apiClient.post(
      `/admin/support/${id}/reply`,
      payload
    );
    return response.data;
  },

  updateStatus: async (id: string, status: TicketStatus) => {
    const response = await apiClient.patch(
      `/admin/support/${id}/status`,
      { status }
    );
    return response.data;
  },
};
