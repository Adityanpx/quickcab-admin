"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Search, ChevronDown, LogOut, User, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/constants/navigation";
import { useAuthStore } from "@/stores/authStore";
import { authApi } from "@/lib/api/auth";
import { getInitials } from "@/lib/utils";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const dropdownVariants = {
  hidden: { opacity: 0, y: -8, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.18 },
  },
  exit: {
    opacity: 0,
    y: -8,
    scale: 0.96,
    transition: { duration: 0.14 },
  },
};

// Mock notifications — replace with real API call later
const mockNotifications = [
  { id: "1", title: "KYC Pending", message: "23 KYC requests awaiting review", time: "2m ago", unread: true },
  { id: "2", title: "Withdrawal Request", message: "₹2,500 withdrawal by Rahul Sharma", time: "15m ago", unread: true },
  { id: "3", title: "Low Rating Alert", message: "Partner flagged: 1.8 avg rating", time: "1h ago", unread: true },
];

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { admin, logout } = useAuthStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Get current page label from nav items
  const currentPage = NAV_ITEMS.find((item) => {
    if (item.href === "/") return pathname === "/";
    return pathname.startsWith(item.href);
  });

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfile(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore
    }
    logout();
    toast.success("Signed out");
    router.push("/login");
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 lg:left-[240px] right-0 h-16 z-20",
        "flex items-center justify-between px-4 md:px-6",
        "bg-white/80 dark:bg-dark-surface-2/80",
        "backdrop-blur-md",
        "border-b border-light-border dark:border-dark-border"
      )}
    >
      {/* ── Left: Hamburger (mobile) + Breadcrumb ────── */}
      <div className="flex items-center gap-3">
        {/* Hamburger — only on mobile */}
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={onMenuClick}
          className={cn(
            "lg:hidden w-9 h-9 rounded-xl flex items-center justify-center",
            "text-light-text-2 dark:text-dark-text-2",
            "hover:bg-light-surface-2 dark:hover:bg-dark-surface",
            "transition-colors duration-150"
          )}
          aria-label="Toggle sidebar"
        >
          <Menu size={18} />
        </motion.button>

        <motion.div
          key={pathname}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25 }}
        >
          <h1 className="text-[15px] font-semibold text-light-text dark:text-dark-text">
            {currentPage?.label ?? "Dashboard"}
          </h1>
        </motion.div>
      </div>

      {/* ── Center: Search ────────────────────────────── */}
      <div className="absolute left-1/2 -translate-x-1/2 w-72 hidden lg:block">
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-light-text-3 dark:text-dark-text-3"
          />
          <input
            type="text"
            placeholder="Search partners, bookings..."
            className={cn(
              "w-full pl-9 pr-4 py-2 text-sm rounded-xl",
              "bg-light-surface-2 dark:bg-dark-surface",
              "border border-light-border dark:border-dark-border",
              "text-light-text dark:text-dark-text",
              "placeholder:text-light-text-3 dark:placeholder:text-dark-text-3",
              "focus:outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/10",
              "transition-all duration-150"
            )}
          />
        </div>
      </div>

      {/* ── Right: Actions ────────────────────────────── */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setShowNotifications((v) => !v);
              setShowProfile(false);
            }}
            className={cn(
              "relative w-9 h-9 rounded-xl flex items-center justify-center",
              "text-light-text-2 dark:text-dark-text-2",
              "hover:bg-light-surface-2 dark:hover:bg-dark-surface",
              "transition-colors duration-150"
            )}
          >
            <Bell size={17} />
            {/* Unread badge */}
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-brand-red text-white text-[9px] font-bold flex items-center justify-center"
            >
              {mockNotifications.filter((n) => n.unread).length}
            </motion.span>
          </motion.button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                variants={dropdownVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className={cn(
                  "absolute right-0 top-11 w-[min(320px,calc(100vw-2rem))] rounded-2xl overflow-hidden z-50",
                  "bg-white dark:bg-dark-surface",
                  "border border-light-border dark:border-dark-border",
                  "shadow-lg dark:shadow-black/30"
                )}
              >
                <div className="px-4 py-3 border-b border-light-border dark:border-dark-border">
                  <p className="font-semibold text-sm text-light-text dark:text-dark-text">
                    Notifications
                  </p>
                </div>
                <div className="divide-y divide-light-border dark:divide-dark-border">
                  {mockNotifications.map((n) => (
                    <div
                      key={n.id}
                      className={cn(
                        "px-4 py-3 hover:bg-light-surface-2 dark:hover:bg-dark-surface-2 cursor-pointer transition-colors",
                        n.unread && "bg-brand-purple-muted/30 dark:bg-brand-purple-muted-dark/30"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        {n.unread && (
                          <div className="w-1.5 h-1.5 rounded-full bg-brand-purple mt-1.5 shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-medium text-light-text dark:text-dark-text">
                            {n.title}
                          </p>
                          <p className="text-[12px] text-light-text-2 dark:text-dark-text-2 mt-0.5 truncate">
                            {n.message}
                          </p>
                          <p className="text-[11px] text-light-text-3 dark:text-dark-text-3 mt-1">
                            {n.time}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2.5 border-t border-light-border dark:border-dark-border">
                  <button className="text-[13px] font-medium text-brand-purple hover:underline">
                    View all notifications
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Divider */}
        <div className="w-px h-5 bg-light-border dark:bg-dark-border mx-1" />

        {/* Profile Dropdown */}
        <div ref={profileRef} className="relative">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              setShowProfile((v) => !v);
              setShowNotifications(false);
            }}
            className={cn(
              "flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl",
              "hover:bg-light-surface-2 dark:hover:bg-dark-surface",
              "transition-colors duration-150"
            )}
          >
            <div className="w-7 h-7 rounded-full bg-brand-purple flex items-center justify-center">
              <span className="text-[10px] font-bold text-white">
                {admin?.name ? getInitials(admin.name) : "SA"}
              </span>
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-[13px] font-medium text-light-text dark:text-dark-text leading-tight">
                {admin?.name ?? "Super Admin"}
              </p>
              <p className="text-[11px] text-light-text-3 dark:text-dark-text-3 leading-tight">
                {admin?.role ?? "SuperAdmin"}
              </p>
            </div>
            <ChevronDown
              size={13}
              className={cn(
                "text-light-text-3 dark:text-dark-text-3 transition-transform duration-200",
                showProfile && "rotate-180"
              )}
            />
          </motion.button>

          <AnimatePresence>
            {showProfile && (
              <motion.div
                variants={dropdownVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className={cn(
                  "absolute right-0 top-11 w-52 rounded-2xl overflow-hidden z-50",
                  "bg-white dark:bg-dark-surface",
                  "border border-light-border dark:border-dark-border",
                  "shadow-lg dark:shadow-black/30"
                )}
              >
                <div className="p-3 border-b border-light-border dark:border-dark-border">
                  <p className="text-[13px] font-medium text-light-text dark:text-dark-text truncate">
                    {admin?.name}
                  </p>
                  <p className="text-[11px] text-light-text-3 dark:text-dark-text-3 truncate mt-0.5">
                    {admin?.email}
                  </p>
                </div>
                <div className="p-1.5">
                  <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-light-text-2 dark:text-dark-text-2 hover:bg-light-surface-2 dark:hover:bg-dark-surface-2 transition-colors">
                    <User size={14} />
                    My Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-brand-red hover:bg-brand-red-muted transition-colors"
                  >
                    <LogOut size={14} />
                    Sign Out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
