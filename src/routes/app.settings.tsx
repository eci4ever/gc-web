import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, type FormEvent } from "react";
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
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { http } from "@/lib/api";
import { requireOrgManager } from "@/lib/guards";
import { UnsavedChangesDialog } from "@/components/unsaved-changes-dialog";
import { formString } from "@/lib/form";

interface OrgDetail {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  is_default: boolean;
  my_role: string;
}

export const Route = createFileRoute("/app/settings")({
  beforeLoad: async ({ context }) => {
    const me = await requireOrgManager(context.queryClient, "/app/settings");
    return { me };
  },
  component: SettingsPage,
});

function SettingsPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [dirty, setDirty] = useState(false);

  const org = useQuery({
    queryKey: ["org"],
    queryFn: () => http.get<OrgDetail>("/api/organizations/current"),
  });

  const update = useMutation({
    mutationFn: (body: { name?: string; slug?: string; logo?: string }) =>
      http.patch("/api/organizations/current", body),
    onSuccess: async () => {
      setDirty(false);
      toast.success("Workspace dikemas kini.");
      await queryClient.invalidateQueries({ queryKey: ["org"] });
      await queryClient.invalidateQueries({ queryKey: ["me"] });
    },
    onError: (error) => toast.error(error.message),
  });

  const remove = useMutation({
    mutationFn: () => http.del("/api/organizations/current"),
    onSuccess: async () => {
      setDirty(false);
      toast.success("Workspace dipadam.");
      await queryClient.invalidateQueries({ queryKey: ["me"] });
      await navigate({ to: "/app" });
    },
    onError: (error) => toast.error(error.message),
  });

  function onUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    update.mutate({
      name: formString(data, "name"),
      slug: formString(data, "slug"),
      logo: formString(data, "logo"),
    });
  }

  const detail = org.data;
  const canDelete = !!detail && !detail.is_default;

  // Sync the type-to-confirm input once the workspace name loads.
  useEffect(() => {
    setDeleteConfirm("");
  }, [detail?.id]);

  return (
    <>
      <PageHeader title="Tetapan" />
      <PageBody>
        <Card>
          <CardHeader>
            <CardTitle>Workspace</CardTitle>
            <CardDescription>Nama, slug, dan logo workspace aktif ini.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onUpdate} onChange={() => setDirty(true)} className="max-w-md">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="name">Nama</FieldLabel>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={detail?.name}
                    required
                    maxLength={100}
                    key={detail?.id ?? "loading"}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="slug">Slug</FieldLabel>
                  <Input
                    id="slug"
                    name="slug"
                    defaultValue={detail?.slug}
                    key={`slug-${detail?.id ?? "loading"}`}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="logo">URL logo (opsyen)</FieldLabel>
                  <Input
                    id="logo"
                    name="logo"
                    type="url"
                    placeholder="https://…"
                    defaultValue={detail?.logo ?? ""}
                    key={`logo-${detail?.id ?? "loading"}`}
                  />
                </Field>
              </FieldGroup>
              <Button type="submit" className="mt-4" disabled={update.isPending}>
                {update.isPending ? (
                  <>
                    <Spinner data-icon="inline-start" />
                    Menyimpan…
                  </>
                ) : (
                  "Simpan"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Zon merah</CardTitle>
            <CardDescription>
              {detail?.is_default
                ? "Workspace peribadi lalai tidak boleh dipadam."
                : "Memadam workspace membuang semua ahli dan jemputan."}
            </CardDescription>
          </CardHeader>
          {canDelete ? (
            <CardContent className="max-w-md">
              <Field>
                <FieldLabel htmlFor="confirm-delete">
                  Taip "{detail?.name}" untuk mengesahkan
                </FieldLabel>
                <Input
                  id="confirm-delete"
                  value={deleteConfirm}
                  onChange={(event) => setDeleteConfirm(event.target.value)}
                  autoComplete="off"
                />
              </Field>
              <AlertDialog>
                <AlertDialogTrigger
                  render={<Button variant="destructive" className="mt-3" />}
                  disabled={deleteConfirm !== detail?.name}
                >
                  Padam workspace
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Padam workspace "{detail?.name}"?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tindakan ini kekal dan tidak boleh diundur.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Batal</AlertDialogCancel>
                    <AlertDialogAction onClick={() => remove.mutate()}>
                      Padam selama-lamanya
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          ) : null}
        </Card>
      </PageBody>

      <UnsavedChangesDialog dirty={dirty} />
    </>
  );
}
