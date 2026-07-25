import { useQuery } from "@tanstack/react-query";
import { incompleteSignupsApi } from "@/lib/api/incompleteSignups";
import type { IncompleteSignupFilters } from "@/lib/api/incompleteSignups";

export function useIncompleteSignups(filters: IncompleteSignupFilters = {}) {
  return useQuery({
    queryKey: ["incomplete-signups", filters],
    queryFn: () => incompleteSignupsApi.getAll(filters),
    staleTime: 30 * 1000,
  });
}
