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
  Ticket,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
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
    label: "KYC Queue",
    href: "/kyc",
    icon: FileCheck,
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
  },
  {
    label: "Ratings",
    href: "/ratings",
    icon: Star,
  },
  {
    label: "Subscriptions",
    href: "/subscriptions",
    icon: CreditCard,
  },
  {
    label: "Notifications",
    href: "/notifications",
    icon: Bell,
  },
  {
    label: "Advertisements",
    href: "/ads",
    icon: Megaphone,
  },
  {
    label: "Support Tickets",
    href: "/support",
    icon: Ticket,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
  },
];
