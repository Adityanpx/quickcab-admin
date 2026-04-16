import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/lib/api/dashboard";

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: dashboardApi.getStats,
    refetchInterval: 5 * 60 * 1000, // 5 minutes (matches Redis cache TTL)
    staleTime: 4 * 60 * 1000,
  });
}
