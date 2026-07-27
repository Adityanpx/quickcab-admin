"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { canAccessRoute } from "@/lib/permissions";

export function RequireRole({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { admin, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    if (admin && !canAccessRoute(pathname, admin.role)) {
      router.replace("/");
    }
  }, [pathname, admin, isAuthenticated, router]);

  if (!isAuthenticated) return null;
  if (admin && !canAccessRoute(pathname, admin.role)) return null;

  return <>{children}</>;
}
