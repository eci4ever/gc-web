import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { PageBody, PageHeader } from "@/components/page-header";
import { TablePagination } from "@/components/table-pagination";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { http } from "@/lib/api";

interface AuditEntry {
  id: string;
  created_at: string;
  actor_email: string;
  action: string;
  target_email: string;
  detail: string | null;
}

type AuditSearch = { q?: string; page: number };

function parsePage(value: unknown): number {
  const page = Number(value);
  return Number.isFinite(page) && page >= 1 ? Math.floor(page) : 1;
}

export const Route = createFileRoute("/app/admin/audit")({
  validateSearch: (search: Record<string, unknown>): AuditSearch => ({
    q: typeof search.q === "string" ? search.q : undefined,
    page: search.page === undefined ? 1 : parsePage(search.page),
  }),
  component: AdminAuditPage,
});

interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
}

function AdminAuditPage() {
  const { q, page } = Route.useSearch();
  const navigate = Route.useNavigate();
  const filter = q ?? "";

  const setFilter = (value: string) => {
    void navigate({
      search: (prev) => ({ ...prev, q: value || undefined, page: 1 }),
      replace: true,
    });
  };

  const setPage = (next: number) => {
    void navigate({
      search: (prev) => ({ ...prev, page: next > 1 ? next : 1 }),
    });
  };

  const audit = useQuery({
    queryKey: ["admin", "audit", page],
    queryFn: () => http.get<Paginated<AuditEntry>>(`/api/admin/audit?page=${page}`),
    refetchInterval: 15_000,
  });

  const entries = (audit.data?.data ?? []).filter((entry) => {
    if (!filter) return true;
    const haystack = [entry.actor_email, entry.target_email, entry.action, entry.detail ?? ""]
      .join(" ")
      .toLowerCase();
    return haystack.includes(filter.toLowerCase());
  });

  const totalPages = Math.max(
    1,
    Math.ceil((audit.data?.total ?? 0) / (audit.data?.per_page ?? 50)),
  );

  return (
    <>
      <PageHeader title="Audit" />
      <PageBody>
        <Card>
          <CardHeader>
            <CardTitle>Tindakan terkini</CardTitle>
            <CardDescription>
              Tapisan klien atas aktor, sasaran, tindakan, dan sebab.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="tapis-audit" className="sr-only">
                Tapis entri audit
              </Label>
              <Input
                id="tapis-audit"
                name="q"
                type="search"
                autoComplete="off"
                spellCheck={false}
                placeholder="Tapis…"
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
                className="max-w-sm"
              />
            </div>
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="flex flex-wrap items-center gap-2 rounded-lg border px-3 py-2 text-sm"
              >
                <Badge variant="outline">{entry.action}</Badge>
                <span className="text-muted-foreground">
                  {entry.actor_email} → <strong>{entry.target_email}</strong>
                  {entry.detail ? ` — ${entry.detail}` : ""}
                </span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {new Date(entry.created_at).toLocaleString()}
                </span>
              </div>
            ))}
            {entries.length === 0 ? (
              <p className="text-sm text-muted-foreground">Tiada entri.</p>
            ) : null}
          </CardContent>
        </Card>

        <TablePagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </PageBody>
    </>
  );
}
