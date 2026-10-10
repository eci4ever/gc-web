import { redirect } from "@tanstack/react-router";
import type { QueryClient } from "@tanstack/react-query";

import type { Me } from "@/lib/api";
import { fetchMe } from "@/lib/api";
import { isOrgManager, isPlatformAdmin } from "@/lib/access";

/** Load the session through the query cache (shared with useMe). */
export async function loadMe(queryClient: QueryClient): Promise<Me | null> {
  return queryClient.ensureQueryData({ queryKey: ["me"], queryFn: fetchMe });
}

function loginRedirect(path: string) {
  return redirect({ to: "/login", search: { redirect: path } });
}

export async function requireSession(queryClient: QueryClient, path: string) {
  const me = await loadMe(queryClient);
  if (!me) throw loginRedirect(path);
  return me;
}

export async function requireOrgManager(queryClient: QueryClient, path: string) {
  const me = await requireSession(queryClient, path);
  if (!me.org || !isOrgManager(me.org.role)) throw redirect({ to: "/app" });
  return me;
}

export async function requirePlatformAdmin(queryClient: QueryClient, path: string) {
  const me = await requireSession(queryClient, path);
  if (!isPlatformAdmin(me)) throw redirect({ to: "/app" });
  return me;
}

/** Signed-in users skip the auth pages. */
export async function redirectIfAuthenticated(queryClient: QueryClient) {
  const me = await loadMe(queryClient);
  if (me) throw redirect({ to: "/app" });
  return me;
}
