import { createFileRoute, Link } from "@tanstack/react-router";
import { DatabaseIcon, ServerIcon } from "lucide-react";

import { BrandMark } from "@/components/brand-mark";
import { SkipLink } from "@/components/skip-link";
import { StatusCard } from "@/components/status-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useHealth, useMe } from "@/lib/api";
import { usePageTitle } from "@/lib/use-page-title";

function LandingPage() {
  const health = useHealth();
  const me = useMe();
  const signedIn = !!me.data;

  usePageTitle("Asas moden untuk produk SaaS anda");

  const apiState = health.isPending
    ? ("loading" as const)
    : health.isError
      ? ("down" as const)
      : ("up" as const);

  const dbState = health.isPending
    ? ("loading" as const)
    : health.data?.health.database
      ? ("up" as const)
      : ("down" as const);

  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground">
      <SkipLink />
      <header className="border-b">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-6">
          <BrandMark />
          <div className="flex items-center gap-2">
            {signedIn ? (
              <Button render={<Link to="/app" />}>Buka aplikasi</Button>
            ) : (
              <>
                <Button variant="ghost" render={<Link to="/login" />}>
                  Log masuk
                </Button>
                <Button render={<Link to="/signup" />}>Daftar</Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main id="main-content" className="flex-1">
        <section className="mx-auto w-full max-w-5xl px-6 py-24 sm:py-32">
          <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
            <Badge variant="outline">vms.nimfi.dev</Badge>
            <h1 className="mt-5 font-heading text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
              Asas moden untuk produk SaaS anda.
            </h1>
            <p className="mt-4 max-w-xl text-pretty text-base text-muted-foreground sm:text-lg">
              Multi-tenant starter: auth, workspace, jemputan, dan panel admin — React + TanStack di
              hadapan, Axum + Postgres di sebaliknya.
            </p>
            {!signedIn ? (
              <div className="mt-6 flex items-center gap-3">
                <Button render={<Link to="/signup" />}>Mula secara percuma</Button>
                <Button variant="outline" render={<Link to="/login" />}>
                  Log masuk
                </Button>
              </div>
            ) : null}
          </div>

          <div className="mx-auto mt-14 grid w-full max-w-2xl gap-4 sm:grid-cols-2">
            <StatusCard
              icon={ServerIcon}
              title="API"
              description="gc-api · /api/health"
              state={apiState}
              latencyMs={health.data?.latencyMs}
              latencyHint="Round-trip diukur dari pelayar anda"
            />
            <StatusCard
              icon={DatabaseIcon}
              title="Pangkalan Data"
              description="PostgreSQL"
              state={dbState}
              latencyMs={health.data?.health.db_latency_ms}
              latencyHint="Pertanyaan ujian diukur di pelayan"
            />
          </div>

          <div className="mx-auto mt-16 grid w-full max-w-2xl gap-3 text-sm text-muted-foreground sm:grid-cols-3">
            <div className="rounded-lg border p-4">
              <p className="font-medium text-foreground">Auth penuh</p>
              <p className="mt-1">
                Daftar, verifikasi email, set semula kata laluan, urus sesi peranti.
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="font-medium text-foreground">Workspace</p>
              <p className="mt-1">
                Multi-tenant dengan role owner/admin/member dan jemputan email.
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="font-medium text-foreground">Panel admin</p>
              <p className="mt-1">Urus pengguna, organisasi, impersonation, dan log audit.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-6">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-center gap-4 px-6 text-sm text-muted-foreground">
          <Link to="/terms" className="hover:text-foreground">
            Terma
          </Link>
          <Link to="/privacy" className="hover:text-foreground">
            Privasi
          </Link>
        </div>
      </footer>
    </div>
  );
}

export const Route = createFileRoute("/")({
  component: LandingPage,
});
