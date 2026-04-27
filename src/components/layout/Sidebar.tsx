"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import {
  LogOut,
  Sun,
  Moon,
  ChevronRight,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/constants/navigation";
import { useAuthStore } from "@/stores/authStore";
import { authApi } from "@/lib/api/auth";
import { getInitials } from "@/lib/utils";
import toast from "react-hot-toast";


const navItemVariants = {
  hidden: { opacity: 0, x: -12 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.05 + 0.15,
      duration: 0.3,
    },
  }),
};

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { admin, logout } = useAuthStore();
  // next-themes returns undefined on first render (SSR).
  // Without this guard, Sun vs Moon icon differs between server and client
  // causing a React hydration mismatch error.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore API error, always clear local state
    }
    logout();
    toast.success("Signed out successfully");
    router.push("/login");
  };

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen w-[240px] z-40",
        "flex flex-col",
        "bg-white dark:bg-dark-surface-2",
        "border-r border-light-border dark:border-dark-border",
        "transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}
    >
      {/* ── Logo ─────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-5 h-16 border-b border-light-border dark:border-dark-border shrink-0">
        {/* Mobile close button */}
        <button
          onClick={onClose}
          className="lg:hidden absolute right-3 top-4 p-1.5 rounded-lg text-light-text-3 dark:text-dark-text-3 hover:bg-light-surface-2 dark:hover:bg-dark-surface transition-colors"
          aria-label="Close sidebar"
        >
          <X size={16} />
        </button>
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-8 h-8 rounded-lg bg-brand-purple flex items-center justify-center shadow-purple-glow shrink-0"
        >
          <span className="text-sm">🚕</span>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
        >
          <p className="font-bold text-[15px] text-light-text dark:text-dark-text leading-tight tracking-tight">
            QuickCab
          </p>
          <p className="text-[10px] text-light-text-3 dark:text-dark-text-3 font-medium tracking-wider uppercase">
            Admin Panel
          </p>
        </motion.div>
      </div>

      {/* ── Navigation ───────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
        {NAV_ITEMS.map((item, i) => {
          const active = isActive(item.href);
          const Icon = item.icon;

          return (
            <motion.div
              key={item.href}
              custom={i}
              variants={navItemVariants}
              initial="hidden"
              animate="visible"
            >
              <Link
                href={item.href}
                className={cn(
                  "group relative flex items-center gap-3 px-3 py-2.5 rounded-xl",
                  "text-sm font-medium",
                  "transition-all duration-150",
                  active
                    ? "bg-brand-purple-muted dark:bg-brand-purple-muted-dark text-brand-purple"
                    : "text-light-text-2 dark:text-dark-text-2 hover:bg-light-surface-2 dark:hover:bg-dark-surface hover:text-light-text dark:hover:text-dark-text"
                )}
              >
                {/* Active left border indicator */}
                {active && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-brand-purple rounded-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}

                <Icon
                  size={17}
                  className={cn(
                    "shrink-0 transition-colors duration-150",
                    active
                      ? "text-brand-purple"
                      : "text-light-text-3 dark:text-dark-text-3 group-hover:text-light-text-2 dark:group-hover:text-dark-text-2"
                  )}
                />

                <span className="flex-1 truncate">{item.label}</span>

                {/* Badge */}
                {item.badge && (
                  <span className="text-[10px] font-semibold bg-brand-orange text-white px-1.5 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}

                {/* Hover arrow */}
                {!active && (
                  <ChevronRight
                    size={13}
                    className="opacity-0 group-hover:opacity-40 transition-opacity -mr-1 shrink-0"
                  />
                )}
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* ── Bottom Section ────────────────────────────── */}
      <div className="shrink-0 px-3 pb-4 pt-3 border-t border-light-border dark:border-dark-border space-y-1">
        {/* Theme Toggle */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl",
            "text-sm font-medium",
            "text-light-text-2 dark:text-dark-text-2",
            "hover:bg-light-surface-2 dark:hover:bg-dark-surface",
            "hover:text-light-text dark:hover:text-dark-text",
            "transition-all duration-150"
          )}
        >
          {/* Only render theme icon after mount — next-themes returns
              undefined on the server, which causes a Sun/Moon hydration
              mismatch. Show a neutral placeholder until client is ready. */}
          {mounted ? (
            <AnimatePresence mode="wait">
              {theme === "dark" ? (
                <motion.div
                  key="sun"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Sun size={17} className="text-light-text-3 dark:text-dark-text-3" />
                </motion.div>
              ) : (
                <motion.div
                  key="moon"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Moon size={17} className="text-light-text-3 dark:text-dark-text-3" />
                </motion.div>
              )}
            </AnimatePresence>
          ) : (
            <Moon size={17} className="text-light-text-3 dark:text-dark-text-3" />
          )}
          <span>{mounted ? (theme === "dark" ? "Light Mode" : "Dark Mode") : "Dark Mode"}</span>
        </motion.button>

        {/* Admin Profile Row */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
        >
          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-brand-purple flex items-center justify-center shrink-0">
            <span className="text-[11px] font-bold text-white">
              {admin?.name ? getInitials(admin.name) : "SA"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium text-light-text dark:text-dark-text truncate">
              {admin?.name ?? "Super Admin"}
            </p>
            <p className="text-[11px] text-light-text-3 dark:text-dark-text-3 truncate">
              {admin?.email ?? "admin@quickcab.in"}
            </p>
          </div>
          {/* Logout */}
          <button
            onClick={handleLogout}
            title="Sign out"
            className="p-1.5 rounded-lg text-light-text-3 dark:text-dark-text-3 hover:text-brand-red hover:bg-brand-red-muted transition-all duration-150 shrink-0"
          >
            <LogOut size={14} />
          </button>
        </motion.div>
      </div>
    </aside>
  );
}
