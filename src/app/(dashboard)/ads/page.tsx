"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { Plus, Megaphone } from "lucide-react";
import { useAds, useCreateAd, useUpdateAd, useDeleteAd } from "@/lib/hooks/useAds";
import { AdCard } from "@/components/ads/AdCard";
import { AdModal } from "@/components/ads/AdModal";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { DashboardSkeleton } from "@/components/ui/SkeletonLoader";
import { formatRelative } from "@/lib/utils";
import type { Ad, CreateAdPayload } from "@/lib/api/ads";

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as any },
  }),
};

export default function AdsPage() {
  const [showModal, setShowModal] = useState(false);
  const [editAd, setEditAd] = useState<Ad | null>(null);
  const [deleteAd, setDeleteAd] = useState<Ad | null>(null);

  const { data, isLoading, isError } = useAds({ limit: 100 });
  const createMutation = useCreateAd();
  const updateMutation = useUpdateAd();
  const deleteMutation = useDeleteAd();

  if (isLoading) return <DashboardSkeleton />;
  if (isError) return (
    <div className="flex flex-col items-center justify-center py-24 gap-3">
      <p className="text-[14px] font-medium text-light-text dark:text-dark-text">
        Failed to load advertisements
      </p>
      <p className="text-[13px] text-light-text-3 dark:text-dark-text-3">
        The server returned an error. Please try refreshing the page.
      </p>
    </div>
  );

  const ads = data?.items ?? [];
  const liveCount = ads.filter((a) => a.isActive).length;
  const inactiveCount = ads.filter((a) => !a.isActive).length;
  const lastUpdated =
    ads.length > 0
      ? formatRelative(
          ads.reduce((latest, a) =>
            new Date(a.updatedAt) > new Date(latest.updatedAt) ? a : latest
          ).updatedAt
        )
      : "—";

  const handleSubmit = async (payload: CreateAdPayload) => {
    if (editAd) {
      await updateMutation.mutateAsync({ id: editAd.id, payload });
      setEditAd(null);
    } else {
      await createMutation.mutateAsync(payload);
    }
    setShowModal(false);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteAd) return;
    await deleteMutation.mutateAsync(deleteAd.id);
    setDeleteAd(null);
  };

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Header */}
      <motion.div custom={0} variants={sectionVariants} initial="hidden" animate="visible">
        <PageHeader
          title="Advertisements"
          subtitle="Manage in-app ads shown to Partners and Service Providers"
          actions={
            <Button
              variant="primary"
              size="sm"
              icon={<Plus size={14} />}
              onClick={() => { setEditAd(null); setShowModal(true); }}
            >
              New Ad
            </Button>
          }
        />
      </motion.div>

      {/* Stats */}
      <motion.div
        custom={1}
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <StatCard
          index={0}
          label="Total Ads"
          value={ads.length}
          icon={<Megaphone size={16} />}
          accentColor="purple"
        />
        <StatCard
          index={1}
          label="Live Ads"
          value={liveCount}
          subtext="visible to users"
          accentColor="green"
        />
        <StatCard
          index={2}
          label="Inactive Ads"
          value={inactiveCount}
          subtext="hidden from users"
          accentColor="orange"
        />
        <StatCard
          index={3}
          label="Last Updated"
          value={lastUpdated}
          accentColor="purple"
        />
      </motion.div>

      {/* Ads grid */}
      <motion.div custom={2} variants={sectionVariants} initial="hidden" animate="visible">
        {ads.length === 0 ? (
          <EmptyState
            icon={<Megaphone size={22} />}
            title="No ads yet"
            description="Create your first ad to display promotions in the Flutter app"
            action={
              <Button onClick={() => setShowModal(true)}>
                Create First Ad
              </Button>
            }
          />
        ) : (
          <>
            <h2 className="font-semibold text-[15px] text-light-text dark:text-dark-text mb-3">
              All Ads ({ads.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {ads.map((ad, i) => (
                <AdCard
                  key={ad.id}
                  ad={ad}
                  index={i}
                  onEdit={(a) => { setEditAd(a); setShowModal(true); }}
                  onDelete={setDeleteAd}
                />
              ))}
            </div>
          </>
        )}
      </motion.div>

      {/* Modals */}
      <AdModal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditAd(null); }}
        onSubmit={handleSubmit}
        editAd={editAd}
        loading={createMutation.isPending || updateMutation.isPending}
      />

      <ConfirmModal
        isOpen={!!deleteAd}
        onClose={() => setDeleteAd(null)}
        onConfirm={handleDeleteConfirm}
        title={`Delete "${deleteAd?.name}"?`}
        description="This ad will be permanently deleted and immediately removed from the Flutter app."
        confirmLabel="Delete Ad"
        variant="danger"
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
