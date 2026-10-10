import { createFileRoute, Outlet } from "@tanstack/react-router";

import { requirePlatformAdmin } from "@/lib/guards";

export const Route = createFileRoute("/app/admin")({
  beforeLoad: async ({ context }) => {
    const me = await requirePlatformAdmin(context.queryClient, "/app/admin");
    return { me };
  },
  component: () => <Outlet />,
});
