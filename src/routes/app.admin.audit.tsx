import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { PageBody, PageHeader } from "@/components/page-header";
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

export const Route = createFileRoute("/app/admin/audit")({
  component: AdminAuditPage,
});

function AdminAuditPage() {
  const [filter, setFilter] = useState("");

  const audit = useQuery({
    queryKey: ["admin", "audit"],
    queryFn: () => http.get<AuditEntry[]>("/api/admin/audit"),
    refetchInterval: 15_000,
  });

  const entries = (audit.data ?? []).filter((entry) => {
    if (!filter) return true;
    const haystack = [entry.actor_email, entry.target_email, entry.action, entry.detail ?? ""]
      .join(" ")
      .toLowerCase();
    return haystack.includes(filter.toLowerCase());
  });

  return (
    <>
      <PageHeader title="Audit" />
      <PageBody>
        <Card>
          <CardHeader>
            <CardTitle>50 tindakan terkini</CardTitle>
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
      </PageBody>
    </>
  );
}
