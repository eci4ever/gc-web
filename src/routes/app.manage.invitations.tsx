import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CopyIcon, XIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { http } from "@/lib/api";
import { roleLabel } from "@/lib/access";

interface InvitationInfo {
  id: string;
  email: string;
  role: string;
  status: string;
  expires_at: string;
  created_at: string;
  inviter_email: string;
}

interface OrgDetail {
  invitations: InvitationInfo[];
}

export const Route = createFileRoute("/app/manage/invitations")({
  component: InvitationsPage,
});

function InvitationsPage() {
  const queryClient = useQueryClient();

  const org = useQuery({
    queryKey: ["org"],
    queryFn: () => http.get<OrgDetail>("/api/organizations/current"),
  });

  const cancel = useMutation({
    mutationFn: (invitationId: string) => http.del(`/api/invitations/${invitationId}`),
    onSuccess: async () => {
      toast.success("Jemputan dibatalkan.");
      await queryClient.invalidateQueries({ queryKey: ["org"] });
    },
    onError: (error) => toast.error(error.message),
  });

  function copyLink(invitationId: string) {
    const url = `${window.location.origin}/accept-invitation/${invitationId}`;
    void navigator.clipboard.writeText(url);
    toast.success("Pautan jemputan disalin.");
  }

  const pending = org.data?.invitations ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Jemputan tertunggak ({pending.length})</CardTitle>
        <CardDescription>
          Salin pautan untuk dikongsi secara terus, atau batalkan jemputan yang tidak lagi
          diperlukan.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-2">
        {pending.map((invitation) => (
          <div
            key={invitation.id}
            className="flex flex-wrap items-center gap-3 rounded-lg border px-3 py-2"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{invitation.email}</p>
              <p className="truncate text-xs text-muted-foreground">
                {roleLabel(invitation.role)} · dijemput oleh {invitation.inviter_email}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => copyLink(invitation.id)}>
              <CopyIcon data-icon="inline-start" />
              Salin pautan
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => cancel.mutate(invitation.id)}
              disabled={cancel.isPending}
            >
              <XIcon data-icon="inline-start" />
              Batal
            </Button>
          </div>
        ))}
        {pending.length === 0 ? (
          <p className="text-sm text-muted-foreground">Tiada jemputan tertunggak.</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
