import { useQuery } from "@tanstack/react-query";
import { referralLinksApi } from "@/lib/api/referral-links";

export function useReferralLinkStats(params: { dateFrom?: string; dateTo?: string } = {}) {
  return useQuery({
    queryKey: ["referral-links", "stats", params],
    queryFn: () => referralLinksApi.getStats(params),
    staleTime: 60 * 1000,
  });
}
