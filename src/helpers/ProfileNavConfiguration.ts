// config/navigation.config.ts
import {
  User,
  Heart,
  Settings,
  CreditCard,
  Bell,
  HelpCircle,
  Briefcase,
  ShoppingBag,
  TrendingUp,
  Edit,
  Shield,
  FileText,
  BarChart3,
  Wallet,
  Star,
  Package,
  ToolCaseIcon,
} from "lucide-react";
import { UserRole } from "@/types/base.types";
import { NavigationLink } from "./ProfNavigationLinksTypes";

export const UNIFIED_NAVIGATION_CONFIG: NavigationLink[] = [
  {
    id: "profile",
    label: "Dashboard",
    icon: User,
    href: "/profile",
    roles: [UserRole.CUSTOMER, UserRole.PROVIDER],
    children: [
      {
        id: "profile-view",
        label: "View Dashboard",
        icon: User,
        href: "/profile",
        roles: [UserRole.CUSTOMER, UserRole.PROVIDER],
      },
      {
        id: "profile-edit",
        label: "Update Profile",
        icon: Edit,
        href: "/profile/edit",
        roles: [UserRole.CUSTOMER, UserRole.PROVIDER],
      },
    ],
  },
  {
    id: "orders",
    label: "My Orders",
    icon: ShoppingBag,
    href: "/orders",
    roles: [UserRole.CUSTOMER],
    children: [
      {
        id: "orders-active",
        label: "Active Orders",
        icon: Package,
        href: "/orders/active",
        roles: [UserRole.CUSTOMER],
      },
      {
        id: "orders-history",
        label: "Order History",
        icon: FileText,
        href: "/orders/history",
        roles: [UserRole.CUSTOMER],
      },
    ],
  },
  {
    id: "services",
    label: "My Services",
    icon: Briefcase,
    href: "/services",
    roles: [UserRole.PROVIDER],
    children: [
      {
        id: "services-manage",
        label: "Manage Services",
        icon: Briefcase,
        href: "/service-offered",
        roles: [UserRole.PROVIDER],
      },
      {
        id: "services-create",
        label: "Create Service",
        icon: Edit,
        href: "/service-offered/create",
        roles: [UserRole.PROVIDER],
      },
    ],
  },
  {
    id: "tasks",
    label: "Tasks",
    icon: ToolCaseIcon,
    href: "/tasks",
    roles: [UserRole.PROVIDER],
    children: [
      {
        id: "tasks-available",
        label: "Available Tasks",
        icon: FileText,
        href: "/tasks/available",
        roles: [UserRole.PROVIDER],
      },
      {
        id: "tasks-recent",
        label: "Recently Posted",
        icon: TrendingUp,
        href: "/tasks/recently-posted",
        roles: [UserRole.PROVIDER],
      },
    ],
  },
  {
    id: "favorites",
    label: "Favorites",
    icon: Heart,
    href: "/favorites",
    roles: [UserRole.CUSTOMER],
  },
  {
    id: "dashboard",
    label: "Business Dashboard",
    icon: TrendingUp,
    href: "/dashboard",
    roles: [UserRole.PROVIDER],
    children: [
      {
        id: "dashboard-overview",
        label: "Overview",
        icon: BarChart3,
        href: "/dashboard/overview",
        roles: [UserRole.PROVIDER],
      },
      {
        id: "dashboard-earnings",
        label: "Earnings",
        icon: Wallet,
        href: "/dashboard/earnings",
        roles: [UserRole.PROVIDER],
      },
      {
        id: "dashboard-reviews",
        label: "Reviews",
        icon: Star,
        href: "/dashboard/reviews",
        roles: [UserRole.PROVIDER],
      },
    ],
  },
  {
    id: "payment",
    label: "Payment Methods",
    icon: CreditCard,
    href: "/payment",
    roles: [UserRole.CUSTOMER],
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: Bell,
    href: "/notifications",
    roles: [UserRole.CUSTOMER, UserRole.PROVIDER],
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    href: "/settings",
    roles: [UserRole.CUSTOMER, UserRole.PROVIDER],
  },
  {
    id: "help",
    label: "Help & Support",
    icon: HelpCircle,
    href: "/help",
    roles: [UserRole.CUSTOMER, UserRole.PROVIDER],
  }
];

// Helper function to filter navigation by user role
export const getNavigationByRole = (role: UserRole): NavigationLink[] => {
  return UNIFIED_NAVIGATION_CONFIG.filter((link) =>
    link.roles.includes(role)
  ).map((link) => ({
    ...link,
    children: link.children?.filter((child) => child.roles.includes(role)),
  }));
};