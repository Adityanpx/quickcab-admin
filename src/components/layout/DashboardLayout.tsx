"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { useAuthStore } from "@/stores/authStore";
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

  useEffect(() => {
    // Use the token as the single source of truth.
    // Zustand's isAuthenticated starts as false on first render (before
    // rehydration from localStorage), which would incorrectly redirect
    // logged-in users. The token in localStorage is set synchronously
    // before router.push("/") fires, so it's always reliable here.
    const token = tokenStorage.getToken();
    if (!token) {
      router.replace("/login");
    }
  }, [router]);

  // Block render until we can confirm a token exists on the client.
  if (typeof window !== "undefined" && !tokenStorage.getToken()) {
    return null;
  }

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg">
      {/* Fixed Sidebar */}
      <Sidebar />

      {/* Main Content — offset by sidebar width */}
      <div className="ml-[240px] min-h-screen flex flex-col">
        {/* Fixed Header */}
        <Header />

        {/* Page Content — offset by header height */}
        <main className="flex-1 pt-16 overflow-auto">
          <motion.div
            key="dashboard-content"
            variants={pageVariants}
            initial="hidden"
            animate="visible"
            className="p-6"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
