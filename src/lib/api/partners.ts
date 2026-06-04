import apiClient from "./client";
import type { ApiResponse, PaginatedResponse } from "@/types/api";
import type {
  Partner,
  PartnerListFilters,
  SuspendPartnerPayload,
  RoleUpgradeRequest,
} from "@/types/partner";

export interface KycRejectPayload {
  adminNote?: string;
  aadhaarFrontStatus?: "APPROVED" | "REJECTED";
  aadhaarFrontRejectReason?: string;
  aadhaarBackStatus?: "APPROVED" | "REJECTED";
  aadhaarBackRejectReason?: string;
  drivingLicenceStatus?: "APPROVED" | "REJECTED";
  drivingLicenceRejectReason?: string;
  selfieStatus?: "APPROVED" | "REJECTED";
  selfieRejectReason?: string;
}

export const partnersApi = {
  getAll: async (
    filters: PartnerListFilters = {}
  ): Promise<PaginatedResponse<Partner>> => {
    const response = await apiClient.get<
      ApiResponse<Partner[]> & { pagination: PaginatedResponse<Partner>["pagination"] }
    >("/admin/partners", { params: filters });

    const partnerRecords = response.data.data;
    const pagination = response.data.pagination;

    return {
      items: partnerRecords || [],
      pagination,
    };
  },

  getById: async (id: string): Promise<Partner> => {
    const response = await apiClient.get<ApiResponse<Partner>>(
      `/admin/partners/${id}`
    );
    return response.data.data;
  },

  suspend: async (id: string, payload: SuspendPartnerPayload) => {
    const response = await apiClient.post(
      `/admin/partners/${id}/suspend`,
      payload
    );
    return response.data;
  },

  unsuspend: async (id: string) => {
    const response = await apiClient.post(
      `/admin/partners/${id}/unsuspend`
    );
    return response.data;
  },

  block: async (id: string, reason: string) => {
    const response = await apiClient.post(`/admin/partners/${id}/block`, {
      reason,
    });
    return response.data;
  },

  unblock: async (id: string) => {
    const response = await apiClient.post(`/admin/partners/${id}/unblock`);
    return response.data;
  },

  approveKyc: async (userId: string, note?: string) => {
    const response = await apiClient.post(
      `/admin/kyc/${userId}/approve`,
      { note }
    );
    return response.data;
  },

  rejectKyc: async (userId: string, payload: KycRejectPayload) => {
    const response = await apiClient.post(
      `/admin/kyc/${userId}/reject`,
      payload
    );
    return response.data;
  },

  reviewDocument: async (
    userId: string,
    document: string,
    status: "APPROVED" | "REJECTED",
    rejectReason?: string
  ) => {
    const response = await apiClient.post(
      `/admin/kyc/${userId}/document`,
      { document, status, rejectReason }
    );
    return response.data;
  },

  getKycQueue: async (params = {}) => {
    try {
      const response = await apiClient.get("/admin/kyc", { params });
      
      // Backend returns: { success, message, data: [], pagination: {} }
      const kycRecords = response.data.data; // The array of KYC records
      const pagination = response.data.pagination;

      // Map backend response to component format
      const mappedItems = (kycRecords || []).map((kycRecord: any) => ({
        userId: kycRecord.user?.id,
        userName: kycRecord.user?.name,
        mobile: kycRecord.user?.mobile,
        subType: kycRecord.user?.partnerProfile?.subType,
        kycStatus: kycRecord.status,
        submittedAt: kycRecord.submittedAt,
        aadhaarNumber: kycRecord.aadhaarNumber,
        id: kycRecord.id, // Keep original ID for reference
      }));

      return {
        items: mappedItems,
        pagination,
      };
    } catch (err: unknown) {
      // 404 means the endpoint isn't implemented on the backend yet —
      // return empty pagination so the UI shows an empty state gracefully.
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 404) {
        return { items: [], pagination: { total: 0, page: 1, limit: 10, totalPages: 0 } };
      }
      throw err;
    }
  },

  getRoleUpgradeRequests: async (): Promise<RoleUpgradeRequest[]> => {
    const response = await apiClient.get<ApiResponse<RoleUpgradeRequest[]>>(
      "/admin/partners/role-upgrades"
    );
    return response.data.data;
  },

  approveRoleUpgrade: async (requestId: string, note?: string) => {
    const response = await apiClient.post(
      `/admin/partners/role-upgrades/${requestId}/approve`,
      { note }
    );
    return response.data;
  },

  rejectRoleUpgrade: async (requestId: string, note: string) => {
    const response = await apiClient.post(
      `/admin/partners/role-upgrades/${requestId}/reject`,
      { note }
    );
    return response.data;
  },

  getBookings: async (
    userId: string,
    params: { page?: number; limit?: number } = {}
  ): Promise<{ items: import("@/types/booking").Booking[]; pagination: any }> => {
    const response = await apiClient.get(
      `/admin/partners/${userId}/bookings`,
      { params }
    );
    return {
      items: response.data.data || [],
      pagination: response.data.pagination,
    };
  },

  getKycDocUploadUrl: async (
    fieldKey: string,
    fileExtension: string
  ): Promise<{ uploadUrl: string; fileKey: string; publicUrl: string }> => {
    const categoryMap: Record<string, string> = {
      aadhaarFront:   "kyc-aadhaar-front",
      aadhaarBack:    "kyc-aadhaar-back",
      drivingLicence: "kyc-driving-licence",
      selfie:         "kyc-selfie",
    };
    const category = categoryMap[fieldKey];
    if (!category) throw new Error(`Unknown fieldKey: ${fieldKey}`);

    const response = await apiClient.post("/upload/presigned-url-admin", {
      category,
      fileExtension,
    });
    return response.data.data;
  },

  saveKycDocImage: async (
    userId: string,
    fieldKey: string,
    fileKey: string
  ): Promise<void> => {
    await apiClient.patch(`/admin/kyc/${userId}/document-image`, {
      fieldKey,
      fileKey,
    });
  },

  getCities: async (): Promise<{ city: string; count: number }[]> => {
    const response = await apiClient.get("/admin/partners/cities");
    return response.data.data || [];
  },

  deleteUser: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/partners/${id}`);
  },
};
