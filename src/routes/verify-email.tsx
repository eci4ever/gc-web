import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import { AuthShell } from "@/components/auth-shell";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { http } from "@/lib/api";

type VerifySearch = { token?: string };

export const Route = createFileRoute("/verify-email")({
  validateSearch: (search: Record<string, unknown>): VerifySearch => ({
    token: typeof search.token === "string" ? search.token : undefined,
  }),
  component: VerifyEmailPage,
});

function VerifyEmailPage() {
  const { token } = Route.useSearch();
  const queryClient = useQueryClient();

  const verify = useMutation({
    mutationFn: (t: string) => http.post("/api/auth/verify-email", { token: t }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });

  useEffect(() => {
    if (token) verify.mutate(token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <AuthShell title="Pengesahan email" description="Status pengesahan alamat email anda.">
      {verify.isPending ? (
        <div className="flex items-center justify-center gap-2 py-4 text-muted-foreground">
          <Spinner />
          Menyahkan…
        </div>
      ) : verify.isError ? (
        <>
          <Alert role="alert" variant="destructive">
            <AlertDescription>
              Pautan pengesahan tidak sah atau telah tamat tempoh.
            </AlertDescription>
          </Alert>
          <div className="mt-4 text-center text-sm">
            <Link
              to="/login"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Kembali ke log masuk
            </Link>
          </div>
        </>
      ) : verify.isSuccess ? (
        <>
          <Alert>
            <AlertDescription>Email anda telah disahkan. Terima kasih!</AlertDescription>
          </Alert>
          <div className="mt-4 text-center text-sm">
            <Link to="/app" className="font-medium text-primary underline-offset-4 hover:underline">
              Teruskan ke aplikasi
            </Link>
          </div>
        </>
      ) : (
        <Alert role="alert" variant="destructive">
          <AlertDescription>Tiada token pengesahan diberikan.</AlertDescription>
        </Alert>
      )}
    </AuthShell>
  );
}
