import { createFileRoute, useNavigate } from "@tanstack/react-router";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { http } from "@/lib/api";
import { requireSession } from "@/lib/guards";
import { formString } from "@/lib/form";

interface SessionInfo {
  id: string;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  expires_at: string;
  current: boolean;
}

export const Route = createFileRoute("/app/account")({
  beforeLoad: async ({ context }) => {
    const me = await requireSession(context.queryClient, "/app/account");
    return { me };
  },
  component: AccountPage,
});

function AccountPage() {
  const { me } = Route.useRouteContext();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [deleteConfirm, setDeleteConfirm] = useState("");

  const invalidateMe = () => queryClient.invalidateQueries({ queryKey: ["me"] });

  const updateProfile = useMutation({
    mutationFn: (body: { name: string; avatar_url: string }) => http.patch("/api/me", body),
    onSuccess: async () => {
      toast.success("Profil disimpan.");
      await invalidateMe();
    },
    onError: (error) => toast.error(error.message),
  });

  const changePassword = useMutation({
    mutationFn: (body: { current_password: string; new_password: string }) =>
      http.post("/api/me/password", body),
    onSuccess: async () => {
      toast.success("Kata laluan ditukar. Sesi lain telah dilog keluar.");
      await invalidateMe();
    },
    onError: (error) => toast.error(error.message),
  });

  const changeEmail = useMutation({
    mutationFn: (body: { password: string; new_email: string }) => http.post("/api/me/email", body),
    onSuccess: async () => {
      toast.success("Pengesahan dihantar ke email baharu.");
      await invalidateMe();
    },
    onError: (error) => toast.error(error.message),
  });

  const resendVerification = useMutation({
    mutationFn: () => http.post("/api/auth/resend-verification", { email: me.user.email }),
    onSuccess: () => toast.success("Pautan pengesahan dihantar semula."),
    onError: (error) => toast.error(error.message),
  });

  const sessions = useQuery({
    queryKey: ["sessions"],
    queryFn: () => http.get<SessionInfo[]>("/api/me/sessions"),
  });

  const revokeSession = useMutation({
    mutationFn: (sessionId: string) => http.del(`/api/me/sessions/${sessionId}`),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["sessions"] });
      await invalidateMe();
    },
    onError: (error) => toast.error(error.message),
  });

  const revokeOthers = useMutation({
    mutationFn: () => http.del("/api/me/sessions/others"),
    onSuccess: async () => {
      toast.success("Sesi lain dilog keluar.");
      await queryClient.invalidateQueries({ queryKey: ["sessions"] });
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteAccount = useMutation({
    mutationFn: () => http.del("/api/me"),
    onSuccess: () => {
      queryClient.setQueryData(["me"], null);
      void navigate({ to: "/" });
    },
    onError: (error) => toast.error(error.message),
  });

  function onUpdateProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    updateProfile.mutate({
      name: formString(data, "name"),
      avatar_url: formString(data, "avatar_url"),
    });
  }

  function onChangePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    changePassword.mutate({
      current_password: formString(data, "current"),
      new_password: formString(data, "new"),
    });
    (event.target as HTMLFormElement).reset();
  }

  function onChangeEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    changeEmail.mutate({
      password: formString(data, "password"),
      new_email: formString(data, "new_email"),
    });
    (event.target as HTMLFormElement).reset();
  }

  return (
    <>
      <PageHeader title="Akaun" />
      <PageBody>
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Profil</CardTitle>
              <CardDescription>Nama dan avatar anda.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={onUpdateProfile} className="max-w-sm">
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="name">Nama</FieldLabel>
                    <Input
                      id="name"
                      name="name"
                      defaultValue={me.user.name}
                      required
                      maxLength={100}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="avatar_url">URL avatar (opsyen)</FieldLabel>
                    <Input
                      id="avatar_url"
                      name="avatar_url"
                      type="url"
                      placeholder="https://…"
                      defaultValue={me.user.avatar_url ?? ""}
                    />
                  </Field>
                </FieldGroup>
                <Button type="submit" className="mt-4" disabled={updateProfile.isPending}>
                  {updateProfile.isPending ? "Menyimpan…" : "Simpan"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Email
                {me.user.email_verified ? (
                  <Badge>Sah</Badge>
                ) : (
                  <Badge variant="destructive">Belum sah</Badge>
                )}
              </CardTitle>
              <CardDescription>{me.user.email}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              {!me.user.email_verified ? (
                <Alert>
                  <AlertDescription className="flex flex-wrap items-center justify-between gap-2">
                    <span>Sahkan email anda untuk keselamatan akaun.</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => resendVerification.mutate()}
                      disabled={resendVerification.isPending}
                    >
                      Hantar semula
                    </Button>
                  </AlertDescription>
                </Alert>
              ) : null}
              <form onSubmit={onChangeEmail} className="max-w-sm">
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="new_email">Email baharu</FieldLabel>
                    <Input id="new_email" name="new_email" type="email" required />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="email-password">Kata laluan semasa</FieldLabel>
                    <Input
                      id="email-password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                    />
                  </Field>
                </FieldGroup>
                <Button
                  type="submit"
                  className="mt-4"
                  variant="outline"
                  disabled={changeEmail.isPending}
                >
                  {changeEmail.isPending ? "Menghantar…" : "Tukar email"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Kata laluan</CardTitle>
              <CardDescription>
                Menukar kata laluan akan melog keluar semua sesi lain.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={onChangePassword} className="max-w-sm">
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="current">Kata laluan semasa</FieldLabel>
                    <Input
                      id="current"
                      name="current"
                      type="password"
                      autoComplete="current-password"
                      required
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="new">Kata laluan baharu</FieldLabel>
                    <Input
                      id="new"
                      name="new"
                      type="password"
                      autoComplete="new-password"
                      required
                      minLength={8}
                    />
                  </Field>
                </FieldGroup>
                <Button
                  type="submit"
                  className="mt-4"
                  variant="outline"
                  disabled={changePassword.isPending}
                >
                  {changePassword.isPending ? "Menyimpan…" : "Tukar kata laluan"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sesi aktif</CardTitle>
              <CardDescription>Peranti yang sedang log masuk.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2">
              {sessions.data?.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center gap-3 rounded-lg border px-3 py-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm">
                      {session.current ? (
                        <Badge variant="secondary" className="mr-2">
                          Peranti ini
                        </Badge>
                      ) : null}
                      {session.ip_address ?? "IP tidak diketahui"}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {session.user_agent ?? "Agen tidak diketahui"}
                    </p>
                  </div>
                  {!session.current ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => revokeSession.mutate(session.id)}
                    >
                      Log keluar
                    </Button>
                  ) : null}
                </div>
              ))}
              <div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => revokeOthers.mutate()}
                  disabled={revokeOthers.isPending}
                >
                  Log keluar peranti lain
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Zon merah</CardTitle>
            <CardDescription>
              Memadam akaun membuang workspace yang anda miliki dan semua keahlian anda.
            </CardDescription>
          </CardHeader>
          <CardContent className="max-w-md">
            <Field>
              <FieldLabel htmlFor="confirm-delete">Taip DELETE untuk mengesahkan</FieldLabel>
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
                disabled={deleteConfirm !== "DELETE"}
              >
                Padam akaun
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Padam akaun anda?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tindakan ini kekal: akaun, workspace milik anda, dan semua sesi akan dipadam.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction onClick={() => deleteAccount.mutate()}>
                    Padam selama-lamanya
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </PageBody>
    </>
  );
}
