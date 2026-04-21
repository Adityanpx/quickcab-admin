import apiClient from "./client";
import type { ApiResponse, PaginatedResponse } from "@/types/api";
import type { Booking, BookingListFilters } from "@/types/booking";

export const bookingsApi = {
  getAll: async (
    filters: BookingListFilters = {}
  ): Promise<PaginatedResponse<Booking>> => {
    // Backend returns: { success, message, data: Booking[], pagination: {...} }
    const response = await apiClient.get<
      ApiResponse<Booking[]> & { pagination: PaginatedResponse<Booking>["pagination"] }
    >("/admin/bookings", { params: filters });
    const bookingRecords = response.data.data;
    const pagination = response.data.pagination;
    return {
      items: bookingRecords || [],
      pagination,
    };
  },

  getById: async (id: string): Promise<Booking> => {
    const response = await apiClient.get<ApiResponse<Booking>>(
      `/admin/bookings/${id}`
    );
    return response.data.data;
  },

  cancel: async (id: string, reason: string) => {
    const response = await apiClient.post(
      `/admin/bookings/${id}/cancel`,
      { reason }
    );
    return response.data;
  },

  adjustCoins: async (
    bookingId: string,
    payload: { userId: string; amount: number; reason: string }
  ) => {
    const response = await apiClient.post(
      `/admin/wallet/adjust`,
      payload
    );
    return response.data;
  },
};
