import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { partnersApi } from "@/lib/api/partners";
import type { PartnerListFilters, SuspendPartnerPayload } from "@/types/partner";
import toast from "react-hot-toast";

export function usePartners(filters: PartnerListFilters = {}) {
  return useQuery({
    queryKey: ["partners", filters],
    queryFn: () => partnersApi.getAll(filters),
    staleTime: 30 * 1000,
  });
}

export function usePartner(id: string) {
  return useQuery({
    queryKey: ["partners", id],
    queryFn: () => partnersApi.getById(id),
    enabled: !!id,
  });
}

export function useKycQueue(params = {}) {
  return useQuery({
    queryKey: ["kyc", "queue", params],
    queryFn: () => partnersApi.getKycQueue(params),
    staleTime: 30 * 1000,
  });
}

export function useSuspendPartner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: SuspendPartnerPayload }) =>
      partnersApi.suspend(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["partners"] });
      toast.success("Partner suspended successfully");
    },
    onError: () => toast.error("Failed to suspend partner"),
  });
}

export function useApproveKyc() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, note }: { userId: string; note?: string }) =>
      partnersApi.approveKyc(userId, note),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["kyc"] });
      qc.invalidateQueries({ queryKey: ["partners"] });
      toast.success("KYC approved");
    },
    onError: () => toast.error("Failed to approve KYC"),
  });
}

export function useRejectKyc() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, note }: { userId: string; note: string }) =>
      partnersApi.rejectKyc(userId, note),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["kyc"] });
      toast.success("KYC rejected");
    },
    onError: () => toast.error("Failed to reject KYC"),
  });
}
