import { Link, useLocation } from "@tanstack/react-router";

import { WorkspaceSwitcher } from "@/components/workspace-switcher";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import type { Me } from "@/lib/api";
import { NAV_GROUP_LABELS, navItemsFor, type NavGroup } from "@/lib/access";

const GROUP_ORDER: NavGroup[] = ["workspace", "manage", "administration"];

export function AppSidebar({ me }: { me: Me }) {
  const location = useLocation();
  const items = navItemsFor(me);

  return (
    <Sidebar>
      <SidebarHeader>
        <WorkspaceSwitcher />
      </SidebarHeader>
      <SidebarContent>
        {GROUP_ORDER.map((group) => {
          const groupItems = items.filter((item) => item.group === group);
          if (groupItems.length === 0) return null;
          return (
            <SidebarGroup key={group}>
              <SidebarGroupLabel>{NAV_GROUP_LABELS[group]}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {groupItems.map((item) => {
                    const active =
                      item.href === "/app"
                        ? location.pathname === "/app"
                        : location.pathname.startsWith(item.href);
                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton isActive={active} render={<Link to={item.href} />}>
                          <item.icon />
                          <span>{item.title}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>
      <SidebarFooter>
        <NavUser me={me} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
