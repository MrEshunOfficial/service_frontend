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
        label: `${UserRole.CUSTOMER ? "Customer" : "Provider"} Profile`,
        icon: User,
        href: "/profile",
        roles: [UserRole.CUSTOMER, UserRole.PROVIDER],
      },
      {
        id: "profile-edit",
        label: `"Update" ${UserRole.CUSTOMER ? "Customer" : "Provider"} Profile`,
        icon: Edit,
        href: "/profile/edit",
        roles: [UserRole.CUSTOMER, UserRole.PROVIDER],
      },
    ],
  },
  {
    id: "bookings",
    label: "My Bookings",
    icon: ShoppingBag,
    href: "/client",
    roles: [UserRole.CUSTOMER],
    children: [
      {
        id: "client-bookings",
        label: "My Bookings",
        icon: Package,
        href: "/client",
        roles: [UserRole.CUSTOMER],
      },
      {
        id: "client-history",
        label: "History",
        icon: FileText,
        href: "/client/history",
        roles: [UserRole.CUSTOMER],
      },
    ],
  },

  {
    id: "tasks",
    label: "Tasks",
    icon: ToolCaseIcon,
    href: "/tasks",
    roles: [UserRole.CUSTOMER],
    children: [
      {
        id: "my-tasks",
        label: "Posted",
        icon: FileText,
        href: "/client/tasks/posted",
        roles: [UserRole.CUSTOMER],
      },
      {
        id: "tasks-history",
        label: "Tasks",
        icon: FileText,
        href: "/client/tasks/history",
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
        label: "My Services",
        icon: Briefcase,
        href: "/provider/services",
        roles: [UserRole.PROVIDER],
      },
      {
        id: "services-create",
        label: "Create Service",
        icon: Edit,
        href: "/provider/services/create",
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
        label: "Task Pool",
        icon: FileText,
        href: "/provider/tasks/available",
        roles: [UserRole.PROVIDER],
      },

      {
        id: "tasks-requested",
        label: "Requests",
        icon: TrendingUp,
        href: "/provider/tasks/requested",
        roles: [UserRole.PROVIDER],
      },
      {
        id: "tasks-recent",
        label: "matched history",
        icon: TrendingUp,
        href: "/provider/tasks/matched",
        roles: [UserRole.PROVIDER],
      },
      {
        id: "booked-tasks",
        label: "bookings",
        icon: FileText,
        href: "/provider/bookings",
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
    href: "/settings/provider",
    roles: [UserRole.PROVIDER],
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    href: "/settings/client",
    roles: [UserRole.CUSTOMER],
  },
  {
    id: "help",
    label: "Help & Support",
    icon: HelpCircle,
    href: "/help",
    roles: [UserRole.CUSTOMER, UserRole.PROVIDER],
  },
];

// Helper function to filter navigation by user role
export const getNavigationByRole = (role: UserRole): NavigationLink[] => {
  return UNIFIED_NAVIGATION_CONFIG.filter((link) =>
    link.roles.includes(role),
  ).map((link) => ({
    ...link,
    children: link.children?.filter((child) => child.roles.includes(role)),
  }));
};
