"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { tokenStorage } from "@/lib/api/client";

const pageVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35 },
  },
};

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const token = tokenStorage.getToken();
    if (!token) {
      router.replace("/login");
    }
  }, [router]);

  // Close mobile sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Block render until we can confirm a token exists on the client.
  if (typeof window !== "undefined" && !tokenStorage.getToken()) {
    return null;
  }

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg">
      {/* Mobile overlay — shown behind open sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            key="sidebar-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content — offset by sidebar width on desktop only */}
      <div className="lg:ml-[240px] min-h-screen flex flex-col">
        {/* Fixed Header */}
        <Header onMenuClick={() => setSidebarOpen((v) => !v)} />

        {/* Page Content — offset by header height */}
        <main className="flex-1 pt-16 overflow-auto">
          <motion.div
            key="dashboard-content"
            variants={pageVariants}
            initial="hidden"
            animate="visible"
            className="p-4 md:p-6"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
