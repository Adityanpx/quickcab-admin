import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { partnersApi } from "@/lib/api/partners";
import type { KycRejectPayload } from "@/lib/api/partners";
import type { PartnerListFilters, SuspendPartnerPayload, RoleUpgradeFilters } from "@/types/partner";
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

export function usePartnerCities() {
  return useQuery({
    queryKey: ["partners", "cities"],
    queryFn: () => partnersApi.getCities(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useKycQueue(params = {}) {
  return useQuery({
    queryKey: ["kyc", "queue", params],
    queryFn: () => partnersApi.getKycQueue(params),
    staleTime: 30 * 1000,
  });
}

export function useKycApprovalStats(params: { from: string; to: string }) {
  return useQuery({
    queryKey: ["kyc", "approval-stats", params],
    queryFn: () => partnersApi.getKycApprovalStats(params),
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
    mutationFn: ({
      userId,
      payload,
    }: {
      userId: string;
      payload: KycRejectPayload;
    }) => partnersApi.rejectKyc(userId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["kyc"] });
      qc.invalidateQueries({ queryKey: ["partners"] });
      toast.success("KYC rejected — partner notified");
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message ?? "Failed to reject KYC";
      toast.error(msg);
    },
  });
}

export function useReviewDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      document,
      status,
      rejectReason,
    }: {
      userId: string;
      document: string;
      status: "APPROVED" | "REJECTED";
      rejectReason?: string;
    }) => partnersApi.reviewDocument(userId, document, status, rejectReason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["kyc"] });
      qc.invalidateQueries({ queryKey: ["partners"] });
      toast.success("Document reviewed");
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message ?? "Failed to review document";
      toast.error(msg);
    },
  });
}

export function useDeletePartner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => partnersApi.deleteUser(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["partners"] });
      toast.success("User and all associated data deleted permanently");
    },
    onError: () => toast.error("Failed to delete user. Please try again."),
  });
}

// Hook for admin uploading/replacing a KYC document image
// Handles the two-step flow: get presigned URL → upload to R2 → save fileKey to DB
export function useAdminUploadKycDoc() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      userId,
      fieldKey,
      file,
    }: {
      userId: string;
      fieldKey: string;
      file: File;
    }) => {
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const { uploadUrl, publicUrl } = await partnersApi.getKycDocUploadUrl(fieldKey, ext);

      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      if (!uploadResponse.ok) {
        throw new Error(`Upload failed: ${uploadResponse.statusText}`);
      }

      await partnersApi.saveKycDocImage(userId, fieldKey, publicUrl);
    },
    onSuccess: (_, { userId }) => {
      qc.invalidateQueries({ queryKey: ["partners", userId] });
      qc.invalidateQueries({ queryKey: ["kyc"] });
      toast.success("Document image uploaded successfully");
    },
    onError: (error: any) => {
      const msg = error?.message ?? "Failed to upload document image";
      toast.error(msg);
    },
  });
}

// ─── ROLE UPGRADE REQUESTS (Driver → Partner) ────────────────────────────────

export function useRoleUpgradeRequests(filters: RoleUpgradeFilters = {}) {
  return useQuery({
    queryKey: ["role-upgrades", filters],
    queryFn: () => partnersApi.getRoleUpgradeRequests(filters),
    staleTime: 30 * 1000,
  });
}

export function useApproveRoleUpgrade() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ requestId, note }: { requestId: string; note?: string }) =>
      partnersApi.approveRoleUpgrade(requestId, note),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["role-upgrades"] });
      qc.invalidateQueries({ queryKey: ["partners"] });
      qc.invalidateQueries({ queryKey: ["providers"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Role upgrade approved — user is now a Partner");
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message ?? "Failed to approve role upgrade";
      toast.error(msg);
    },
  });
}

export function useRejectRoleUpgrade() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ requestId, note }: { requestId: string; note: string }) =>
      partnersApi.rejectRoleUpgrade(requestId, note),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["role-upgrades"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Role upgrade request rejected");
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message ?? "Failed to reject role upgrade";
      toast.error(msg);
    },
  });
}
