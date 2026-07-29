import apiClient from "./client";
import type { ApiResponse, PaginatedResponse } from "@/types/api";

export interface AdminAccount {
  id: string;
  name: string;
  email: string;
  role: string; // "SUBADMIN" for everything this UI creates
  isActive: boolean;
  lastLoginAt: string | null;
  totalActions: number;
  lastActionAt: string | null;
  createdAt: string;
}

// NOTE: the detail endpoint does NOT return totalActions/lastActionAt at the
// top level the way the list endpoint does — only nested under stats. Don't
// assume this extends AdminAccount.
export interface AdminAccountDetail {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  lastLoginAt: string | null;
  lastLoginIp: string | null;
  createdAt: string;
  createdBy: string | null;
  stats: {
    totalActions: number;
    actionsByType: Record<string, number>;
    last7DaysActions: number;
  };
}

export interface AdminActivityLog {
  id: string;
  action: string;
  targetType: string;
  targetId: string;
  previousValue: unknown;
  newValue: unknown;
  ipAddress: string | null;
  createdAt: string;
}

export interface AdminAccountListParams {
  role?: "SUBADMIN" | "SUPERADMIN";
  status?: "active" | "inactive";
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface AdminActivityParams {
  action?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
}

export interface CreateAdminAccountPayload {
  name: string;
  email: string;
  password: string;
}

export interface UpdateAdminAccountPayload {
  name?: string;
  email?: string;
}

// The backend returns { <items>, total, page, pageSize } inside `data` —
// there is no separate `pagination` envelope key and no totalPages /
// hasNextPage / hasPrevPage, so those are derived here to fit the shared
// PaginatedResponse shape the rest of the app (and the Pagination component) expect.
function buildPagination(total: number, page: number, pageSize: number) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  return {
    total,
    page,
    limit: pageSize,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}

export interface LogCallPayload {
  targetName?: string;
  outcome: "CONNECTED" | "NOT_REACHABLE" | "CALL_BACK_LATER" | "OTHER";
  note?: string;
}

export const adminAccountsApi = {
  // Self-scoped — no admin id needed, backend resolves it from the JWT.
  getMyActivity: async (
    params: AdminActivityParams = {}
  ): Promise<PaginatedResponse<AdminActivityLog>> => {
    const { dateFrom, dateTo, ...rest } = params;
    const response = await apiClient.get<
      ApiResponse<{ logs: AdminActivityLog[]; total: number; page: number; pageSize: number }>
    >("/admin/admins/me/activity", {
      params: { ...rest, from: dateFrom, to: dateTo },
    });
    const { logs, total, page, pageSize } = response.data.data;
    return { items: logs ?? [], pagination: buildPagination(total, page, pageSize) };
  },

  logCall: async (userId: string, payload: LogCallPayload): Promise<void> => {
    await apiClient.post(`/admin/calls/${userId}/log`, payload);
  },

  list: async (
    params: AdminAccountListParams = {}
  ): Promise<PaginatedResponse<AdminAccount>> => {
    const response = await apiClient.get<
      ApiResponse<{ admins: AdminAccount[]; total: number; page: number; pageSize: number }>
    >("/admin/admins", { params });
    const { admins, total, page, pageSize } = response.data.data;
    return { items: admins ?? [], pagination: buildPagination(total, page, pageSize) };
  },

  create: async (payload: CreateAdminAccountPayload): Promise<void> => {
    await apiClient.post("/admin/admins", payload);
  },

  getDetail: async (id: string): Promise<AdminAccountDetail> => {
    const response = await apiClient.get<ApiResponse<AdminAccountDetail>>(
      `/admin/admins/${id}`
    );
    return response.data.data;
  },

  getActivity: async (
    id: string,
    params: AdminActivityParams = {}
  ): Promise<PaginatedResponse<AdminActivityLog>> => {
    const { dateFrom, dateTo, ...rest } = params;
    const response = await apiClient.get<
      ApiResponse<{ logs: AdminActivityLog[]; total: number; page: number; pageSize: number }>
    >(`/admin/admins/${id}/activity`, {
      params: { ...rest, from: dateFrom, to: dateTo },
    });
    const { logs, total, page, pageSize } = response.data.data;
    return { items: logs ?? [], pagination: buildPagination(total, page, pageSize) };
  },

  update: async (id: string, payload: UpdateAdminAccountPayload): Promise<void> => {
    await apiClient.patch(`/admin/admins/${id}`, payload);
  },

  deactivate: async (id: string): Promise<void> => {
    await apiClient.post(`/admin/admins/${id}/deactivate`);
  },

  reactivate: async (id: string): Promise<void> => {
    await apiClient.post(`/admin/admins/${id}/reactivate`);
  },

  resetPassword: async (id: string, newPassword: string): Promise<void> => {
    await apiClient.post(`/admin/admins/${id}/reset-password`, { newPassword });
  },
};
