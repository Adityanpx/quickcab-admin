import {
  LayoutDashboard,
  Users,
  FileCheck,
  BookOpen,
  Wallet,
  Star,
  CreditCard,
  Bell,
  Megaphone,
  Radio,
  Ticket,
  Settings,
  Activity,
  Wrench,
  Share2,
  ArrowUpCircle,
  UserX,
  ClipboardCheck,
  type LucideIcon,
} from "lucide-react";
import type { AdminRole } from "@/lib/permissions";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  roles?: AdminRole[];
}

export interface NavGroup {
  group: string;
  items: NavItem[];
}

export const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    label: "Partners",
    href: "/partners",
    icon: Users,
  },
  {
    label: "Service Providers",
    href: "/providers",
    icon: Wrench,
  },
  {
    label: "KYC Queue",
    href: "/kyc",
    icon: FileCheck,
  },
  {
    label: "KYC Approval Tracker",
    href: "/kyc-approval-tracker",
    icon: ClipboardCheck,
    roles: ["SUPERADMIN", "SUBADMIN"],
  },
  {
    label: "Upgrades To Partner",
    href: "/role-upgrades",
    icon: ArrowUpCircle,
    roles: ["SUPERADMIN"],
  },
  {
    label: "Incomplete Signups",
    href: "/incomplete-signups",
    icon: UserX,
    roles: ["SUPERADMIN"],
  },
  {
    label: "Bookings",
    href: "/bookings",
    icon: BookOpen,
  },
  {
    label: "Wallet & Payouts",
    href: "/wallet",
    icon: Wallet,
    roles: ["SUPERADMIN"],
  },
  {
    label: "Referral Management",
    href: "/referral-links",
    icon: Share2,
    roles: ["SUPERADMIN"],
  },
  {
    label: "Ratings",
    href: "/ratings",
    icon: Star,
    roles: ["SUPERADMIN"],
  },
  {
    label: "Subscriptions",
    href: "/subscriptions",
    icon: CreditCard,
    roles: ["SUPERADMIN"],
  },
  {
    label: "Notifications",
    href: "/notifications",
    icon: Bell,
    roles: ["SUPERADMIN"],
  },
  {
    label: "Advertisements",
    href: "/ads",
    icon: Megaphone,
    roles: ["SUPERADMIN"],
  },
  {
    label: "Announcements",
    href: "/announcements",
    icon: Radio,
    roles: ["SUPERADMIN"],
  },
  {
    label: "Support Tickets",
    href: "/support",
    icon: Ticket,
    roles: ["SUPERADMIN", "SUBADMIN"],
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
    roles: ["SUPERADMIN"],
  },
  {
    label: "SubAdmin Logs",
    href: "/subadmin-logs",
    icon: Activity,
    roles: ["SUPERADMIN"],
  },
  {
    label: "My Activity",
    href: "/my-activity",
    icon: Activity,
  },
];
