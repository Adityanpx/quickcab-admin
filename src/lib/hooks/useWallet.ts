import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { walletApi } from "@/lib/api/wallet";
import toast from "react-hot-toast";

export function useWithdrawals(params = {}) {
  return useQuery({
    queryKey: ["wallet", "withdrawals", params],
    queryFn: () => walletApi.getWithdrawals(params),
    staleTime: 30 * 1000,
  });
}

export function useWalletStats() {
  return useQuery({
    queryKey: ["wallet", "stats"],
    queryFn: walletApi.getStats,
    staleTime: 60 * 1000,
  });
}

export function useApproveWithdrawal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => walletApi.approveWithdrawal(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["wallet"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Withdrawal approved — payout triggered");
    },
    onError: () => toast.error("Failed to approve withdrawal"),
  });
}

export function useRejectWithdrawal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      walletApi.rejectWithdrawal(id, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["wallet"] });
      toast.success("Withdrawal rejected");
    },
    onError: () => toast.error("Failed to reject withdrawal"),
  });
}

export function useManualAdjust() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: walletApi.manualAdjust,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["wallet"] });
      qc.invalidateQueries({ queryKey: ["partners"] });
      toast.success("Wallet adjusted successfully");
    },
    onError: () => toast.error("Failed to adjust wallet"),
  });
}
