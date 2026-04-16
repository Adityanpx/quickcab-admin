import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supportApi, type TicketStatus, type ReplyTicketPayload } from "@/lib/api/support";
import toast from "react-hot-toast";

export function useSupportTickets(params: {
  page?: number;
  limit?: number;
  status?: TicketStatus;
} = {}) {
  return useQuery({
    queryKey: ["support", "tickets", params],
    queryFn: () => supportApi.getAll(params),
    staleTime: 30 * 1000,
  });
}

export function useSupportTicket(id: string) {
  return useQuery({
    queryKey: ["support", "tickets", id],
    queryFn: () => supportApi.getById(id),
    enabled: !!id,
  });
}

export function useReplyTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ReplyTicketPayload }) =>
      supportApi.reply(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["support"] });
      toast.success("Reply sent successfully");
    },
    onError: () => toast.error("Failed to send reply"),
  });
}

export function useUpdateTicketStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: TicketStatus }) =>
      supportApi.updateStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["support"] });
      toast.success("Ticket status updated");
    },
    onError: () => toast.error("Failed to update status"),
  });
}
