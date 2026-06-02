"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { Plus, Megaphone, Radio, CheckCircle, Clock } from "lucide-react";
import {
  useAnnouncements, useCreateAnnouncement, useUpdateAnnouncement,
  useToggleAnnouncement, useDeleteAnnouncement,
} from "@/lib/hooks/useAnnouncements";
import { AnnouncementModal } from "@/components/announcements/AnnouncementModal";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { DashboardSkeleton } from "@/components/ui/SkeletonLoader";
import { formatRelative, formatDateTime } from "@/lib/utils";
import type { Announcement, CreateAnnouncementPayload } from "@/lib/api/announcements";
import toast from "react-hot-toast";

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as any },
  }),
};

const TARGET_LABELS: Record<string, string> = {
  ALL: "All Partners",
  CITY: "City",
  STATE: "State",
  USER: "Individual",
};

export default function AnnouncementsPage() {
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<Announcement | null>(null);
  const [deleteItem, setDeleteItem] = useState<Announcement | null>(null);

  const { data, isLoading, isError } = useAnnouncements({ limit: 100 });
  const createMutation = useCreateAnnouncement();
  const updateMutation = useUpdateAnnouncement();
  const toggleMutation = useToggleAnnouncement();
  const deleteMutation = useDeleteAnnouncement();

  if (isLoading) return <DashboardSkeleton />;
  if (isError) return (
    <div className="flex flex-col items-center justify-center py-24 gap-3">
      <p className="text-[14px] font-medium text-light-text dark:text-dark-text">Failed to load announcements</p>
    </div>
  );

  const items = data?.items ?? [];
  const now = new Date();
  const liveCount = items.filter((a) => a.isActive && new Date(a.expiresAt) > now).length;
  const expiredCount = items.filter((a) => new Date(a.expiresAt) <= now).length;
  const inactiveCount = items.filter((a) => !a.isActive).length;

  const handleSubmit = async (payload: CreateAnnouncementPayload) => {
    if (editItem) {
      await updateMutation.mutateAsync({ id: editItem.id, payload });
      setEditItem(null);
    } else {
      await createMutation.mutateAsync(payload);
    }
    setShowModal(false);
  };

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Header */}
      <motion.div custom={0} variants={sectionVariants} initial="hidden" animate="visible">
        <PageHeader
          title="Announcements"
          subtitle="Send messages to partners in the Flutter app feed"
          actions={
            <Button variant="primary" size="sm" icon={<Plus size={14} />}
              onClick={() => { setEditItem(null); setShowModal(true); }}>
              New Announcement
            </Button>
          }
        />
      </motion.div>

      {/* Stats */}
      <motion.div custom={1} variants={sectionVariants} initial="hidden" animate="visible"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard index={0} label="Total" value={items.length} icon={<Megaphone size={16} />} accentColor="purple" />
        <StatCard index={1} label="Live Now" value={liveCount} icon={<Radio size={16} />} accentColor="green" subtext="active & not expired" />
        <StatCard index={2} label="Inactive" value={inactiveCount} icon={<CheckCircle size={16} />} accentColor="orange" />
        <StatCard index={3} label="Expired" value={expiredCount} icon={<Clock size={16} />} accentColor="purple" />
      </motion.div>

      {/* List */}
      <motion.div custom={2} variants={sectionVariants} initial="hidden" animate="visible">
        {items.length === 0 ? (
          <EmptyState
            icon={<Megaphone size={22} />}
            title="No announcements yet"
            description="Create your first announcement to send a message to partners in the app"
            action={<Button onClick={() => setShowModal(true)}>Create First Announcement</Button>}
          />
        ) : (
          <div className="card p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="table-base">
                <thead>
                  <tr>
                    <th className="pl-5">Message</th>
                    <th>Target</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Expires</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((ann) => {
                    const isExpired = new Date(ann.expiresAt) <= now;
                    return (
                      <tr key={ann.id} className={!ann.isActive || isExpired ? "opacity-50" : ""}>
                        <td className="pl-5 max-w-[280px]">
                          {ann.title && (
                            <p className="text-xs font-semibold text-brand-purple mb-0.5">{ann.title}</p>
                          )}
                          <p className="text-sm text-light-text dark:text-dark-text line-clamp-2">{ann.message}</p>
                        </td>
                        <td>
                          <div>
                            <Badge variant={ann.targetType === "ALL" ? "purple" : "orange"}>
                              {TARGET_LABELS[ann.targetType]}
                            </Badge>
                            {ann.targetValue && (
                              <p className="text-xs text-light-text-3 dark:text-dark-text-3 mt-0.5">{ann.targetValue}</p>
                            )}
                          </div>
                        </td>
                        <td>
                          <Badge variant={ann.priority === "HIGH" ? "red" : "gray"}>
                            {ann.priority}
                          </Badge>
                        </td>
                        <td>
                          {isExpired ? (
                            <Badge variant="expired">Expired</Badge>
                          ) : (
                            <Badge variant={ann.isActive ? "active" : "gray"}>
                              {ann.isActive ? "Live" : "Paused"}
                            </Badge>
                          )}
                        </td>
                        <td>
                          <span className="text-sm text-light-text-2 dark:text-dark-text-2">
                            {formatDateTime(ann.expiresAt)}
                          </span>
                        </td>
                        <td>
                          <span className="text-sm text-light-text-2 dark:text-dark-text-2">
                            {formatRelative(ann.createdAt)}
                          </span>
                        </td>
                        <td>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm"
                              onClick={() => { setEditItem(ann); setShowModal(true); }}>
                              Edit
                            </Button>
                            {!isExpired && (
                              <Button variant="ghost" size="sm"
                                loading={toggleMutation.isPending}
                                onClick={() => toggleMutation.mutate(ann.id, {
                                  onSuccess: () => toast.success(ann.isActive ? "Paused" : "Resumed"),
                                })}
                                className={ann.isActive ? "text-brand-orange" : "text-brand-green"}>
                                {ann.isActive ? "Pause" : "Resume"}
                              </Button>
                            )}
                            <Button variant="danger" size="sm"
                              onClick={() => setDeleteItem(ann)}>
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </motion.div>

      {/* Modals */}
      <AnnouncementModal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditItem(null); }}
        onSubmit={handleSubmit}
        editItem={editItem}
        loading={createMutation.isPending || updateMutation.isPending}
      />

      <ConfirmModal
        isOpen={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={async () => {
          if (!deleteItem) return;
          await deleteMutation.mutateAsync(deleteItem.id);
          setDeleteItem(null);
        }}
        title="Delete Announcement?"
        description="This will permanently delete the announcement and remove it from the app immediately."
        confirmLabel="Delete"
        variant="danger"
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
