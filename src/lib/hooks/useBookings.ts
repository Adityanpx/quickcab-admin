import { useQuery } from "@tanstack/react-query";
import { bookingsApi } from "@/lib/api/bookings";
import type { BookingListFilters } from "@/types/booking";

export function useBookings(filters: BookingListFilters = {}) {
  return useQuery({
    queryKey: ["bookings", filters],
    queryFn: () => bookingsApi.getAll(filters),
    staleTime: 30 * 1000,
  });
}

export function useBooking(id: string) {
  return useQuery({
    queryKey: ["bookings", id],
    queryFn: () => bookingsApi.getById(id),
    enabled: !!id,
  });
}

// Partner-specific bookings — uses same endpoint with partnerId filter
export function usePartnerBookings(partnerId: string, page = 1) {
  return useQuery({
    queryKey: ["bookings", "partner", partnerId, page],
    queryFn: () => bookingsApi.getAll({ page, limit: 10 }),
    enabled: !!partnerId,
    staleTime: 30 * 1000,
  });
}
