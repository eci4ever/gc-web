import { useQuery } from "@tanstack/react-query";

export interface Health {
  status: "ok" | "degraded";
  database: boolean;
  /** Tempoh pertanyaan ujian DB di pelayan, dalam milisaat. */
  db_latency_ms: number;
}

export interface HealthSnapshot {
  health: Health;
  /** Round-trip penuh dari pelayar, diukur dengan performance.now(). */
  latencyMs: number;
}

export async function fetchHealth(): Promise<HealthSnapshot> {
  const start = performance.now();
  const response = await fetch("/api/health");
  const latencyMs = performance.now() - start;
  if (!response.ok) {
    throw new Error(`API responded with ${response.status}`);
  }
  return { health: (await response.json()) as Health, latencyMs };
}

export function useHealth() {
  return useQuery({
    queryKey: ["health"],
    queryFn: fetchHealth,
    refetchInterval: 10_000,
    refetchOnWindowFocus: true,
    staleTime: 5_000,
    retry: 1,
  });
}
