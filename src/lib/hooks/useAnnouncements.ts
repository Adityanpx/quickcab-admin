import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { announcementsApi, type CreateAnnouncementPayload } from "@/lib/api/announcements";
import toast from "react-hot-toast";

export function useAnnouncements(params: { page?: number; limit?: number; isActive?: string } = {}) {
  return useQuery({
    queryKey: ["announcements", params],
    queryFn: () => announcementsApi.getAll(params),
    staleTime: 30 * 1000,
  });
}

export function useCreateAnnouncement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateAnnouncementPayload) => announcementsApi.create(payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["announcements"] }); toast.success("Announcement created and sent"); },
    onError: () => toast.error("Failed to create announcement"),
  });
}

export function useUpdateAnnouncement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateAnnouncementPayload> }) =>
      announcementsApi.update(id, payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["announcements"] }); toast.success("Announcement updated"); },
    onError: () => toast.error("Failed to update announcement"),
  });
}

export function useToggleAnnouncement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => announcementsApi.toggle(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["announcements"] }),
    onError: () => toast.error("Failed to toggle announcement"),
  });
}

export function useDeleteAnnouncement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => announcementsApi.remove(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["announcements"] }); toast.success("Announcement deleted"); },
    onError: () => toast.error("Failed to delete announcement"),
  });
}
