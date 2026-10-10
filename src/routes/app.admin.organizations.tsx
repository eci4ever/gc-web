import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { PageBody, PageHeader } from "@/components/page-header";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { MoreHorizontalIcon } from "lucide-react";

import { http } from "@/lib/api";

interface AdminOrgInfo {
  id: string;
  name: string;
  slug: string;
  member_count: number;
  owner_email: string | null;
  created_at: string;
}

export const Route = createFileRoute("/app/admin/organizations")({
  component: AdminOrganizationsPage,
});

function AdminOrganizationsPage() {
  const [search, setSearch] = useState("");
  const [renameTarget, setRenameTarget] = useState<AdminOrgInfo | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminOrgInfo | null>(null);
  const queryClient = useQueryClient();

  const orgs = useQuery({
    queryKey: ["admin", "organizations", search],
    queryFn: () =>
      http.get<AdminOrgInfo[]>(`/api/admin/organizations?q=${encodeURIComponent(search)}`),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin", "organizations"] });

  const rename = useMutation({
    mutationFn: (body: { organization_id: string; name: string }) =>
      http.patch("/api/admin/organizations/rename", body),
    onSuccess: async () => {
      toast.success("Workspace dinamakan semula.");
      setRenameTarget(null);
      await invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  const remove = useMutation({
    mutationFn: (organizationId: string) => http.del(`/api/admin/organizations/${organizationId}`),
    onSuccess: async () => {
      toast.success("Workspace dipadam.");
      setDeleteTarget(null);
      await invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  function onRename(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = new FormData(event.currentTarget).get("name");
    if (typeof name === "string" && renameTarget) {
      rename.mutate({ organization_id: renameTarget.id, name });
    }
  }

  return (
    <>
      <PageHeader title="Organisasi" />
      <PageBody>
        <Card>
          <CardHeader>
            <CardTitle>Semua workspace</CardTitle>
            <CardDescription>Carian mengikut nama, slug, atau email owner.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Input
              placeholder="Cari nama / slug / owner…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="max-w-sm"
            />
            {orgs.data?.map((org) => (
              <div
                key={org.id}
                className="flex flex-wrap items-center gap-3 rounded-lg border px-3 py-2"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{org.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {org.slug} · {org.member_count} ahli · owner: {org.owner_email ?? "—"}
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={<Button variant="ghost" size="icon-sm" aria-label="Menu tindakan" />}
                  >
                    <MoreHorizontalIcon />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => setRenameTarget(org)}>
                      Namakan semula
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setDeleteTarget(org)} variant="destructive">
                      Padam
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
            {orgs.data?.length === 0 ? (
              <p className="text-sm text-muted-foreground">Tiada organisasi sepadan.</p>
            ) : null}
          </CardContent>
        </Card>
      </PageBody>

      <AlertDialog open={!!renameTarget} onOpenChange={(open) => !open && setRenameTarget(null)}>
        <AlertDialogTrigger className="hidden" />
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Namakan semula "{renameTarget?.name}"</AlertDialogTitle>
          </AlertDialogHeader>
          <form id="admin-rename-org" onSubmit={onRename} className="grid gap-2">
            <Input
              name="name"
              required
              maxLength={100}
              defaultValue={renameTarget?.name}
              key={renameTarget?.id}
            />
          </form>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction type="submit" form="admin-rename-org">
              Simpan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogTrigger className="hidden" />
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Padam "{deleteTarget?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              Semua ahli dan jemputan workspace ini akan dibuang. Tindakan ini kekal.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteTarget && remove.mutate(deleteTarget.id)}>
              Padam
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
