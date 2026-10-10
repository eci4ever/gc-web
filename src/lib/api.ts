import { useQuery } from "@tanstack/react-query";

/** Error thrown for non-2xx API responses; message comes from `{ error }`. */
export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  headers.set("content-type", "application/json");
  const response = await fetch(path, { ...init, headers });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new ApiError(response.status, body?.error ?? response.statusText);
  }

  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}

export const http = {
  get: <T>(path: string) => api<T>(path),
  post: <T>(path: string, body?: unknown) =>
    api<T>(path, {
      method: "POST",
      body: body === undefined ? "{}" : JSON.stringify(body),
    }),
  patch: <T>(path: string, body: unknown) =>
    api<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
  del: <T>(path: string, body?: unknown) =>
    api<T>(path, {
      method: "DELETE",
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
};

// ---------------------------------------------------------------------------
// Session
// ---------------------------------------------------------------------------

export interface User {
  id: string;
  email: string;
  name: string;
  email_verified: boolean;
  avatar_url: string | null;
  is_platform_admin: boolean;
  created_at: string;
}

export interface OrgSummary {
  organization_id: string;
  name: string;
  slug: string;
  role: string;
}

export interface Me {
  user: User;
  impersonated_by: string | null;
  org: OrgSummary | null;
}

export async function fetchMe(): Promise<Me | null> {
  try {
    return await http.get<Me>("/api/auth/me");
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return null;
    }
    throw error;
  }
}

export function useMe() {
  return useQuery({ queryKey: ["me"], queryFn: fetchMe, staleTime: 10_000 });
}

// ---------------------------------------------------------------------------
// Health (landing + sidebar status)
// ---------------------------------------------------------------------------

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
