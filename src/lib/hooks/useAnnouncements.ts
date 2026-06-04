import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { announcementsApi, type AnnouncementRole } from "@/lib/api/announcements";
import toast from "react-hot-toast";

export function useAnnouncements() {
  return useQuery({
    queryKey: ["announcements"],
    queryFn: announcementsApi.getAll,
    staleTime: 30 * 1000,
  });
}

export function useUpsertAnnouncement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { role: AnnouncementRole; text: string; isActive: boolean }) =>
      announcementsApi.upsert(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["announcements"] });
      toast.success("Announcement saved");
    },
    onError: () => toast.error("Failed to save announcement"),
  });
}
