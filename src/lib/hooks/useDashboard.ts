import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { dashboardApi } from "@/lib/api/dashboard";
import type { SubAdminCredentialsInfo } from "@/lib/api/dashboard";
import toast from "react-hot-toast";

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: dashboardApi.getStats,
    refetchInterval: 5 * 60 * 1000,
    staleTime: 4 * 60 * 1000,
  });
}

export function useAdminNotifications() {
  return useQuery({
    queryKey: ["admin", "notifications"],
    queryFn: () => dashboardApi.getAdminNotifications(),
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
    refetchIntervalInBackground: false,
  });
}

// ─── SubAdmin Logs hooks ──────────────────────────────────────────────────────

export function useSubAdminLogs(params: {
  page: number;
  subAdminName?: string;
  action?: string;
  targetType?: string;
  dateFrom?: string;
  dateTo?: string;
}) {
  return useQuery({
    queryKey: ["subadmin-logs", params],
    queryFn: () => dashboardApi.getSubAdminLogs({ ...params, limit: 20 }),
    staleTime: 30 * 1000,
  });
}

export function useSubAdminNames() {
  return useQuery({
    queryKey: ["subadmin-names"],
    queryFn: () => dashboardApi.getSubAdminNames(),
    staleTime: 5 * 60 * 1000,
  });
}

// ─── SubAdmin Settings hooks ──────────────────────────────────────────────────

export function useSubAdminCredentials() {
  return useQuery({
    queryKey: ["subadmin-credentials"],
    queryFn: () => dashboardApi.getSubAdminCredentials(),
    staleTime: 60 * 1000,
  });
}

export function useChangeSubAdminPassword() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (newPassword: string) =>
      dashboardApi.changeSubAdminPassword(newPassword),
    onSuccess: () => {
      toast.success("SubAdmin password updated. All subadmins must re-login.");
      qc.invalidateQueries({ queryKey: ["subadmin-credentials"] });
    },
    onError: () => toast.error("Failed to update password. Please try again."),
  });
}

export function useChangeSubAdminUsername() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (newUsername: string) =>
      dashboardApi.changeSubAdminUsername(newUsername),
    onSuccess: () => {
      toast.success("SubAdmin username updated successfully.");
      qc.invalidateQueries({ queryKey: ["subadmin-credentials"] });
    },
    onError: () => toast.error("Failed to update username. Please try again."),
  });
}

export function useToggleSubAdminAccess() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (isActive: boolean) =>
      dashboardApi.toggleSubAdminAccess(isActive),
    onSuccess: (_, isActive) => {
      toast.success(
        isActive
          ? "SubAdmin access enabled. Subadmins can now log in."
          : "SubAdmin access disabled. All subadmins are locked out."
      );
      qc.invalidateQueries({ queryKey: ["subadmin-credentials"] });
    },
    onError: () => toast.error("Failed to update access. Please try again."),
  });
}

export function useSubAdminSummary() {
  return useQuery({
    queryKey: ["subadmin-summary"],
    queryFn: () => dashboardApi.getSubAdminSummary(),
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });
}

export function useRestrictSubAdmin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      name,
      status,
      reason,
    }: {
      name: string;
      status: "SUSPENDED" | "BLOCKED";
      reason: string;
    }) => dashboardApi.restrictSubAdmin(name, status, reason),
    onSuccess: (_, { name, status }) => {
      toast.success(`${name} has been ${status.toLowerCase()} successfully`);
      qc.invalidateQueries({ queryKey: ["subadmin-summary"] });
      qc.invalidateQueries({ queryKey: ["subadmin-logs"] });
    },
    onError: () => toast.error("Failed to restrict subadmin. Please try again."),
  });
}

export function useUnrestrictSubAdmin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => dashboardApi.unrestrictSubAdmin(name),
    onSuccess: (_, name) => {
      toast.success(`Restriction lifted for ${name}`);
      qc.invalidateQueries({ queryKey: ["subadmin-summary"] });
      qc.invalidateQueries({ queryKey: ["subadmin-logs"] });
    },
    onError: () => toast.error("Failed to lift restriction. Please try again."),
  });
}
