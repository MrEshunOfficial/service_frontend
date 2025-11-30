// types/navigation.types.ts
import { LucideIcon } from "lucide-react";
import { UserRole } from "@/types/base.types";

export interface NavigationLink {
  id: string;
  label: string;
  href?: string;
  icon: LucideIcon;
  roles: UserRole[];
  children?: NavigationLink[];
  action?: "navigate" | "custom";
}

export interface CTAConfig {
  label: string;
  description: string;
  action: () => void;
  roles: UserRole[];
}