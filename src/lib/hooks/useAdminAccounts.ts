import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  adminAccountsApi,
  type AdminAccountListParams,
  type AdminActivityParams,
  type CreateAdminAccountPayload,
  type UpdateAdminAccountPayload,
} from "@/lib/api/admin-accounts";
import toast from "react-hot-toast";

function errorMessage(error: unknown, fallback: string): string {
  const msg = (error as { response?: { data?: { message?: string } } })?.response?.data
    ?.message;
  return msg ?? fallback;
}

export function useAdminAccounts(params: AdminAccountListParams = {}) {
  return useQuery({
    queryKey: ["admin-accounts", params],
    queryFn: () => adminAccountsApi.list(params),
    staleTime: 30 * 1000,
  });
}

export function useAdminAccountDetail(id: string) {
  return useQuery({
    queryKey: ["admin-accounts", id],
    queryFn: () => adminAccountsApi.getDetail(id),
    enabled: !!id,
    staleTime: 30 * 1000,
  });
}

export function useAdminAccountActivity(id: string, params: AdminActivityParams = {}) {
  return useQuery({
    queryKey: ["admin-accounts", id, "activity", params],
    queryFn: () => adminAccountsApi.getActivity(id, params),
    enabled: !!id,
    staleTime: 30 * 1000,
  });
}

export function useCreateAdminAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateAdminAccountPayload) => adminAccountsApi.create(payload),
    onSuccess: (_, payload) => {
      toast.success(`${payload.name} added as a subadmin`);
      qc.invalidateQueries({ queryKey: ["admin-accounts"] });
    },
    onError: (error) =>
      toast.error(errorMessage(error, "Failed to create subadmin account. Please try again.")),
  });
}

export function useUpdateAdminAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateAdminAccountPayload }) =>
      adminAccountsApi.update(id, payload),
    onSuccess: () => {
      toast.success("Subadmin details updated");
      qc.invalidateQueries({ queryKey: ["admin-accounts"] });
    },
    onError: (error) =>
      toast.error(errorMessage(error, "Failed to update subadmin. Please try again.")),
  });
}

export function useDeactivateAdminAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminAccountsApi.deactivate(id),
    onSuccess: () => {
      toast.success("Subadmin deactivated and logged out");
      qc.invalidateQueries({ queryKey: ["admin-accounts"] });
    },
    onError: () => toast.error("Failed to deactivate subadmin. Please try again."),
  });
}

export function useReactivateAdminAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminAccountsApi.reactivate(id),
    onSuccess: () => {
      toast.success("Subadmin reactivated");
      qc.invalidateQueries({ queryKey: ["admin-accounts"] });
    },
    onError: () => toast.error("Failed to reactivate subadmin. Please try again."),
  });
}

export function useResetAdminPassword() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, newPassword }: { id: string; newPassword: string }) =>
      adminAccountsApi.resetPassword(id, newPassword),
    onSuccess: (_, { id }) => {
      toast.success("Password reset. They've been logged out of all active sessions.");
      qc.invalidateQueries({ queryKey: ["admin-accounts", id] });
    },
    onError: () => toast.error("Failed to reset password. Please try again."),
  });
}
