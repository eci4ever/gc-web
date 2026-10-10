import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { cn } from "cn";

import { PageBody, PageHeader } from "@/components/page-header";
import { requireOrgManager } from "@/lib/guards";

export const Route = createFileRoute("/app/manage")({
  beforeLoad: async ({ context }) => {
    const me = await requireOrgManager(context.queryClient, "/app/manage");
    return { me };
  },
  component: ManageLayout,
});

const TABS = [
  { label: "Ahli", to: "/app/manage" },
  { label: "Jemputan", to: "/app/manage/invitations" },
] as const;

function ManageLayout() {
  const location = useLocation();

  return (
    <>
      <PageHeader title="Urus" />
      <PageBody>
        <div className="flex items-center gap-1">
          {TABS.map((tab) => {
            const active =
              tab.to === "/app/manage"
                ? location.pathname === "/app/manage"
                : location.pathname.startsWith(tab.to);
            return (
              <Link
                key={tab.to}
                to={tab.to}
                className={cn(
                  "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
        <Outlet />
      </PageBody>
    </>
  );
}
