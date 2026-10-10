import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { http } from "@/lib/api";
import type { OrgRole } from "@/lib/access";
import { formString } from "@/lib/form";

interface MemberInfo {
  id: string;
  user_id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  role: OrgRole;
  joined_at: string;
}

interface OrgDetail {
  id: string;
  name: string;
  slug: string;
  is_default: boolean;
  my_role: OrgRole;
  members: MemberInfo[];
}

export const Route = createFileRoute("/app/manage/")({
  component: MembersPage,
});

function MembersPage() {
  const { me } = Route.useRouteContext();
  const queryClient = useQueryClient();
  const [confirmRemove, setConfirmRemove] = useState<MemberInfo | null>(null);

  const org = useQuery({
    queryKey: ["org"],
    queryFn: () => http.get<OrgDetail>("/api/organizations/current"),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["org"] });

  const invite = useMutation({
    mutationFn: (body: { email: string; role: string }) =>
      http.post("/api/organizations/current/invitations", body),
    onSuccess: async (_data, variables) => {
      toast.success(`Jemputan dihantar ke ${variables.email}.`);
      await invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  const updateRole = useMutation({
    mutationFn: (body: { memberId: string; role: string }) =>
      http.patch(`/api/organizations/current/members/${body.memberId}`, {
        role: body.role,
      }),
    onSuccess: async () => {
      await invalidate();
      toast.success("Peranan dikemas kini.");
    },
    onError: async (error) => {
      await invalidate();
      toast.error(error.message);
    },
  });

  const removeMember = useMutation({
    mutationFn: (memberId: string) => http.del(`/api/organizations/current/members/${memberId}`),
    onSuccess: async () => {
      setConfirmRemove(null);
      await invalidate();
      toast.success("Ahli dibuang.");
    },
    onError: (error) => toast.error(error.message),
  });

  function onInvite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = formString(data, "email");
    const role = formString(data, "role") || "member";
    if (email) invite.mutate({ email, role });
    (event.target as HTMLFormElement).reset();
  }

  const detail = org.data;
  const iAmOwner = detail?.my_role === "owner";
  const ownerCount = detail?.members.filter((m) => m.role === "owner").length ?? 0;

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Jemput ahli</CardTitle>
          <CardDescription>
            Email jemputan dihantar melalui Resend; pautan boleh disalin pada tab Jemputan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onInvite} className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Input
              name="email"
              type="email"
              placeholder="email@contoh.com"
              required
              className="sm:max-w-xs"
            />
            <Select name="role" defaultValue="member">
              <SelectTrigger className="sm:w-36">
                <SelectValue placeholder="Peranan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">Member</SelectItem>
                {iAmOwner ? <SelectItem value="admin">Admin</SelectItem> : null}
              </SelectContent>
            </Select>
            <Button type="submit" disabled={invite.isPending}>
              {invite.isPending ? (
                <>
                  <Spinner data-icon="inline-start" />
                  Menghantar…
                </>
              ) : (
                "Jemput"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ahli ({detail?.members.length ?? "…"})</CardTitle>
          <CardDescription>
            Hanya owner boleh mengurus owner; workspace perlu sekurang-kurangnya satu owner.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2">
          {detail?.members.map((member) => {
            const isMe = member.user_id === me.user.id;
            const ownerTier = member.role === "owner";
            const locked = isMe || (ownerTier && !iAmOwner);
            const lastOwner = ownerTier && ownerCount <= 1;
            return (
              <div
                key={member.id}
                className="flex flex-wrap items-center gap-3 rounded-lg border px-3 py-2"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {member.name}
                    {isMe ? (
                      <span className="ml-2 text-xs text-muted-foreground">(anda)</span>
                    ) : null}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">{member.email}</p>
                </div>
                <Select
                  value={member.role}
                  onValueChange={(value) =>
                    value && updateRole.mutate({ memberId: member.id, role: value })
                  }
                  disabled={locked}
                >
                  <SelectTrigger className="w-32" size="sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    {iAmOwner ? <SelectItem value="owner">Owner</SelectItem> : null}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={locked || lastOwner}
                  title={lastOwner ? "Owner terakhir tidak boleh dibuang" : undefined}
                  onClick={() => setConfirmRemove(member)}
                >
                  Buang
                </Button>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <AlertDialog open={!!confirmRemove} onOpenChange={(open) => !open && setConfirmRemove(null)}>
        <AlertDialogTrigger className="hidden" />
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Buang {confirmRemove?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              Mereka akan kehilangan akses ke workspace ini serta-merta.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmRemove && removeMember.mutate(confirmRemove.id)}
            >
              Buang
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
