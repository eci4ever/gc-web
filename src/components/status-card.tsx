import type { LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export type ServiceState = "loading" | "up" | "down";

function formatLatency(ms: number): string {
  return ms < 10 ? ms.toFixed(1) : Math.round(ms).toString();
}

interface StatusCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  state: ServiceState;
  latencyMs?: number;
  latencyHint: string;
}

export function StatusCard({
  icon: Icon,
  title,
  description,
  state,
  latencyMs,
  latencyHint,
}: StatusCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="size-4 text-muted-foreground" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
        <CardAction>
          {state === "loading" ? (
            <Skeleton className="h-5 w-16 rounded-4xl" />
          ) : state === "up" ? (
            <Badge>Operasi</Badge>
          ) : (
            <Badge variant="destructive">Gangguan</Badge>
          )}
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-1">
        {state === "loading" ? (
          <Skeleton className="h-9 w-24" />
        ) : state === "up" && latencyMs !== undefined ? (
          <div className="flex items-baseline gap-1.5">
            <span className="font-heading text-3xl font-medium tabular-nums">
              {formatLatency(latencyMs)}
            </span>
            <span className="text-sm text-muted-foreground">ms</span>
          </div>
        ) : (
          <span className="font-heading text-3xl font-medium text-muted-foreground">—</span>
        )}
        <p className="text-xs text-muted-foreground">{latencyHint}</p>
      </CardContent>
    </Card>
  );
}
