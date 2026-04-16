"use client";

import { motion } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { settingsApi } from "@/lib/api/settings";
import { SystemConfigForm } from "@/components/settings/SystemConfigForm";
import { PageHeader } from "@/components/ui/PageHeader";
import { DashboardSkeleton } from "@/components/ui/SkeletonLoader";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const qc = useQueryClient();

  const { data: configs, isLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: settingsApi.getAll,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) return <DashboardSkeleton />;

  const handleSave = async (key: string, value: string) => {
    try {
      await settingsApi.update(key, value);
      qc.invalidateQueries({ queryKey: ["settings"] });
      toast.success(`"${key}" updated successfully`);
    } catch {
      toast.error("Failed to save setting");
      throw new Error("Save failed");
    }
  };

  return (
    <div className="space-y-6 max-w-[900px]">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <PageHeader
          title="System Settings"
          subtitle="Configure platform-wide settings — changes take effect immediately"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.35 }}
      >
        <SystemConfigForm configs={configs ?? []} onSave={handleSave} />
      </motion.div>
    </div>
  );
}
