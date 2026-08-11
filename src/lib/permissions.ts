export type AdminRole = "SUPERADMIN" | "SUBADMIN";

export const ROUTE_PERMISSIONS: Record<string, AdminRole[]> = {
  "/": ["SUPERADMIN", "SUBADMIN"],
  "/partners": ["SUPERADMIN", "SUBADMIN"],
  "/providers": ["SUPERADMIN", "SUBADMIN"],
  "/kyc": ["SUPERADMIN", "SUBADMIN"],
  "/kyc-approval-tracker": ["SUPERADMIN", "SUBADMIN"],
  "/bookings": ["SUPERADMIN", "SUBADMIN"],
  "/role-upgrades": ["SUPERADMIN"],
  "/incomplete-signups": ["SUPERADMIN"],
  "/wallet": ["SUPERADMIN"],
  "/referral-links": ["SUPERADMIN"],
  "/ratings": ["SUPERADMIN"],
  "/subscriptions": ["SUPERADMIN"],
  "/notifications": ["SUPERADMIN"],
  "/ads": ["SUPERADMIN"],
  "/announcements": ["SUPERADMIN"],
  "/support": ["SUPERADMIN", "SUBADMIN"],
  "/settings": ["SUPERADMIN"],
  "/subadmin-logs": ["SUPERADMIN"],
};

export function canAccessRoute(pathname: string, role: string | undefined): boolean {
  if (!role) return false;
  const normalizedRole = role.toUpperCase() as AdminRole;
  // Find the longest matching prefix so nested routes (e.g. /bookings/123) inherit the parent's permission
  const matches = Object.keys(ROUTE_PERMISSIONS)
    .filter((route) => (route === "/" ? pathname === "/" : pathname.startsWith(route)))
    .sort((a, b) => b.length - a.length);
  const matchedRoute = matches[0];
  if (!matchedRoute) return true; // unknown routes default to allowed; tighten later if needed
  return ROUTE_PERMISSIONS[matchedRoute].includes(normalizedRole);
}
