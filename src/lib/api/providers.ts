import apiClient from "./client";
import type { ApiResponse, PaginatedResponse } from "@/types/api";
import type {
  Provider,
  ProviderListFilters,
  ProviderServiceRequest,
} from "@/types/provider";
import type { SuspendPartnerPayload } from "@/types/partner";
import type { KycRejectPayload } from "./partners";

// The shared /admin/kyc/:userId/reject endpoint also accepts the SP-only
// business document, which the partner payload has no reason to carry.
export interface ProviderKycRejectPayload extends KycRejectPayload {
  businessDocStatus?: "APPROVED" | "REJECTED";
  businessDocRejectReason?: string;
}

export const providersApi = {
  getAll: async (
    filters: ProviderListFilters = {}
  ): Promise<PaginatedResponse<Provider>> => {
    const response = await apiClient.get<
      ApiResponse<Provider[]> & {
        pagination: PaginatedResponse<Provider>["pagination"];
      }
    >("/admin/providers", { params: filters });

    return {
      items: response.data.data || [],
      pagination: response.data.pagination,
    };
  },

  getById: async (id: string): Promise<Provider> => {
    const response = await apiClient.get<ApiResponse<Provider>>(
      `/admin/providers/${id}`
    );
    return response.data.data;
  },

  getServiceRequests: async (
    userId: string,
    params: { page?: number; limit?: number } = {}
  ): Promise<{ items: ProviderServiceRequest[]; pagination: any }> => {
    const response = await apiClient.get(
      `/admin/providers/${userId}/service-requests`,
      { params }
    );
    return {
      items: response.data.data || [],
      pagination: response.data.pagination,
    };
  },

  getCities: async (): Promise<{ city: string; count: number }[]> => {
    const response = await apiClient.get("/admin/providers/cities");
    return response.data.data || [];
  },

  suspend: async (id: string, payload: SuspendPartnerPayload) => {
    const response = await apiClient.post(
      `/admin/providers/${id}/suspend`,
      payload
    );
    return response.data;
  },

  unsuspend: async (id: string) => {
    const response = await apiClient.post(`/admin/providers/${id}/unsuspend`);
    return response.data;
  },

  block: async (id: string, reason: string) => {
    const response = await apiClient.post(`/admin/providers/${id}/block`, {
      reason,
    });
    return response.data;
  },

  unblock: async (id: string) => {
    const response = await apiClient.post(`/admin/providers/${id}/unblock`);
    return response.data;
  },

  deleteUser: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/providers/${id}`);
  },
};

// KYC calls are shared with partners — /admin/kyc/:userId/* resolves the user's
// role server-side and accepts businessDoc for SERVICE_PROVIDER. Re-exported so
// the provider detail page approves/rejects/uploads through the same code path.
export { partnersApi as providerKycApi } from "./partners";
export type { KycRejectPayload } from "./partners";
