"use client";

import { motion } from "framer-motion";
import { BroadcastForm } from "@/components/notifications/BroadcastForm";
import { PageHeader } from "@/components/ui/PageHeader";

export default function NotificationsPage() {
  return (
    <div className="space-y-6 max-w-[1400px]">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <PageHeader
          title="Notifications"
          subtitle="Broadcast messages to Partners and Service Providers via Push and WhatsApp"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.35 }}
      >
        <BroadcastForm />
      </motion.div>
    </div>
  );
}
