import { createFileRoute } from "@tanstack/react-router";
import { ActivityIcon, DatabaseIcon, ServerIcon } from "lucide-react";

import { StatusCard } from "@/components/status-card";
import { Badge } from "@/components/ui/badge";
import { useHealth } from "@/lib/api";

function LandingPage() {
  const health = useHealth();

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

  const allNormal = apiState === "up" && dbState === "up";

  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground">
      <header className="border-b">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex size-6 items-center justify-center rounded-md bg-primary text-[0.65rem] font-bold text-primary-foreground">
              gc
            </div>
            <span className="font-heading text-sm font-semibold">gc</span>
          </div>
          {health.isPending ? (
            <Badge variant="secondary">
              <ActivityIcon data-icon="inline-start" />
              Memeriksa…
            </Badge>
          ) : allNormal ? (
            <Badge>
              <ActivityIcon data-icon="inline-start" />
              Semua sistem normal
            </Badge>
          ) : (
            <Badge variant="destructive">
              <ActivityIcon data-icon="inline-start" />
              Ada gangguan
            </Badge>
          )}
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto w-full max-w-5xl px-6 py-24 sm:py-32">
          <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
            <Badge variant="outline">vms.nimfi.dev</Badge>
            <h1 className="mt-5 font-heading text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
              Asas moden untuk produk anda.
            </h1>
            <p className="mt-4 max-w-xl text-pretty text-base text-muted-foreground sm:text-lg">
              SPA React dengan TanStack Router, TanStack Query, dan shadcn/ui — bersebelahan API
              Axum yang siap digunakan.
            </p>
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
        </section>
      </main>
    </div>
  );
}

export const Route = createFileRoute("/")({
  component: LandingPage,
});
