"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { Settings2, Users, UserCog } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { SubscriberTable } from "@/components/subscriptions/SubscriberTable";
import { ManagePlansDrawer } from "@/components/subscriptions/ManagePlansDrawer";

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as any },
  }),
};

const TABS = [
  { key: "PARTNER",          label: "Partners",          icon: Users },
  { key: "SERVICE_PROVIDER", label: "Service Providers", icon: UserCog },
] as const;

type TabKey = typeof TABS[number]["key"];

export default function SubscriptionsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("PARTNER");
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="space-y-6 max-w-[1400px]">

      {/* Header */}
      <motion.div custom={0} variants={sectionVariants} initial="hidden" animate="visible">
        <PageHeader
          title="Subscriptions"
          subtitle="View all active and past subscriber plans"
          actions={
            <Button
              variant="outline"
              size="sm"
              icon={<Settings2 size={14} />}
              onClick={() => setDrawerOpen(true)}
            >
              Manage Plans
            </Button>
          }
        />
      </motion.div>

      {/* Tabs */}
      <motion.div custom={1} variants={sectionVariants} initial="hidden" animate="visible">
        <div className="flex gap-1 p-1 bg-light-hover dark:bg-dark-hover rounded-xl w-fit">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium transition-all ${
                activeTab === key
                  ? "bg-white dark:bg-dark-surface text-light-text dark:text-dark-text shadow-sm"
                  : "text-light-text-3 dark:text-dark-text-3 hover:text-light-text dark:hover:text-dark-text"
              }`}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Subscriber table — re-mounts on tab change to reset filters/page */}
      <motion.div custom={2} variants={sectionVariants} initial="hidden" animate="visible">
        <SubscriberTable key={activeTab} role={activeTab} />
      </motion.div>

      {/* Manage Plans drawer */}
      <ManagePlansDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
}
