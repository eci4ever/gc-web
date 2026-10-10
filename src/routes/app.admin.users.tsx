import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { BanIcon, MoreHorizontalIcon, ShieldCheckIcon, UserRoundPlusIcon } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { http } from "@/lib/api";

interface AdminUserInfo {
  id: string;
  email: string;
  name: string;
  email_verified: boolean;
  is_platform_admin: boolean;
  banned: boolean;
  ban_reason: string | null;
  created_at: string;
}

export const Route = createFileRoute("/app/admin/users")({
  component: AdminUsersPage,
});

function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [banTarget, setBanTarget] = useState<AdminUserInfo | null>(null);
  const [banReason, setBanReason] = useState("");
  const [passwordTarget, setPasswordTarget] = useState<AdminUserInfo | null>(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const users = useQuery({
    queryKey: ["admin", "users", search],
    queryFn: () => http.get<AdminUserInfo[]>(`/api/admin/users?q=${encodeURIComponent(search)}`),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin", "users"] });

  const ban = useMutation({
    mutationFn: (body: { user_id: string; reason: string }) =>
      http.post("/api/admin/users/ban", body),
    onSuccess: async () => {
      toast.success("Pengguna dibanned.");
      setBanTarget(null);
      setBanReason("");
      await invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  const unban = useMutation({
    mutationFn: (userId: string) => http.post("/api/admin/users/unban", { user_id: userId }),
    onSuccess: async () => {
      toast.success("Pengguna di-unban.");
      await invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  const setRole = useMutation({
    mutationFn: (body: { user_id: string; role: string }) =>
      http.patch("/api/admin/users/role", body),
    onSuccess: async () => {
      toast.success("Peranan platform dikemas kini.");
      await invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  const setPassword = useMutation({
    mutationFn: (body: { user_id: string; password: string }) =>
      http.post("/api/admin/users/password", body),
    onSuccess: async () => {
      toast.success("Kata laluan ditetapkan; semua sesi dilog keluar.");
      setPasswordTarget(null);
      await invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  const revokeSessions = useMutation({
    mutationFn: (userId: string) => http.del("/api/admin/users/sessions", { user_id: userId }),
    onSuccess: async () => {
      toast.success("Semua sesi dilog keluar.");
      await invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteUser = useMutation({
    mutationFn: (userId: string) => http.del(`/api/admin/users/${userId}`),
    onSuccess: async () => {
      toast.success("Pengguna dipadam.");
      await invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  const impersonate = useMutation({
    mutationFn: (userId: string) => http.post(`/api/admin/users/${userId}/impersonate`),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["me"] });
      await navigate({ to: "/app" });
    },
    onError: (error) => toast.error(error.message),
  });

  return (
    <>
      <PageHeader title="Pengguna" />
      <PageBody>
        <Card>
          <CardHeader>
            <CardTitle>Senarai pengguna</CardTitle>
            <CardDescription>
              Carian mengikut email atau nama; maksimum 50 keputusan.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Input
              placeholder="Cari email atau nama…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="max-w-sm"
            />
            {users.data?.map((user) => (
              <div
                key={user.id}
                className="flex flex-wrap items-center gap-3 rounded-lg border px-3 py-2"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {user.name}
                    {user.is_platform_admin ? <Badge className="ml-2">Admin</Badge> : null}
                    {user.banned ? (
                      <Badge variant="destructive" className="ml-2">
                        Banned
                      </Badge>
                    ) : null}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {user.email}
                    {user.banned && user.ban_reason ? ` — ${user.ban_reason}` : ""}
                  </p>
                </div>
                <Select
                  value={user.is_platform_admin ? "admin" : "user"}
                  onValueChange={(role) => role && setRole.mutate({ user_id: user.id, role })}
                >
                  <SelectTrigger className="w-28" size="sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Pengguna</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
                {user.banned ? (
                  <Button variant="outline" size="sm" onClick={() => unban.mutate(user.id)}>
                    <ShieldCheckIcon data-icon="inline-start" />
                    Unban
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => setBanTarget(user)}>
                    <BanIcon data-icon="inline-start" />
                    Ban
                  </Button>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={<Button variant="ghost" size="icon-sm" aria-label="Menu tindakan" />}
                  >
                    <MoreHorizontalIcon />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem onClick={() => impersonate.mutate(user.id)}>
                      <UserRoundPlusIcon data-icon="inline-start" />
                      Impersonate
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setPasswordTarget(user)}>
                      Tetap kata laluan
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => revokeSessions.mutate(user.id)}>
                      Log keluar semua sesi
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => deleteUser.mutate(user.id)}
                      variant="destructive"
                    >
                      Padam pengguna
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
            {users.data?.length === 0 ? (
              <p className="text-sm text-muted-foreground">Tiada pengguna sepadan.</p>
            ) : null}
          </CardContent>
        </Card>
      </PageBody>

      <AlertDialog
        open={!!banTarget}
        onOpenChange={(open) => {
          if (!open) {
            setBanTarget(null);
            setBanReason("");
          }
        }}
      >
        <AlertDialogTrigger className="hidden" />
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ban {banTarget?.email}?</AlertDialogTitle>
            <AlertDialogDescription>
              Semua sesi aktif akan dilog keluar dan log masuk disekat.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            placeholder="Sebab ban (wajib)"
            value={banReason}
            onChange={(event) => setBanReason(event.target.value)}
          />
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              disabled={!banReason.trim()}
              onClick={() => banTarget && ban.mutate({ user_id: banTarget.id, reason: banReason })}
            >
              Ban
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!passwordTarget}
        onOpenChange={(open) => !open && setPasswordTarget(null)}
      >
        <AlertDialogTrigger className="hidden" />
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tetap kata laluan untuk {passwordTarget?.email}</AlertDialogTitle>
            <AlertDialogDescription>
              Pengguna akan melog masuk dengan kata laluan baharu ini.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <form
            id="admin-set-password"
            onSubmit={(event) => {
              event.preventDefault();
              const password = new FormData(event.currentTarget).get("password");
              if (typeof password === "string" && passwordTarget) {
                setPassword.mutate({ user_id: passwordTarget.id, password });
              }
            }}
          >
            <Input
              name="password"
              type="password"
              required
              minLength={8}
              placeholder="Kata laluan baharu (min 8)"
              autoComplete="new-password"
            />
          </form>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction type="submit" form="admin-set-password">
              Tetap
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
