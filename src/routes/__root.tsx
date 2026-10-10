import type { QueryClient } from "@tanstack/react-query";
import { Link, createRootRouteWithContext, Outlet } from "@tanstack/react-router";

import { Toaster } from "@/components/ui/sonner";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  component: () => (
    <>
      <Outlet />
      <Toaster position="top-center" />
    </>
  ),
  notFoundComponent: () => (
    <main className="flex min-h-svh flex-col items-center justify-center gap-2">
      <p className="font-heading text-4xl font-semibold">404</p>
      <p className="text-muted-foreground">Halaman tidak dijumpai.</p>
      <Link to="/" className="text-primary underline-offset-4 hover:underline">
        Kembali ke halaman utama
      </Link>
    </main>
  ),
});
