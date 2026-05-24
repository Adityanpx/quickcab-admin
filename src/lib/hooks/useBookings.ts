import { useQuery } from "@tanstack/react-query";
import { bookingsApi } from "@/lib/api/bookings";
import { partnersApi } from "@/lib/api/partners";
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

// Partner-specific bookings — uses dedicated endpoint that works for all statuses
// (including suspended/blocked partners) via GET /admin/partners/:userId/bookings
export function usePartnerBookings(partnerId: string, page = 1) {
  return useQuery({
    queryKey: ["bookings", "partner", partnerId, page],
    queryFn: () => partnersApi.getBookings(partnerId, { page, limit: 10 }),
    enabled: !!partnerId,
    staleTime: 30 * 1000,
  });
}
