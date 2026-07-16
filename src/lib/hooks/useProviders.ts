import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { providersApi } from "@/lib/api/providers";
import type { ProviderListFilters } from "@/types/provider";
import type { SuspendPartnerPayload } from "@/types/partner";
import toast from "react-hot-toast";

export function useProviders(filters: ProviderListFilters = {}) {
  return useQuery({
    queryKey: ["providers", filters],
    queryFn: () => providersApi.getAll(filters),
    staleTime: 30 * 1000,
  });
}

export function useProvider(id: string) {
  return useQuery({
    queryKey: ["providers", id],
    queryFn: () => providersApi.getById(id),
    enabled: !!id,
  });
}

export function useProviderCities() {
  return useQuery({
    queryKey: ["providers", "cities"],
    queryFn: () => providersApi.getCities(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useProviderServiceRequests(userId: string, page = 1) {
  return useQuery({
    queryKey: ["providers", "service-requests", userId, page],
    queryFn: () => providersApi.getServiceRequests(userId, { page, limit: 10 }),
    enabled: !!userId,
    staleTime: 30 * 1000,
  });
}

export function useSuspendProvider() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: SuspendPartnerPayload;
    }) => providersApi.suspend(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["providers"] });
      toast.success("Service Provider suspended successfully");
    },
    onError: () => toast.error("Failed to suspend provider"),
  });
}

export function useDeleteProvider() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => providersApi.deleteUser(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["providers"] });
      toast.success("User and all associated data deleted permanently");
    },
    onError: () => toast.error("Failed to delete user. Please try again."),
  });
}

// KYC mutations hit the role-agnostic /admin/kyc/:userId/* endpoints, so the
// partner hooks work unchanged for providers. They invalidate ["partners"] and
// ["kyc"]; the provider detail page additionally invalidates ["providers", id].
export {
  useApproveKyc,
  useRejectKyc,
  useReviewDocument,
  useAdminUploadKycDoc,
} from "./usePartners";
