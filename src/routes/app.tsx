import { createFileRoute, Outlet } from "@tanstack/react-router";

import { AppSidebar } from "@/components/app-sidebar";
import { ImpersonationBanner } from "@/components/impersonation-banner";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { requireSession } from "@/lib/guards";

export const Route = createFileRoute("/app")({
  beforeLoad: async ({ context }) => {
    const me = await requireSession(context.queryClient, "/app");
    return { me };
  },
  component: AppLayout,
});

function AppLayout() {
  const { me } = Route.useRouteContext();

  return (
    <SidebarProvider>
      <AppSidebar me={me} />
      <SidebarInset>
        <ImpersonationBanner active={!!me.impersonated_by} />
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}
