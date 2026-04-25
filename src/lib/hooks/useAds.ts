import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  adsApi,
  type CreateAdPayload,
  type UpdateAdPayload,
} from "@/lib/api/ads";
import toast from "react-hot-toast";

export function useAds(params: { page?: number; limit?: number; isActive?: string } = {}) {
  return useQuery({
    queryKey: ["ads", params],
    queryFn: () => adsApi.getAllAds(params),
    staleTime: 30 * 1000,
  });
}

export function useCreateAd() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateAdPayload) => adsApi.createAd(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ads"] });
      toast.success("Ad created");
    },
    onError: () => toast.error("Failed to create ad"),
  });
}

export function useUpdateAd() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateAdPayload }) =>
      adsApi.updateAd(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ads"] });
      toast.success("Ad updated");
    },
    onError: () => toast.error("Failed to update ad"),
  });
}

export function useDeleteAd() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adsApi.deleteAd(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ads"] });
      toast.success("Ad deleted");
    },
    onError: () => toast.error("Failed to delete ad"),
  });
}

export function useToggleAd() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      adsApi.toggleAd(id, isActive),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ads"] });
    },
    onError: () => toast.error("Failed to toggle ad"),
  });
}

export function useReorderAds() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ads: Array<{ id: string; order: number }>) =>
      adsApi.reorderAds(ads),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ads"] });
    },
    onError: () => toast.error("Failed to reorder ads"),
  });
}
