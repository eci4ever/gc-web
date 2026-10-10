import {
  Building2Icon,
  GaugeIcon,
  LayoutDashboardIcon,
  ScrollTextIcon,
  SettingsIcon,
  ShieldIcon,
  type LucideIcon,
} from "lucide-react";

import type { Me } from "@/lib/api";

/** Roles inside a workspace. */
export type OrgRole = "owner" | "admin" | "member";

export const ORG_ROLES: readonly OrgRole[] = ["owner", "admin", "member"];

export function isOrgRole(value: string): value is OrgRole {
  return (ORG_ROLES as readonly string[]).includes(value);
}

/** Owners and org admins manage the workspace. */
export function isOrgManager(role: string | null | undefined): boolean {
  return role === "owner" || role === "admin";
}

export function isOrgOwner(role: string | null | undefined): boolean {
  return role === "owner";
}

export function isPlatformAdmin(me: Me | null): boolean {
  return me?.user.is_platform_admin === true;
}

export function roleLabel(role: string): string {
  switch (role) {
    case "owner":
      return "Owner";
    case "admin":
      return "Admin";
    case "member":
      return "Member";
    default:
      return role;
  }
}

// ---------------------------------------------------------------------------
// Navigation matrix — single source of truth for the sidebar AND the route
// guards, so hiding an entry and blocking its URL can never drift apart.
// ---------------------------------------------------------------------------

export type NavGroup = "workspace" | "manage" | "administration";

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  group: NavGroup;
  visible: (me: Me | null) => boolean;
};

export const NAV_ITEMS: NavItem[] = [
  {
    title: "Dashboard",
    href: "/app",
    icon: LayoutDashboardIcon,
    group: "workspace",
    visible: () => true,
  },
  {
    title: "Overview",
    href: "/app/manage",
    icon: GaugeIcon,
    group: "manage",
    visible: (me) => isOrgManager(me?.org?.role),
  },
  {
    title: "Settings",
    href: "/app/settings",
    icon: SettingsIcon,
    group: "manage",
    visible: (me) => isOrgManager(me?.org?.role),
  },
  {
    title: "Users",
    href: "/app/admin/users",
    icon: ShieldIcon,
    group: "administration",
    visible: (me) => isPlatformAdmin(me),
  },
  {
    title: "Organizations",
    href: "/app/admin/organizations",
    icon: Building2Icon,
    group: "administration",
    visible: (me) => isPlatformAdmin(me),
  },
  {
    title: "Audit",
    href: "/app/admin/audit",
    icon: ScrollTextIcon,
    group: "administration",
    visible: (me) => isPlatformAdmin(me),
  },
];

export const NAV_GROUP_LABELS: Record<NavGroup, string> = {
  workspace: "Workspace",
  manage: "Urus",
  administration: "Administrasi",
};

export function navItemsFor(me: Me | null): NavItem[] {
  return NAV_ITEMS.filter((item) => item.visible(me));
}
