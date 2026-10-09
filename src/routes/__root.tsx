import { Link, createRootRoute, Outlet } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: () => <Outlet />,
  notFoundComponent: () => (
    <div className="flex min-h-svh flex-col items-center justify-center gap-2">
      <p className="font-heading text-4xl font-semibold">404</p>
      <p className="text-muted-foreground">Halaman tidak dijumpai.</p>
      <Link to="/" className="text-primary underline-offset-4 hover:underline">
        Kembali ke halaman utama
      </Link>
    </div>
  ),
});
