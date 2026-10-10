import { createFileRoute, Outlet } from "@tanstack/react-router";

import { AppSidebar } from "@/components/app-sidebar";
import { ImpersonationBanner } from "@/components/impersonation-banner";
import { SkipLink } from "@/components/skip-link";
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
      <SkipLink />
      <AppSidebar me={me} />
      <SidebarInset id="main-content">
        <ImpersonationBanner active={!!me.impersonated_by} />
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}
