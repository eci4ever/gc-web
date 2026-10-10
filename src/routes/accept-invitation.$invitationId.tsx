import type { ReactNode } from "react";

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { AuthShell } from "@/components/auth-shell";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { http } from "@/lib/api";
import { requireSession } from "@/lib/guards";

interface Invitation {
  id: string;
  email: string;
  role: string;
  status: string;
  expires_at: string;
  organization_name: string;
}

export const Route = createFileRoute("/accept-invitation/$invitationId")({
  beforeLoad: async ({ context, params }) => {
    const me = await requireSession(
      context.queryClient,
      `/accept-invitation/${params.invitationId}`,
    );
    return { me };
  },
  component: AcceptInvitationPage,
});

function AcceptInvitationPage() {
  const { invitationId } = Route.useParams();
  const { me } = Route.useRouteContext();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const invitation = useQuery({
    queryKey: ["invitation", invitationId],
    queryFn: () => http.get<Invitation>(`/api/invitations/${invitationId}`),
    retry: false,
  });

  const accept = useMutation({
    mutationFn: () => http.post(`/api/invitations/${invitationId}/accept`),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["me"] });
      await navigate({ to: "/app" });
    },
  });

  if (invitation.isPending) {
    return (
      <Shell>
        <div className="flex items-center justify-center gap-2 py-4 text-muted-foreground">
          <Spinner />
          Memuatkan jemputan…
        </div>
      </Shell>
    );
  }

  if (invitation.isError) {
    return (
      <Shell title="Jemputan tidak dijumpai">
        <Alert role="alert" variant="destructive">
          <AlertDescription>Jemputan ini tidak sah atau telah dibatalkan.</AlertDescription>
        </Alert>
        <div className="mt-4 text-center text-sm">
          <Link to="/app" className="font-medium text-primary underline-offset-4 hover:underline">
            Ke aplikasi
          </Link>
        </div>
      </Shell>
    );
  }

  const invite = invitation.data;
  const emailMatch = invite.email.toLowerCase() === me?.user.email.toLowerCase();

  return (
    <Shell title={`Jemputan ke ${invite.organization_name}`}>
      <div className="grid gap-4 text-sm">
        <p className="text-muted-foreground">
          Anda dijemput sebagai <span className="font-medium text-foreground">{invite.role}</span>{" "}
          di <span className="font-medium text-foreground">{invite.organization_name}</span>.
        </p>
        {!emailMatch ? (
          <Alert role="alert" variant="destructive">
            <AlertDescription>
              Jemputan ini ditujukan kepada <strong>{invite.email}</strong>, tetapi anda log masuk
              sebagai <strong>{me?.user.email}</strong>. Log masuk dengan email yang betul untuk
              menerima jemputan ini.
            </AlertDescription>
          </Alert>
        ) : null}
        {accept.isError ? (
          <Alert role="alert" variant="destructive">
            <AlertDescription>
              {accept.error instanceof Error
                ? accept.error.message
                : "Jemputan tidak dapat diterima."}
            </AlertDescription>
          </Alert>
        ) : null}
        <Button
          onClick={() => accept.mutate()}
          disabled={!emailMatch || accept.isPending || invite.status !== "pending"}
        >
          {accept.isPending ? (
            <>
              <Spinner data-icon="inline-start" />
              Menerima…
            </>
          ) : (
            "Terima jemputan"
          )}
        </Button>
      </div>
    </Shell>
  );
}

function Shell({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <AuthShell
      title={title ?? "Jemputan"}
      description="Terima jemputan untuk menyertai workspace."
      footer={
        <Link to="/app" className="font-medium text-primary underline-offset-4 hover:underline">
          Ke aplikasi
        </Link>
      }
    >
      {children}
    </AuthShell>
  );
}
